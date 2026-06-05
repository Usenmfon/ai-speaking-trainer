<?php

namespace App\Observers;

use App\Models\PracticeSession;
use App\Services\PracticeSessions\PracticeSessionRecordingCleanupService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PracticeSessionObserver
{
    /**
     * @var array<string, array<string, mixed>>
     */
    private static array $recordingCleanup = [];

    /**
     * Capture the recording path before database cascades remove related rows.
     */
    public function deleting(PracticeSession $practiceSession): void
    {
        $recording = $practiceSession->recording()
            ->select(['id', 'practice_session_id', 'user_id', 'audio_path'])
            ->first();

        if ($recording === null) {
            return;
        }

        self::$recordingCleanup[$practiceSession->getKey()] = [
            'path' => $recording->audio_path,
            'disk' => config('practice.recordings.disk', 'local'),
            'context' => [
                'reason' => 'practice_session_deleted',
                'recording_id' => $recording->id,
                'practice_session_id' => $practiceSession->id,
                'user_id' => $practiceSession->user_id,
            ],
        ];
    }

    /**
     * Delete the private recording file only after the session row is deleted.
     */
    public function deleted(PracticeSession $practiceSession): void
    {
        $cleanup = self::$recordingCleanup[$practiceSession->getKey()] ?? null;
        unset(self::$recordingCleanup[$practiceSession->getKey()]);

        if ($cleanup === null) {
            return;
        }

        $deleteFile = function () use ($cleanup): void {
            app(PracticeSessionRecordingCleanupService::class)->deleteRecordingPath(
                $cleanup['path'],
                $cleanup['disk'],
                $cleanup['context'],
            );
        };

        Log::info('Practice session recording cleanup scheduled.', $cleanup['context']);

        if (DB::transactionLevel() > 0) {
            DB::afterCommit($deleteFile);

            return;
        }

        $deleteFile();
    }
}
