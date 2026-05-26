<?php

namespace Tests\Feature;

use App\Jobs\ProcessPracticeSessionRecording;
use App\Models\PracticeSession;
use App\Models\PracticeSessionRecording;
use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class PracticeSessionTest extends TestCase
{
    use RefreshDatabase;

    public function test_index_shows_empty_session_history(): void
    {
        $user = $this->completedUser();

        $response = $this->actingAs($user)->get(route('practice-sessions.index'));

        $response
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('PracticeSessions/Index')
                ->has('sessions', 0)
            );
    }

    public function test_index_shows_existing_session_history(): void
    {
        $user = $this->completedUser();

        PracticeSession::factory()
            ->for($user)
            ->create([
                'title' => 'Investor pitch rehearsal',
                'topic' => 'Q3 growth story',
                'session_type' => 'presentation',
            ]);

        $response = $this->actingAs($user)->get(route('practice-sessions.index'));

        $response
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('PracticeSessions/Index')
                ->has('sessions', 1)
                ->where('sessions.0.title', 'Investor pitch rehearsal')
                ->where('sessions.0.topic', 'Q3 growth story')
                ->where('sessions.0.session_type', 'presentation')
            );
    }

    public function test_create_page_renders_setup_options(): void
    {
        $user = $this->completedUser();

        $response = $this->actingAs($user)->get(route('practice-sessions.create'));

        $response
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('PracticeSessions/Create')
                ->has('sessionTypes')
                ->has('durations')
                ->has('topicSuggestions')
            );
    }

    public function test_user_can_create_draft_practice_session(): void
    {
        $user = $this->completedUser();

        $response = $this->actingAs($user)->post(route('practice-sessions.store'), [
            'title' => 'Product demo practice',
            'topic' => 'Launch narrative for the AI coach',
            'session_type' => 'presentation',
            'target_duration_seconds' => 300,
            'objective' => 'Sound clear, confident, and concise.',
        ]);

        $session = PracticeSession::query()->firstOrFail();

        $response->assertRedirect(route('practice-sessions.show', $session));

        $this->assertSame($user->id, $session->user_id);
        $this->assertSame('draft', $session->status);
        $this->assertMatchesRegularExpression(
            '/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/',
            $session->id,
        );
        $this->assertDatabaseHas('practice_sessions', [
            'id' => $session->id,
            'title' => 'Product demo practice',
            'topic' => 'Launch narrative for the AI coach',
            'session_type' => 'presentation',
            'target_duration_seconds' => 300,
            'objective' => 'Sound clear, confident, and concise.',
            'status' => 'draft',
        ]);
    }

    public function test_practice_session_creation_validates_fields(): void
    {
        $user = $this->completedUser();

        $response = $this->actingAs($user)->post(route('practice-sessions.store'), [
            'title' => '',
            'topic' => '',
            'session_type' => 'standup_comedy',
            'target_duration_seconds' => 30,
            'objective' => '',
        ]);

        $response->assertSessionHasErrors([
            'title',
            'topic',
            'session_type',
            'target_duration_seconds',
            'objective',
        ]);
    }

    public function test_user_can_view_their_own_practice_session(): void
    {
        $user = $this->completedUser();
        $session = PracticeSession::factory()
            ->for($user)
            ->create([
                'title' => 'Interview opener',
            ]);

        $response = $this->actingAs($user)->get(route('practice-sessions.show', $session));

        $response
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('PracticeSessions/Show')
                ->where('session.id', $session->id)
                ->where('session.title', 'Interview opener')
            );
    }

    public function test_user_cannot_view_another_users_practice_session(): void
    {
        $user = $this->completedUser();
        $otherUser = $this->completedUser();
        $session = PracticeSession::factory()->for($otherUser)->create();

        $response = $this->actingAs($user)->get(route('practice-sessions.show', $session));

        $response->assertNotFound();
    }

    public function test_user_can_upload_practice_session_recording(): void
    {
        Queue::fake();
        Storage::fake('local');

        $user = $this->completedUser();
        $session = PracticeSession::factory()->for($user)->create();
        $file = UploadedFile::fake()->create('speech.webm', 1024, 'audio/webm');

        $response = $this->actingAs($user)->post(route('practice-sessions.recording.store', $session), [
            'audio' => $file,
            'duration_seconds' => 185,
        ]);

        $recording = PracticeSessionRecording::query()->firstOrFail();

        $response->assertRedirect(route('practice-sessions.show', $session));
        Queue::assertPushed(ProcessPracticeSessionRecording::class);
        Storage::disk('local')->assertExists($recording->audio_path);

        $this->assertSame('recorded', $session->fresh()->status);
        $this->assertMatchesRegularExpression(
            '/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/',
            $recording->id,
        );
        $this->assertDatabaseHas('practice_session_recordings', [
            'practice_session_id' => $session->id,
            'user_id' => $user->id,
            'original_filename' => 'speech.webm',
            'mime_type' => 'audio/webm',
            'duration_seconds' => 185,
        ]);
    }

    public function test_upload_replaces_existing_recording_file(): void
    {
        Storage::fake('local');

        $user = $this->completedUser();
        $session = PracticeSession::factory()->for($user)->recorded()->create();
        Storage::disk('local')->put('practice-session-recordings/old.webm', 'old-audio');

        PracticeSessionRecording::factory()
            ->for($user)
            ->for($session)
            ->create([
                'audio_path' => 'practice-session-recordings/old.webm',
            ]);

        $file = UploadedFile::fake()->create('replacement.webm', 512, 'audio/webm');

        $this->actingAs($user)->post(route('practice-sessions.recording.store', $session), [
            'audio' => $file,
            'duration_seconds' => 90,
        ]);

        $this->assertDatabaseCount('practice_session_recordings', 1);
        Storage::disk('local')->assertMissing('practice-session-recordings/old.webm');
        Storage::disk('local')->assertExists($session->recording()->firstOrFail()->audio_path);
    }

    public function test_user_cannot_upload_recording_to_another_users_session(): void
    {
        Storage::fake('local');

        $user = $this->completedUser();
        $otherUser = $this->completedUser();
        $session = PracticeSession::factory()->for($otherUser)->create();
        $file = UploadedFile::fake()->create('speech.webm', 1024, 'audio/webm');

        $response = $this->actingAs($user)->post(route('practice-sessions.recording.store', $session), [
            'audio' => $file,
        ]);

        $response->assertForbidden();
        $this->assertDatabaseCount('practice_session_recordings', 0);
    }

    public function test_recording_upload_validates_audio_file(): void
    {
        $user = $this->completedUser();
        $session = PracticeSession::factory()->for($user)->create();

        $response = $this->actingAs($user)->post(route('practice-sessions.recording.store', $session), [
            'audio' => UploadedFile::fake()->create('notes.txt', 12, 'text/plain'),
        ]);

        $response->assertSessionHasErrors('audio');
    }

    public function test_recording_cannot_be_uploaded_after_analysis(): void
    {
        $user = $this->completedUser();
        $session = PracticeSession::factory()
            ->for($user)
            ->create([
                'status' => 'analyzed',
            ]);

        $response = $this->actingAs($user)->post(route('practice-sessions.recording.store', $session), [
            'audio' => UploadedFile::fake()->create('speech.webm', 1024, 'audio/webm'),
        ]);

        $response->assertSessionHasErrors('audio');
        $this->assertDatabaseCount('practice_session_recordings', 0);
    }

    private function completedUser(): User
    {
        return User::factory()
            ->has(UserProfile::factory(), 'profile')
            ->create();
    }
}
