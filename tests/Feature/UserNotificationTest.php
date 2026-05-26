<?php

namespace Tests\Feature;

use App\Models\PracticeSession;
use App\Models\PracticeSessionTranscript;
use App\Models\SpeakingFeedbackReport;
use App\Models\User;
use App\Models\UserProfile;
use App\Notifications\FeedbackAnalysisCompleted;
use App\Notifications\FeedbackAnalysisFailed;
use App\Notifications\TranscriptionCompleted;
use App\Notifications\TranscriptionFailed;
use Illuminate\Foundation\Testing\RefreshDatabase;
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
}
