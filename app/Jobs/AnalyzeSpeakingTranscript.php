<?php

namespace App\Jobs;

use App\Models\PracticeSessionTranscript;
use App\Models\SpeakingFeedbackReport;
use App\Notifications\FeedbackAnalysisCompleted;
use App\Notifications\FeedbackAnalysisFailed;
use App\Services\AI\SpeakingFeedbackService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Throwable;

class AnalyzeSpeakingTranscript implements ShouldQueue
{
    use Queueable;

    public int $tries = 2;

    public int $timeout = 120;

    /**
     * Create a new job instance.
     */
    public function __construct(public string $transcriptId) {}

    /**
     * Execute the job.
     *
     * @throws Throwable
     */
    public function handle(SpeakingFeedbackService $feedback): void
    {
        $transcript = PracticeSessionTranscript::query()
            ->with(['practiceSession', 'user'])
            ->findOrFail($this->transcriptId);

        $transcript->practiceSession->forceFill([
            'status' => 'analyzing',
        ])->save();

        $report = SpeakingFeedbackReport::query()->updateOrCreate(
            ['transcript_id' => $transcript->id],
            [
                'practice_session_id' => $transcript->practice_session_id,
                'user_id' => $transcript->user_id,
                'summary_feedback' => '',
                'status' => 'processing',
                'error_message' => null,
            ],
        );

        try {
            $analysis = $feedback->analyze($transcript);

            $report->forceFill([
                ...$analysis,
                'status' => 'completed',
                'error_message' => null,
                'processed_at' => now(),
            ])->save();

            $transcript->practiceSession->forceFill([
                'status' => 'analyzed',
            ])->save();

            $transcript->user?->notify(new FeedbackAnalysisCompleted($report));
        } catch (Throwable $exception) {
            $report->forceFill([
                'status' => 'failed',
                'error_message' => $exception->getMessage(),
                'processed_at' => now(),
            ])->save();

            $transcript->practiceSession->forceFill([
                'status' => 'failed',
            ])->save();

            throw $exception;
        }

        Log::info('Speaking feedback report completed.', [
            'practice_session_id' => $transcript->practice_session_id,
            'transcript_id' => $transcript->id,
            'report_id' => $report->id,
        ]);
    }

    /**
     * Handle a job failure.
     */
    public function failed(Throwable $exception): void
    {
        $transcript = PracticeSessionTranscript::query()
            ->with(['practiceSession.feedbackReport', 'user'])
            ->find($this->transcriptId);

        $transcript?->feedbackReport?->forceFill([
            'status' => 'failed',
            'error_message' => $exception->getMessage(),
            'processed_at' => now(),
        ])->save();

        $transcript?->practiceSession?->forceFill([
            'status' => 'failed',
        ])->save();

        if ($transcript?->feedbackReport !== null) {
            $transcript->user?->notify(new FeedbackAnalysisFailed($transcript->feedbackReport));
        }

        Log::error('Speaking feedback analysis failed.', [
            'transcript_id' => $this->transcriptId,
            'exception' => $exception->getMessage(),
        ]);
    }
}
