<?php

namespace App\Notifications;

use App\Models\PracticeSessionTranscript;
use Illuminate\Notifications\Notification;

class TranscriptionCompleted extends Notification
{
    /**
     * Create a new notification instance.
     */
    public function __construct(public PracticeSessionTranscript $transcript) {}

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
            'title' => 'Transcription complete',
            'message' => 'Your speech transcript is ready.',
            'practice_session_id' => $this->transcript->practice_session_id,
            'url' => route('practice-sessions.show', $this->transcript->practice_session_id),
        ];
    }

    /**
     * Get the notification's database type.
     */
    public function databaseType(object $notifiable): string
    {
        return 'transcription_completed';
    }
}
