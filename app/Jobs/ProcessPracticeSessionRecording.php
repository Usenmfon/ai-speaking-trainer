<?php

namespace App\Jobs;

use App\Contracts\AI\TranscriptionProvider;
use App\Models\PracticeSessionRecording;
use App\Models\PracticeSessionTranscript;
use App\Models\User;
use App\Notifications\AdminCriticalUpdate;
use App\Notifications\TranscriptionCompleted;
use App\Notifications\TranscriptionFailed;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;
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
    public function handle(TranscriptionProvider $transcriptionProvider): void
    {
        $recording = PracticeSessionRecording::query()
            ->with(['practiceSession', 'user'])
            ->findOrFail($this->recordingId);

        $recording->practiceSession->forceFill([
            'status' => 'transcribing',
        ])->save();

        $disk = config('practice.recordings.disk', 'local');
        $workerAudio = $this->prepareWorkerAudioPath($recording, $disk);

        try {
            $transcription = $transcriptionProvider->transcribeRecording(
                audioPath: $workerAudio['path'],
                sessionId: $recording->practice_session_id,
                recordingId: $recording->id,
                metadata: [
                    'duration_seconds' => $recording->duration_seconds,
                    'mime_type' => $recording->mime_type,
                    'size' => $recording->size,
                ],
            );
        } finally {
            if ($workerAudio['temporary_path'] !== null) {
                File::delete($workerAudio['temporary_path']);
            }
        }

        Log::info('Transcription provider processed practice session recording.', [
            'practice_session_id' => $recording->practice_session_id,
            'recording_id' => $recording->id,
            'provider' => $transcription['provider'] ?? config('ai.transcription.provider'),
        ]);

        $transcriptText = (string) ($transcription['transcript'] ?? $transcription['text'] ?? '');

        if (trim($transcriptText) === '') {
            throw new RuntimeException('Transcription provider returned an empty transcript.');
        }

        /** @var PracticeSessionTranscript $transcript */
        $transcript = $recording->practiceSession->transcript()->updateOrCreate(
            ['practice_session_id' => $recording->practice_session_id],
            [
                'user_id' => $recording->user_id,
                'practice_session_recording_id' => $recording->id,
                'text' => $transcriptText,
                'segments' => $transcription['segments'] ?? null,
                'provider' => $transcription['provider'] ?? null,
                'completed_at' => now(),
            ],
        );

        $recording->practiceSession->forceFill([
            'status' => 'transcribed',
        ])->save();

        // Feedback generation is intentionally owned by Laravel for this MVP.
        AnalyzeSpeakingTranscript::dispatch($transcript->id);

        $recording->user?->notify(new TranscriptionCompleted($transcript));
    }

    /**
     * Handle a job failure.
     */
    public function failed(Throwable $exception): void
    {
        $recording = PracticeSessionRecording::query()
            ->with(['practiceSession', 'user'])
            ->find($this->recordingId);

        $recording?->practiceSession?->forceFill([
            'status' => 'failed',
        ])->save();

        if ($recording?->practiceSession !== null) {
            $recording->user?->notify(new TranscriptionFailed($recording->practiceSession));
            $this->notifyAdmins(new AdminCriticalUpdate(
                title: 'Transcription pipeline failed',
                message: "Recording transcription failed for {$recording->user?->name}.",
                url: route('admin.sessions.index'),
                metadata: [
                    'practice_session_id' => $recording->practice_session_id,
                    'recording_id' => $recording->id,
                    'user_id' => $recording->user_id,
                    'exception' => $exception->getMessage(),
                ],
            ));
        }

        Log::error('Transcription provider failed to process practice session recording.', [
            'recording_id' => $this->recordingId,
            'exception' => $exception->getMessage(),
        ]);
    }

    private function notifyAdmins(AdminCriticalUpdate $notification): void
    {
        User::role('admin')->each(
            fn (User $admin): mixed => $admin->notify($notification),
        );
    }

    /**
     * Resolve a local file path for the transcription provider.
     *
     * R2/S3 recordings stay private. When the configured recording disk is
     * remote, this copies the object into a local temporary transcription file.
     *
     * @return array{path: string, temporary_path: string|null}
     */
    private function prepareWorkerAudioPath(PracticeSessionRecording $recording, string $disk): array
    {
        $storage = Storage::disk($disk);
        $driver = config("filesystems.disks.{$disk}.driver");

        if ($driver === 'local') {
            return [
                'path' => $storage->path($recording->audio_path),
                'temporary_path' => null,
            ];
        }

        $stream = $storage->readStream($recording->audio_path);

        if ($stream === false) {
            throw new RuntimeException('Unable to read the private recording for transcription.');
        }

        $directory = storage_path('app/private/transcription-inputs');
        File::ensureDirectoryExists($directory);

        $extension = pathinfo($recording->original_filename ?: $recording->audio_path, PATHINFO_EXTENSION) ?: 'audio';
        $temporaryPath = $directory.'/'.Str::uuid().'.'.$extension;
        $output = fopen($temporaryPath, 'wb');

        if ($output === false) {
            if (is_resource($stream)) {
                fclose($stream);
            }

            throw new RuntimeException('Unable to create a temporary worker audio file.');
        }

        try {
            stream_copy_to_stream($stream, $output);
        } finally {
            if (is_resource($stream)) {
                fclose($stream);
            }

            fclose($output);
        }

        return [
            'path' => $temporaryPath,
            'temporary_path' => $temporaryPath,
        ];
    }
}
