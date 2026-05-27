<?php

namespace App\Services\PracticeSessions;

use App\Models\PracticeSession;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Throwable;

class PracticeSessionRecordingCleanupService
{
    /**
     * Delete stale transcript and feedback rows when a recording is replaced.
     */
    public function deleteStaleAnalysis(PracticeSession $practiceSession, string $reason): void
    {
        $deletedReports = (int) $practiceSession->feedbackReport()->delete();
        $deletedTranscripts = (int) $practiceSession->transcript()->delete();

        if ($deletedReports === 0 && $deletedTranscripts === 0) {
            return;
        }

        Log::info('Practice session stale analysis cleaned up.', [
            'reason' => $reason,
            'practice_session_id' => $practiceSession->id,
            'user_id' => $practiceSession->user_id,
            'deleted_reports' => $deletedReports,
            'deleted_transcripts' => $deletedTranscripts,
        ]);
    }

    /**
     * Delete a recording file from the configured private recording disk.
     *
     * @param  array<string, mixed>  $context
     */
    public function deleteRecordingPath(?string $path, ?string $disk = null, array $context = []): void
    {
        if ($path === null || $path === '') {
            return;
        }

        $disk ??= config('practice.recordings.disk', 'local');

        try {
            $storage = Storage::disk($disk);

            if (! $storage->exists($path)) {
                Log::info('Recording file cleanup skipped because the file is missing.', [
                    ...$context,
                    'disk' => $disk,
                    'path' => $path,
                ]);

                return;
            }

            $storage->delete($path);

            Log::info('Recording file cleaned up.', [
                ...$context,
                'disk' => $disk,
                'path' => $path,
            ]);
        } catch (Throwable $exception) {
            Log::warning('Recording file cleanup failed.', [
                ...$context,
                'disk' => $disk,
                'path' => $path,
                'error' => $exception->getMessage(),
            ]);
        }
    }
}
