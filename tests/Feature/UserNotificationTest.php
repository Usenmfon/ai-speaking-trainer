<?php

namespace Tests\Feature;

use App\Models\PracticeSession;
use App\Models\PracticeSessionTranscript;
use App\Models\SpeakingFeedbackReport;
use App\Models\User;
use App\Models\UserProfile;
use App\Notifications\AdminCriticalUpdate;
use App\Notifications\FeedbackAnalysisCompleted;
use App\Notifications\FeedbackAnalysisFailed;
use App\Notifications\TranscriptionCompleted;
use App\Notifications\TranscriptionFailed;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Config;
use Tests\TestCase;

class UserNotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_processing_notifications_are_stored_in_database(): void
    {
        $user = $this->completedUser();
        $session = PracticeSession::factory()->for($user)->create();
        $transcript = PracticeSessionTranscript::factory()
            ->for($user)
            ->for($session, 'practiceSession')
            ->create([
                'practice_session_recording_id' => null,
            ]);
        $report = SpeakingFeedbackReport::factory()
            ->for($user)
            ->for($session, 'practiceSession')
            ->for($transcript, 'transcript')
            ->create();

        $user->notify(new TranscriptionCompleted($transcript));
        $user->notify(new TranscriptionFailed($session));
        $user->notify(new FeedbackAnalysisCompleted($report));
        $user->notify(new FeedbackAnalysisFailed($report));

        $this->assertDatabaseCount('notifications', 4);
        $this->assertDatabaseHas('notifications', [
            'notifiable_id' => $user->id,
            'type' => 'transcription_completed',
        ]);
        $this->assertDatabaseHas('notifications', [
            'notifiable_id' => $user->id,
            'type' => 'feedback_analysis_completed',
        ]);

        $notification = $user->notifications()
            ->where('type', 'feedback_analysis_completed')
            ->firstOrFail();

        $this->assertSame('Feedback ready', $notification->data['title']);
        $this->assertSame(route('feedback-reports.show', $report), $notification->data['url']);
    }

    public function test_processing_notifications_are_broadcast_with_dropdown_payloads(): void
    {
        $user = $this->completedUser();
        $session = PracticeSession::factory()->for($user)->create();
        $transcript = PracticeSessionTranscript::factory()
            ->for($user)
            ->for($session, 'practiceSession')
            ->create([
                'practice_session_recording_id' => null,
            ]);
        $report = SpeakingFeedbackReport::factory()
            ->for($user)
            ->for($session, 'practiceSession')
            ->for($transcript, 'transcript')
            ->create();

        $notifications = [
            new AdminCriticalUpdate(
                title: 'Transcription pipeline failed',
                message: 'Recording transcription failed for Test User.',
                url: route('admin.sessions.index'),
                metadata: ['practice_session_id' => $session->id],
            ),
            new TranscriptionCompleted($transcript),
            new TranscriptionFailed($session),
            new FeedbackAnalysisCompleted($report),
            new FeedbackAnalysisFailed($report),
        ];

        foreach ($notifications as $notification) {
            $this->assertContains('database', $notification->via($user));
            $this->assertContains('broadcast', $notification->via($user));
            $this->assertBroadcastPayloadMatchesDatabasePayload($notification, $user);
        }
    }

    public function test_user_notification_broadcast_channel_is_private_to_the_user(): void
    {
        Config::set('broadcasting.default', 'pusher');
        Config::set('broadcasting.connections.pusher.key', 'test-key');
        Config::set('broadcasting.connections.pusher.secret', 'test-secret');
        Config::set('broadcasting.connections.pusher.app_id', 'test-app');
        Broadcast::purge('pusher');
        Broadcast::connection('pusher')->channel('App.Models.User.{id}', function (User $user, int $id): bool {
            return $user->id === $id;
        });

        $user = $this->completedUser();
        $otherUser = $this->completedUser();

        $this->actingAs($user)
            ->post('/broadcasting/auth', [
                'socket_id' => '1234.5678',
                'channel_name' => "private-App.Models.User.{$user->id}",
            ])
            ->assertOk();

        $this->actingAs($user)
            ->post('/broadcasting/auth', [
                'socket_id' => '1234.5678',
                'channel_name' => "private-App.Models.User.{$otherUser->id}",
            ])
            ->assertForbidden();
    }

    public function test_user_can_mark_their_notification_as_read(): void
    {
        $user = $this->completedUser();
        $session = PracticeSession::factory()->for($user)->create();

        $user->notify(new TranscriptionFailed($session));

        $notification = $user->unreadNotifications()->firstOrFail();

        $response = $this->actingAs($user)->post(route('notifications.read', $notification));

        $response->assertRedirect();
        $this->assertNotNull($notification->fresh()->read_at);
    }

    public function test_user_cannot_mark_another_users_notification_as_read(): void
    {
        $user = $this->completedUser();
        $otherUser = $this->completedUser();
        $session = PracticeSession::factory()->for($otherUser)->create();

        $otherUser->notify(new TranscriptionFailed($session));

        $notification = $otherUser->unreadNotifications()->firstOrFail();

        $response = $this->actingAs($user)->post(route('notifications.read', $notification));

        $response->assertNotFound();
        $this->assertNull($notification->fresh()->read_at);
    }

    public function test_user_can_mark_all_notifications_as_read(): void
    {
        $user = $this->completedUser();
        $session = PracticeSession::factory()->for($user)->create();

        $user->notify(new TranscriptionFailed($session));
        $user->notify(new TranscriptionFailed($session));

        $response = $this->actingAs($user)->post(route('notifications.read-all'));

        $response->assertRedirect();
        $this->assertSame(0, $user->fresh()->unreadNotifications()->count());
    }

    private function completedUser(): User
    {
        return User::factory()
            ->has(UserProfile::factory(), 'profile')
            ->create();
    }

    private function assertBroadcastPayloadMatchesDatabasePayload(Notification $notification, User $user): void
    {
        $databasePayload = $notification->toDatabase($user);
        $broadcastPayload = $notification->toBroadcast($user)->data;

        foreach (['title', 'message', 'url'] as $key) {
            $this->assertSame($databasePayload[$key], $broadcastPayload[$key]);
        }

        $this->assertArrayHasKey('read_at', $broadcastPayload);
        $this->assertArrayHasKey('created_at', $broadcastPayload);
        $this->assertContains($broadcastPayload['severity'], ['critical', 'success']);
    }
}
