<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class AdminCriticalUpdate extends Notification
{
    /**
     * Create a new notification instance.
     *
     * @param  array<string, mixed>  $metadata
     */
    public function __construct(
        public string $title,
        public string $message,
        public ?string $url = null,
        public array $metadata = [],
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
            'title' => $this->title,
            'message' => $this->message,
            'url' => $this->url,
            'severity' => 'critical',
            'audience' => 'admin',
            ...$this->metadata,
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
        return 'admin_critical_update';
    }

    /**
     * Get the notification's broadcast type.
     */
    public function broadcastType(): string
    {
        return 'admin_critical_update';
    }
}
