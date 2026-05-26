<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;
use Inertia\Inertia;

class NotificationController extends Controller
{
    /**
     * Mark a notification as read.
     */
    public function read(Request $request, DatabaseNotification $notification): RedirectResponse
    {
        abort_unless(
            $notification->notifiable_type === $request->user()::class
            && (int) $notification->notifiable_id === $request->user()->id,
            404,
        );

        $notification->markAsRead();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Notification marked as read.')]);

        return back();
    }

    /**
     * Mark all notifications as read.
     */
    public function readAll(Request $request): RedirectResponse
    {
        $request->user()->unreadNotifications()->update([
            'read_at' => now(),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Notifications marked as read.')]);

        return back();
    }
}
