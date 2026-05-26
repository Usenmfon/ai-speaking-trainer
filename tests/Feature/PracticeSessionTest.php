<?php

namespace Tests\Feature;

use App\Jobs\AnalyzeSpeakingTranscript;
use App\Jobs\ProcessPracticeSessionRecording;
use App\Models\PracticeSession;
use App\Models\PracticeSessionRecording;
use App\Models\PracticeSessionTranscript;
use App\Models\SpeakingFeedbackReport;
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

    public function test_practice_session_routes_require_authentication(): void
    {
        $this->get(route('practice-sessions.index'))->assertRedirect(route('login'));
        $this->get(route('practice-sessions.create'))->assertRedirect(route('login'));
    }

    public function test_index_shows_empty_session_history(): void
    {
        $user = $this->completedUser();

        $response = $this->actingAs($user)->get(route('practice-sessions.index'));

        $response
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('PracticeSessions/Index')
                ->has('sessions.data', 0)
                ->where('filters.sort', 'newest')
                ->has('filterOptions.sessionTypes')
                ->has('filterOptions.statuses')
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
                ->has('sessions.data', 1)
                ->where('sessions.data.0.title', 'Investor pitch rehearsal')
                ->where('sessions.data.0.topic', 'Q3 growth story')
                ->where('sessions.data.0.session_type', 'presentation')
            );
    }

    public function test_index_filters_searches_sorts_and_paginates_user_sessions(): void
    {
        $user = $this->completedUser();
        $otherUser = $this->completedUser();

        $matchedSession = PracticeSession::factory()
            ->for($user)
            ->create([
                'title' => 'Executive demo rehearsal',
                'topic' => 'AI roadmap pitch',
                'session_type' => 'presentation',
                'status' => 'analyzed',
                'created_at' => now()->subDay(),
            ]);

        $lowerScoreSession = PracticeSession::factory()
            ->for($user)
            ->create([
                'title' => 'Product roadmap pitch',
                'topic' => 'Leadership update',
                'session_type' => 'presentation',
                'status' => 'analyzed',
                'created_at' => now(),
            ]);

        PracticeSession::factory()
            ->for($user)
            ->create([
                'title' => 'Interview opener',
                'topic' => 'Behavioral story',
                'session_type' => 'interview',
                'status' => 'draft',
            ]);

        PracticeSession::factory()
            ->for($otherUser)
            ->create([
                'title' => 'Executive demo rehearsal',
                'topic' => 'AI roadmap pitch',
                'session_type' => 'presentation',
                'status' => 'analyzed',
            ]);

        $this->createReportForSession($matchedSession, $user, 92);
        $this->createReportForSession($lowerScoreSession, $user, 62);

        $response = $this->actingAs($user)->get(route('practice-sessions.index', [
            'search' => 'pitch',
            'session_type' => 'presentation',
            'status' => 'analyzed',
            'sort' => 'highest_score',
        ]));

        $response
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('PracticeSessions/Index')
                ->has('sessions.data', 2)
                ->where('sessions.data.0.id', $matchedSession->id)
                ->where('sessions.data.0.feedback_report.overall_score', 92)
                ->where('sessions.data.1.id', $lowerScoreSession->id)
                ->where('filters.search', 'pitch')
                ->where('filters.session_type', 'presentation')
                ->where('filters.status', 'analyzed')
                ->where('filters.sort', 'highest_score')
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

        $response->assertForbidden();
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

    public function test_user_can_retry_failed_transcription(): void
    {
        Queue::fake();

        $user = $this->completedUser();
        $session = PracticeSession::factory()
            ->for($user)
            ->failed()
            ->create();
        $recording = PracticeSessionRecording::factory()
            ->for($user)
            ->for($session)
            ->create();

        $response = $this->actingAs($user)->post(route('practice-sessions.retry-transcription', $session));

        $response->assertRedirect();
        $this->assertSame('recorded', $session->fresh()->status);
        Queue::assertPushed(
            ProcessPracticeSessionRecording::class,
            fn (ProcessPracticeSessionRecording $job): bool => $job->recordingId === $recording->id,
        );
    }

    public function test_transcription_retry_requires_failed_session(): void
    {
        Queue::fake();

        $user = $this->completedUser();
        $session = PracticeSession::factory()
            ->for($user)
            ->recorded()
            ->create();
        PracticeSessionRecording::factory()
            ->for($user)
            ->for($session)
            ->create();

        $response = $this->actingAs($user)->post(route('practice-sessions.retry-transcription', $session));

        $response->assertSessionHasErrors('retry');
        Queue::assertNotPushed(ProcessPracticeSessionRecording::class);
    }

    public function test_user_cannot_retry_transcription_for_another_users_session(): void
    {
        Queue::fake();

        $user = $this->completedUser();
        $otherUser = $this->completedUser();
        $session = PracticeSession::factory()
            ->for($otherUser)
            ->failed()
            ->create();
        PracticeSessionRecording::factory()
            ->for($otherUser)
            ->for($session)
            ->create();

        $response = $this->actingAs($user)->post(route('practice-sessions.retry-transcription', $session));

        $response->assertForbidden();
        Queue::assertNotPushed(ProcessPracticeSessionRecording::class);
    }

    public function test_user_can_retry_failed_feedback_analysis(): void
    {
        Queue::fake();

        $user = $this->completedUser();
        $session = PracticeSession::factory()
            ->for($user)
            ->failed()
            ->create();
        $report = $this->createReportForSession($session, $user, 41);
        $report->forceFill([
            'status' => 'failed',
            'error_message' => 'AI provider timed out.',
            'processed_at' => now(),
        ])->save();

        $response = $this->actingAs($user)->post(route('practice-sessions.retry-analysis', $session));

        $response->assertRedirect();
        $this->assertSame('transcribed', $session->fresh()->status);
        $this->assertSame('processing', $report->fresh()->status);
        $this->assertNull($report->fresh()->error_message);
        $this->assertNull($report->fresh()->processed_at);
        Queue::assertPushed(
            AnalyzeSpeakingTranscript::class,
            fn (AnalyzeSpeakingTranscript $job): bool => $job->transcriptId === $report->transcript_id,
        );
    }

    public function test_analysis_retry_prevents_duplicate_processing_retry(): void
    {
        Queue::fake();

        $user = $this->completedUser();
        $session = PracticeSession::factory()
            ->for($user)
            ->failed()
            ->create();
        $report = $this->createReportForSession($session, $user, 41);
        $report->forceFill([
            'status' => 'processing',
            'error_message' => null,
            'processed_at' => null,
        ])->save();

        $response = $this->actingAs($user)->post(route('practice-sessions.retry-analysis', $session));

        $response->assertSessionHasErrors('retry');
        Queue::assertNotPushed(AnalyzeSpeakingTranscript::class);
    }

    private function completedUser(): User
    {
        return User::factory()
            ->has(UserProfile::factory(), 'profile')
            ->create();
    }

    private function createReportForSession(PracticeSession $session, User $user, int $score): SpeakingFeedbackReport
    {
        $transcript = PracticeSessionTranscript::factory()
            ->for($user)
            ->for($session, 'practiceSession')
            ->create([
                'practice_session_recording_id' => null,
            ]);

        return SpeakingFeedbackReport::factory()
            ->for($user)
            ->for($session, 'practiceSession')
            ->for($transcript, 'transcript')
            ->create([
                'overall_score' => $score,
            ]);
    }
}
