<?php

namespace Tests\Feature;

use App\Jobs\AnalyzeSpeakingTranscript;
use App\Models\PracticeSession;
use App\Models\PracticeSessionTranscript;
use App\Models\SpeakingFeedbackReport;
use App\Models\User;
use App\Models\UserProfile;
use App\Services\AI\SpeakingFeedbackService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class SpeakingFeedbackReportTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_view_completed_feedback_report(): void
    {
        $user = $this->completedUser();
        $session = PracticeSession::factory()->for($user)->create();
        $transcript = PracticeSessionTranscript::factory()
            ->for($user)
            ->for($session)
            ->create([
                'text' => 'This is a clear practice transcript.',
            ]);

        $report = SpeakingFeedbackReport::factory()
            ->for($user)
            ->for($session)
            ->for($transcript, 'transcript')
            ->create([
                'overall_score' => 84,
                'summary_feedback' => 'Strong opening and clear next steps.',
            ]);

        $response = $this->actingAs($user)->get(route('feedback-reports.show', $report));

        $response
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('FeedbackReports/Show')
                ->where('report.overall_score', 84)
                ->where('report.summary_feedback', 'Strong opening and clear next steps.')
                ->where('report.transcript.text', 'This is a clear practice transcript.')
            );
    }

    public function test_user_can_view_feedback_report_index(): void
    {
        $user = $this->completedUser();
        $session = PracticeSession::factory()->for($user)->create([
            'title' => 'Demo practice',
        ]);
        $transcript = PracticeSessionTranscript::factory()
            ->for($user)
            ->for($session)
            ->create();

        SpeakingFeedbackReport::factory()
            ->for($user)
            ->for($session)
            ->for($transcript, 'transcript')
            ->create([
                'overall_score' => 91,
            ]);

        $response = $this->actingAs($user)->get(route('feedback-reports.index'));

        $response
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('FeedbackReports/Index')
                ->has('reports', 1)
                ->where('reports.0.overall_score', 91)
                ->where('reports.0.practice_session.title', 'Demo practice')
            );
    }

    public function test_user_cannot_view_another_users_feedback_report(): void
    {
        $user = $this->completedUser();
        $otherUser = $this->completedUser();
        $session = PracticeSession::factory()->for($otherUser)->create();
        $transcript = PracticeSessionTranscript::factory()
            ->for($otherUser)
            ->for($session)
            ->create();
        $report = SpeakingFeedbackReport::factory()
            ->for($otherUser)
            ->for($session)
            ->for($transcript, 'transcript')
            ->create();

        $response = $this->actingAs($user)->get(route('feedback-reports.show', $report));

        $response->assertForbidden();
    }

    public function test_user_cannot_view_another_users_session_feedback_report(): void
    {
        $user = $this->completedUser();
        $otherUser = $this->completedUser();
        $session = PracticeSession::factory()->for($otherUser)->create();

        $response = $this->actingAs($user)->get(route('practice-sessions.feedback-report.show', $session));

        $response->assertForbidden();
    }

    public function test_analyze_speaking_transcript_completes_report_and_session(): void
    {
        config(['speaking_feedback.provider' => 'local']);

        $user = $this->completedUser();
        $session = PracticeSession::factory()
            ->for($user)
            ->recorded()
            ->create();
        $transcript = PracticeSessionTranscript::factory()
            ->for($user)
            ->for($session)
            ->create([
                'text' => 'Um this is my product pitch. It explains the problem and the next step.',
            ]);

        (new AnalyzeSpeakingTranscript($transcript->id))->handle(new SpeakingFeedbackService);

        $this->assertSame('analyzed', $session->fresh()->status);
        $this->assertDatabaseHas('speaking_feedback_reports', [
            'practice_session_id' => $session->id,
            'user_id' => $user->id,
            'transcript_id' => $transcript->id,
            'status' => 'completed',
        ]);
    }

    private function completedUser(): User
    {
        return User::factory()
            ->has(UserProfile::factory(), 'profile')
            ->create();
    }
}
