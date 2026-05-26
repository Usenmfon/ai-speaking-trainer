<?php

namespace App\Notifications;

use App\Models\PracticeSession;
use Illuminate\Notifications\Notification;

class TranscriptionFailed extends Notification
{
    /**
     * Create a new notification instance.
     */
    public function __construct(public PracticeSession $practiceSession) {}

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
            'title' => 'Transcription failed',
            'message' => 'We could not transcribe your recording.',
            'practice_session_id' => $this->practiceSession->id,
            'url' => route('practice-sessions.show', $this->practiceSession),
        ];
    }

    /**
     * Get the notification's database type.
     */
    public function databaseType(object $notifiable): string
    {
        return 'transcription_failed';
    }
}
