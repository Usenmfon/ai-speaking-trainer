<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class PracticeSessionsAwarded extends Notification
{
    /**
     * Create a new notification instance.
     */
    public function __construct(
        public int $sessionsAwarded,
        public int $sessionsRemaining,
        public string $reason = 'referral',
    ) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    /**
     * Get the database representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toDatabase(object $notifiable): array
    {
        return [
            'title' => 'Practice sessions added',
            'message' => $this->message(),
            'sessions_awarded' => $this->sessionsAwarded,
            'sessions_remaining' => $this->sessionsRemaining,
            'reason' => $this->reason,
            'url' => route('practice-sessions.create'),
            'severity' => 'success',
        ];
    }

    /**
     * Get the broadcast representation of the notification.
     */
    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            ...$this->toDatabase($notifiable),
            'read_at' => null,
            'created_at' => now()->toISOString(),
        ]);
    }

    /**
     * Get the notification's database type.
     */
    public function databaseType(object $notifiable): string
    {
        return 'practice_sessions_awarded';
    }

    /**
     * Get the notification's broadcast type.
     */
    public function broadcastType(): string
    {
        return 'practice_sessions_awarded';
    }

    /**
     * Get the user-facing notification message.
     */
    private function message(): string
    {
        if ($this->reason === 'welcome') {
            return trans_choice(
                'Your account includes :count free practice session to get started.|Your account includes :count free practice sessions to get started.',
                $this->sessionsAwarded,
                ['count' => $this->sessionsAwarded],
            );
        }

        return trans_choice(
            'A successful referral added :count free practice session to your account.|A successful referral added :count free practice sessions to your account.',
            $this->sessionsAwarded,
            ['count' => $this->sessionsAwarded],
        );
    }
}
