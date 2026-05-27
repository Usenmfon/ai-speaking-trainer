<?php

namespace Tests\Feature;

use App\Jobs\AnalyzeSpeakingTranscript;
use App\Jobs\ProcessPracticeSessionRecording;
use App\Models\PracticeSession;
use App\Models\PracticeSessionRecording;
use App\Models\PracticeSessionTranscript;
use App\Models\User;
use App\Models\UserProfile;
use App\Services\AiWorker\AiWorkerClient;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Tests\Fakes\FakeAiWorkerClient;
use Tests\TestCase;
use Throwable;

class AiWorkerPipelineTest extends TestCase
{
    use RefreshDatabase;

    public function test_successful_worker_response_stores_transcript_and_dispatches_analysis(): void
    {
        Queue::fake();
        Storage::fake('local');

        $user = $this->completedUser();
        $session = PracticeSession::factory()->for($user)->create();
        $file = UploadedFile::fake()->create('speech.webm', 512, 'audio/webm');

        $this->actingAs($user)->post(route('practice-sessions.recording.store', $session), [
            'audio' => $file,
            'duration_seconds' => 42,
        ])->assertRedirect(route('practice-sessions.show', $session));

        $recording = PracticeSessionRecording::query()->firstOrFail();
        $this->instance(
            AiWorkerClient::class,
            FakeAiWorkerClient::transcript('Hello team, today I will present the roadmap.', [
                ['start' => 0.0, 'end' => 2.5, 'text' => 'Hello team'],
            ]),
        );

        (new ProcessPracticeSessionRecording($recording->id))->handle(app(AiWorkerClient::class));

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
        $session = PracticeSession::factory()->for($user)->recorded()->create();
        $recording = $this->recordingFor($session, $user);
        $this->instance(AiWorkerClient::class, FakeAiWorkerClient::failure('OpenAI transcription failed.'));

        $this->runFailedRecordingJob($recording, app(AiWorkerClient::class));

        $this->assertSame('failed', $session->fresh()->status);
        $this->assertDatabaseCount('practice_session_transcripts', 0);
        $this->assertDatabaseHas('notifications', [
            'notifiable_id' => $user->id,
            'type' => 'transcription_failed',
        ]);
        Log::shouldHaveReceived('error')
            ->with('AI worker failed to process practice session recording.', \Mockery::type('array'))
            ->once();
    }

    public function test_invalid_worker_json_is_logged_and_marks_session_failed(): void
    {
        Log::spy();
        Storage::fake('local');

        $user = $this->completedUser();
        $session = PracticeSession::factory()->for($user)->recorded()->create();
        $recording = $this->recordingFor($session, $user);
        $this->instance(AiWorkerClient::class, FakeAiWorkerClient::invalidJson());

        $this->runFailedRecordingJob($recording, app(AiWorkerClient::class));

        $this->assertSame('failed', $session->fresh()->status);
        $this->assertDatabaseCount('practice_session_transcripts', 0);
        Log::shouldHaveReceived('error')
            ->withArgs(fn (string $message, array $context): bool => $message === 'AI worker failed to process practice session recording.'
                && str_contains($context['exception'], 'invalid JSON'))
            ->once();
    }

    public function test_empty_successful_transcript_is_treated_as_failure(): void
    {
        Log::spy();
        Storage::fake('local');

        $user = $this->completedUser();
        $session = PracticeSession::factory()->for($user)->recorded()->create();
        $recording = $this->recordingFor($session, $user);
        $this->instance(AiWorkerClient::class, FakeAiWorkerClient::transcript('   '));

        $this->runFailedRecordingJob($recording, app(AiWorkerClient::class));

        $this->assertSame('failed', $session->fresh()->status);
        $this->assertDatabaseCount('practice_session_transcripts', 0);
        $this->assertDatabaseHas('notifications', [
            'notifiable_id' => $user->id,
            'type' => 'transcription_failed',
        ]);
        Log::shouldHaveReceived('error')
            ->withArgs(fn (string $message, array $context): bool => $message === 'AI worker failed to process practice session recording.'
                && $context['exception'] === 'AI worker returned an empty transcript.')
            ->once();
    }

    public function test_user_cannot_trigger_processing_for_another_users_session(): void
    {
        Queue::fake();

        $user = $this->completedUser();
        $otherUser = $this->completedUser();
        $session = PracticeSession::factory()->for($otherUser)->failed()->create();
        PracticeSessionRecording::factory()->for($otherUser)->for($session)->create();

        $this->actingAs($user)
            ->post(route('practice-sessions.retry-transcription', $session))
            ->assertForbidden();

        Queue::assertNotPushed(ProcessPracticeSessionRecording::class);
    }

    private function runFailedRecordingJob(PracticeSessionRecording $recording, AiWorkerClient $worker): void
    {
        $job = new ProcessPracticeSessionRecording($recording->id);

        try {
            $job->handle($worker);
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

        return PracticeSessionRecording::factory()
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
        return User::factory()
            ->has(UserProfile::factory(), 'profile')
            ->create();
    }
}
