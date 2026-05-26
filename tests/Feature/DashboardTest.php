<?php

namespace Tests\Feature;

use App\Models\PracticeSession;
use App\Models\PracticeSessionTranscript;
use App\Models\SpeakingFeedbackReport;
use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_the_login_page()
    {
        $response = $this->get(route('dashboard'));
        $response->assertRedirect(route('login'));
    }

    public function test_authenticated_users_can_visit_the_dashboard()
    {
        $user = User::factory()
            ->has(UserProfile::factory(), 'profile')
            ->create();
        $this->actingAs($user);

        $response = $this->get(route('dashboard'));
        $response->assertOk();
    }

    public function test_dashboard_shows_authenticated_user_analytics(): void
    {
        $user = User::factory()
            ->has(UserProfile::factory(), 'profile')
            ->create();
        $otherUser = User::factory()
            ->has(UserProfile::factory(), 'profile')
            ->create();

        $session = PracticeSession::factory()
            ->for($user)
            ->recorded()
            ->create([
                'title' => 'Product demo rehearsal',
            ]);
        $otherSession = PracticeSession::factory()->for($otherUser)->create();

        $transcript = PracticeSessionTranscript::factory()
            ->for($user)
            ->for($session)
            ->create();

        SpeakingFeedbackReport::factory()
            ->for($user)
            ->for($session)
            ->for($transcript, 'transcript')
            ->create([
                'overall_score' => 88,
                'weaknesses' => ['Needs a clearer opening', 'More concise close'],
            ]);

        SpeakingFeedbackReport::factory()
            ->for($otherUser)
            ->for($otherSession)
            ->create([
                'overall_score' => 20,
                'weaknesses' => ['Should not leak'],
            ]);

        $response = $this->actingAs($user)->get(route('dashboard'));

        $response
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('dashboard')
                ->where('analytics.stats.totalPracticeSessions', 1)
                ->where('analytics.stats.completedSessions', 1)
                ->where('analytics.stats.averageOverallScore', 88)
                ->where('analytics.stats.bestScore', 88)
                ->where('analytics.latestSession.title', 'Product demo rehearsal')
                ->where('analytics.mostCommonWeakness', 'Needs a clearer opening')
                ->has('analytics.recentReports', 1)
            );
    }
}
