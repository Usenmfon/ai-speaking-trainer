<?php

namespace App\Http\Controllers;

use App\Http\Requests\PracticeSession\StorePracticeSessionRecordingRequest;
use App\Jobs\ProcessPracticeSessionRecording;
use App\Models\PracticeSession;
use App\Models\PracticeSessionRecording;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Throwable;

class PracticeSessionRecordingController extends Controller
{
    /**
     * Store or replace the audio recording for a practice session.
     *
     * @throws Throwable
     */
    public function store(
        StorePracticeSessionRecordingRequest $request,
        PracticeSession $practiceSession,
    ): RedirectResponse {
        $disk = config('practice.recordings.disk', 'local');

        /** @var UploadedFile|null $file */
        $file = $request->file('audio');

        if (! $file instanceof UploadedFile) {
            throw ValidationException::withMessages([
                'audio' => __('Please attach an audio recording.'),
            ]);
        }

        $path = $file->store("practice-session-recordings/{$request->user()->id}", $disk);

        if (! is_string($path)) {
            throw ValidationException::withMessages([
                'audio' => __('The audio recording could not be stored. Please try again.'),
            ]);
        }

        $previousPath = null;

        try {
            DB::transaction(function () use ($file, $path, $practiceSession, $request, &$previousPath): void {
                $existingRecording = $practiceSession->recording()->first();
                $previousPath = $existingRecording?->audio_path;

                $practiceSession->recording()->updateOrCreate(
                    ['practice_session_id' => $practiceSession->id],
                    [
                        'user_id' => $request->user()->id,
                        'audio_path' => $path,
                        'original_filename' => $file->getClientOriginalName(),
                        'mime_type' => $file->getMimeType() ?? $file->getClientMimeType(),
                        'size' => $file->getSize(),
                        'duration_seconds' => $request->integer('duration_seconds') ?: null,
                        'uploaded_at' => now(),
                    ],
                );

                $practiceSession->forceFill([
                    'status' => 'recorded',
                    'completed_at' => now(),
                ])->save();
            });
        } catch (Throwable $exception) {
            Storage::disk($disk)->delete($path);

            throw $exception;
        }

        if ($previousPath !== null && $previousPath !== $path) {
            Storage::disk($disk)->delete($previousPath);
        }

        /** @var PracticeSessionRecording $recording */
        $recording = $practiceSession->recording()->firstOrFail();

        ProcessPracticeSessionRecording::dispatch($recording->id);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Recording uploaded.')]);

        return to_route('practice-sessions.show', $practiceSession);
    }
}
