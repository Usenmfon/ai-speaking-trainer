<?php

namespace App\Jobs;

use App\Models\PracticeSessionRecording;
use App\Services\AiWorker\AiWorkerClient;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Throwable;

class ProcessPracticeSessionRecording implements ShouldQueue
{
    use Queueable;

    public int $tries = 2;

    public int $timeout = 360;

    /**
     * Create a new job instance.
     */
    public function __construct(public string $recordingId) {}

    /**
     * Execute the job.
     *
     * @throws Throwable
     */
    public function handle(AiWorkerClient $worker): void
    {
        $recording = PracticeSessionRecording::query()
            ->with('practiceSession')
            ->findOrFail($this->recordingId);

        $disk = config('practice.recordings.disk', 'local');
        $audioPath = Storage::disk($disk)->path($recording->audio_path);

        $response = $worker->processRecording(
            audioPath: $audioPath,
            sessionId: $recording->practice_session_id,
            recordingId: $recording->id,
            metadata: [
                'duration_seconds' => $recording->duration_seconds,
                'mime_type' => $recording->mime_type,
                'size' => $recording->size,
            ],
        );

        Log::info('AI worker processed practice session recording.', [
            'practice_session_id' => $recording->practice_session_id,
            'recording_id' => $recording->id,
            'response' => $response,
        ]);

        $recording->practiceSession->forceFill([
            'status' => 'analyzed',
        ])->save();
    }

    /**
     * Handle a job failure.
     */
    public function failed(Throwable $exception): void
    {
        $recording = PracticeSessionRecording::query()
            ->with('practiceSession')
            ->find($this->recordingId);

        $recording?->practiceSession?->forceFill([
            'status' => 'failed',
        ])->save();

        Log::error('AI worker failed to process practice session recording.', [
            'recording_id' => $this->recordingId,
            'exception' => $exception->getMessage(),
        ]);
    }
}
