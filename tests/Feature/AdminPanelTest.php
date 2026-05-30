<?php

namespace Tests\Feature;

use App\Models\PracticeSession;
use App\Models\PracticeSessionRecording;
use App\Models\PracticeSessionTranscript;
use App\Models\SpeakingFeedbackReport;
use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class AdminPanelTest extends TestCase
{
    use RefreshDatabase;

    public function test_non_admin_user_cannot_access_admin_panel(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get(route('admin.dashboard'));

        $response->assertForbidden();
    }

    public function test_non_admin_user_cannot_access_admin_management_sections(): void
    {
        $user = User::factory()->create();

        foreach ($this->adminManagementRoutes() as $route) {
            $this->actingAs($user)
                ->get(route($route))
                ->assertForbidden();
        }
    }

    public function test_admin_can_view_dashboard_metrics(): void
    {
        $admin = User::factory()->admin()->create();
        $user = User::factory()->create();

        PracticeSession::factory()->for($user)->recorded()->create();
        PracticeSession::factory()->for($user)->create([
            'status' => 'analyzed',
        ]);

        $failedTranscription = PracticeSession::factory()
            ->for($user)
            ->failed()
            ->create();
        PracticeSessionRecording::factory()
            ->for($user)
            ->for($failedTranscription)
            ->create();

        $failedAnalysis = PracticeSession::factory()
            ->for($user)
            ->failed()
            ->create();
        $this->createReportForSession($failedAnalysis, $user, 'failed');

        $response = $this->actingAs($admin)->get(route('admin.dashboard'));

        $response
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Admin/Dashboard')
                ->where('stats.totalUsers', 2)
                ->where('stats.totalPracticeSessions', 4)
                ->where('stats.completedSessions', 2)
                ->where('stats.failedTranscriptions', 1)
                ->where('stats.failedAnalyses', 1)
                ->has('recentSessions')
            );
    }

    public function test_admin_can_view_users_index(): void
    {
        $admin = User::factory()->admin()->create([
            'created_at' => now()->subDays(2),
        ]);
        UserProfile::factory()->for($admin)->create();

        $user = User::factory()->create([
            'name' => 'Jordan Speaker',
            'email' => 'jordan@example.com',
            'created_at' => now(),
        ]);
        UserProfile::factory()->for($user)->incomplete()->create();
        PracticeSession::factory()->for($user)->count(2)->create();

        $response = $this->actingAs($admin)->get(route('admin.users.index'));

        $response
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Admin/Users/Index')
                ->has('users.data', 2)
                ->where('users.data.0.name', 'Jordan Speaker')
                ->where('users.data.0.email', 'jordan@example.com')
                ->where('users.data.0.profile.onboarding_completed', false)
                ->where('users.data.0.practice_sessions_count', 2)
            );
    }

    public function test_admin_can_view_sessions_index(): void
    {
        $admin = User::factory()->admin()->create();
        $user = User::factory()->create([
            'name' => 'Avery Coach',
        ]);
        $session = PracticeSession::factory()
            ->for($user)
            ->create([
                'title' => 'Board update rehearsal',
                'status' => 'failed',
            ]);
        $this->createReportForSession($session, $user, 'failed');

        $response = $this->actingAs($admin)->get(route('admin.sessions.index'));

        $response
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Admin/Sessions/Index')
                ->has('sessions.data', 1)
                ->where('sessions.data.0.user.name', 'Avery Coach')
                ->where('sessions.data.0.title', 'Board update rehearsal')
                ->where('sessions.data.0.status', 'failed')
                ->where('sessions.data.0.feedback_report.status', 'failed')
            );
    }

    public function test_admin_can_view_management_sections(): void
    {
        $admin = User::factory()->admin()->create();

        foreach ($this->adminManagementRoutes() as $route) {
            $this->actingAs($admin)
                ->get(route($route))
                ->assertOk()
                ->assertInertia(fn (AssertableInertia $page) => $page
                    ->component('Admin/ManagementSection')
                    ->has('section.title')
                    ->has('section.eyebrow')
                    ->has('section.description')
                    ->has('section.items')
                );
        }
    }

    /**
     * @return list<string>
     */
    private function adminManagementRoutes(): array
    {
        return [
            'admin.content.index',
            'admin.processing.index',
            'admin.notifications.index',
            'admin.settings.index',
            'admin.audit-logs.index',
        ];
    }

    private function createReportForSession(PracticeSession $session, User $user, string $status): SpeakingFeedbackReport
    {
        $transcript = PracticeSessionTranscript::factory()
            ->for($user)
            ->for($session, 'practiceSession')
            ->create([
                'practice_session_recording_id' => null,
            ]);

        return SpeakingFeedbackReport::factory()
            ->for($user)
            ->for($session, 'practiceSession')
            ->for($transcript, 'transcript')
            ->create([
                'status' => $status,
                'error_message' => $status === 'failed' ? 'Analysis failed.' : null,
            ]);
    }
}
