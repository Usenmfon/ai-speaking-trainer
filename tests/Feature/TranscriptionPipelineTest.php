<?php

namespace Tests\Feature;

use App\Contracts\AI\TranscriptionProvider;
use App\Jobs\AnalyzeSpeakingTranscript;
use App\Jobs\ProcessPracticeSessionRecording;
use App\Models\PracticeSession;
use App\Models\PracticeSessionRecording;
use App\Models\PracticeSessionTranscript;
use App\Models\User;
use Database\Factories\PracticeSessionFactory;
use Database\Factories\PracticeSessionRecordingFactory;
use Database\Factories\UserProfileFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Tests\Fakes\FakeTranscriptionProvider;
use Tests\TestCase;
use Throwable;

class TranscriptionPipelineTest extends TestCase
{
    use RefreshDatabase;

    public function test_successful_worker_response_stores_transcript_and_dispatches_analysis(): void
    {
        Queue::fake();
        Storage::fake('local');

        $user = $this->completedUser();
        $session = PracticeSessionFactory::new()->for($user)->create();
        $file = UploadedFile::fake()->create('speech.webm', 512, 'audio/webm');

        $this->actingAs($user)->post(route('practice-sessions.recording.store', $session), [
            'audio' => $file,
            'duration_seconds' => 42,
        ])->assertRedirect(route('practice-sessions.show', $session));

        $recording = PracticeSessionRecording::query()->firstOrFail();
        $provider = FakeTranscriptionProvider::transcript('Hello team, today I will present the roadmap.', [
            ['start' => 0.0, 'end' => 2.5, 'text' => 'Hello team'],
        ]);

        (new ProcessPracticeSessionRecording($recording->id))->handle($provider);

        $transcript = PracticeSessionTranscript::query()->firstOrFail();

        $this->assertSame('transcribed', $session->fresh()->status);
        $this->assertSame($recording->id, $transcript->practice_session_recording_id);
        $this->assertSame('Hello team, today I will present the roadmap.', $transcript->text);
        $this->assertSame('openai', $transcript->provider);
        Queue::assertPushed(
            AnalyzeSpeakingTranscript::class,
            fn (AnalyzeSpeakingTranscript $job): bool => $job->transcriptId === $transcript->id,
        );
    }

    public function test_worker_failure_marks_session_failed_and_creates_notification(): void
    {
        Log::spy();
        Storage::fake('local');

        $user = $this->completedUser();
        $session = PracticeSessionFactory::new()->for($user)->recorded()->create();
        $recording = $this->recordingFor($session, $user);
        $provider = FakeTranscriptionProvider::failure('OpenAI transcription failed.');

        $this->runFailedRecordingJob($recording, $provider);

        $this->assertSame('failed', $session->fresh()->status);
        $this->assertDatabaseCount('practice_session_transcripts', 0);
        $this->assertDatabaseHas('notifications', [
            'notifiable_id' => $user->id,
            'type' => 'transcription_failed',
        ]);
        Log::shouldHaveReceived('error')
            ->with('Transcription provider failed to process practice session recording.', \Mockery::type('array'))
            ->once();
    }

    public function test_invalid_transcription_provider_response_is_logged_and_marks_session_failed(): void
    {
        Log::spy();
        Storage::fake('local');

        $user = $this->completedUser();
        $session = PracticeSessionFactory::new()->for($user)->recorded()->create();
        $recording = $this->recordingFor($session, $user);
        $provider = FakeTranscriptionProvider::invalidResponse();

        $this->runFailedRecordingJob($recording, $provider);

        $this->assertSame('failed', $session->fresh()->status);
        $this->assertDatabaseCount('practice_session_transcripts', 0);
        Log::shouldHaveReceived('error')->once();
    }

    public function test_empty_successful_transcript_is_treated_as_failure(): void
    {
        Log::spy();
        Storage::fake('local');

        $user = $this->completedUser();
        $session = PracticeSessionFactory::new()->for($user)->recorded()->create();
        $recording = $this->recordingFor($session, $user);
        $provider = FakeTranscriptionProvider::transcript('   ');

        $this->runFailedRecordingJob($recording, $provider);

        $this->assertSame('failed', $session->fresh()->status);
        $this->assertDatabaseCount('practice_session_transcripts', 0);
        $this->assertDatabaseHas('notifications', [
            'notifiable_id' => $user->id,
            'type' => 'transcription_failed',
        ]);
        Log::shouldHaveReceived('error')->once();
    }

    public function test_user_cannot_trigger_processing_for_another_users_session(): void
    {
        Queue::fake();

        $user = $this->completedUser();
        $otherUser = $this->completedUser();
        $session = PracticeSessionFactory::new()->for($otherUser)->failed()->create();
        PracticeSessionRecordingFactory::new()->for($otherUser)->for($session)->create();

        $this->actingAs($user)
            ->post(route('practice-sessions.retry-transcription', $session))
            ->assertForbidden();

        Queue::assertNotPushed(ProcessPracticeSessionRecording::class);
    }

    private function runFailedRecordingJob(PracticeSessionRecording $recording, TranscriptionProvider $provider): void
    {
        $job = new ProcessPracticeSessionRecording($recording->id);

        try {
            $job->handle($provider);
        } catch (Throwable $exception) {
            $this->assertInstanceOf(RuntimeException::class, $exception);
            $job->failed($exception);

            return;
        }

        $this->fail('The recording job did not fail as expected.');
    }

    private function recordingFor(PracticeSession $session, User $user): PracticeSessionRecording
    {
        Storage::disk('local')->put("practice-session-recordings/{$session->id}.webm", 'audio');

        return PracticeSessionRecordingFactory::new()
            ->for($user)
            ->for($session)
            ->create([
                'audio_path' => "practice-session-recordings/{$session->id}.webm",
                'mime_type' => 'audio/webm',
                'duration_seconds' => 42,
            ]);
    }

    private function completedUser(): User
    {
        $user = User::factory()->create();

        UserProfileFactory::new()
            ->for($user)
            ->create();

        return $user;
    }
}
