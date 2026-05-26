<?php

namespace App\Notifications;

use App\Models\SpeakingFeedbackReport;
use Illuminate\Notifications\Notification;

class FeedbackAnalysisFailed extends Notification
{
    /**
     * Create a new notification instance.
     */
    public function __construct(public SpeakingFeedbackReport $report) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the database representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toDatabase(object $notifiable): array
    {
        return [
            'title' => 'Feedback analysis failed',
            'message' => 'We could not generate your AI feedback.',
            'practice_session_id' => $this->report->practice_session_id,
            'report_id' => $this->report->id,
            'url' => route('practice-sessions.show', $this->report->practice_session_id),
        ];
    }

    /**
     * Get the notification's database type.
     */
    public function databaseType(object $notifiable): string
    {
        return 'feedback_analysis_failed';
    }
}
