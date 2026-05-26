<?php

namespace App\Http\Controllers;

use App\Jobs\AnalyzeSpeakingTranscript;
use App\Jobs\ProcessPracticeSessionRecording;
use App\Models\PracticeSession;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class PracticeSessionRetryController extends Controller
{
    /**
     * Retry transcription for a failed practice session recording.
     *
     * @throws ValidationException
     */
    public function transcription(Request $request, PracticeSession $practiceSession): RedirectResponse
    {
        abort_unless($practiceSession->user_id === $request->user()->id, 404);

        $practiceSession->load(['recording', 'transcript', 'feedbackReport']);

        if ($practiceSession->status !== 'failed') {
            throw ValidationException::withMessages([
                'retry' => __('This session is already being processed or is not eligible for transcription retry.'),
            ]);
        }

        if ($practiceSession->recording === null) {
            throw ValidationException::withMessages([
                'retry' => __('A recording is required before transcription can be retried.'),
            ]);
        }

        if ($practiceSession->transcript !== null || $practiceSession->feedbackReport !== null) {
            throw ValidationException::withMessages([
                'retry' => __('Transcription already completed for this session. Retry feedback analysis instead.'),
            ]);
        }

        $practiceSession->forceFill([
            'status' => 'recorded',
        ])->save();

        Log::info('Practice session transcription retry requested.', [
            'practice_session_id' => $practiceSession->id,
            'recording_id' => $practiceSession->recording->id,
            'user_id' => $request->user()->id,
        ]);

        ProcessPracticeSessionRecording::dispatch($practiceSession->recording->id);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Transcription retry queued.')]);

        return back();
    }

    /**
     * Retry feedback analysis for a failed feedback report.
     *
     * @throws ValidationException
     */
    public function analysis(Request $request, PracticeSession $practiceSession): RedirectResponse
    {
        abort_unless($practiceSession->user_id === $request->user()->id, 404);

        $practiceSession->load(['transcript', 'feedbackReport']);

        if ($practiceSession->status !== 'failed') {
            throw ValidationException::withMessages([
                'retry' => __('This session is already being processed or is not eligible for analysis retry.'),
            ]);
        }

        if ($practiceSession->transcript === null) {
            throw ValidationException::withMessages([
                'retry' => __('A completed transcript is required before analysis can be retried.'),
            ]);
        }

        if ($practiceSession->feedbackReport === null || $practiceSession->feedbackReport->status !== 'failed') {
            throw ValidationException::withMessages([
                'retry' => __('Only failed feedback reports can be retried.'),
            ]);
        }

        $practiceSession->feedbackReport->forceFill([
            'status' => 'processing',
            'error_message' => null,
            'processed_at' => null,
        ])->save();

        $practiceSession->forceFill([
            'status' => 'recorded',
        ])->save();

        Log::info('Practice session feedback analysis retry requested.', [
            'practice_session_id' => $practiceSession->id,
            'transcript_id' => $practiceSession->transcript->id,
            'report_id' => $practiceSession->feedbackReport->id,
            'user_id' => $request->user()->id,
        ]);

        AnalyzeSpeakingTranscript::dispatch($practiceSession->transcript->id);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Feedback analysis retry queued.')]);

        return back();
    }
}
