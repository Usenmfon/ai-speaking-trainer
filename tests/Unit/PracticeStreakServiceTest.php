<?php

namespace Tests\Unit;

use App\Models\PracticeSession;
use App\Models\User;
use App\Services\PracticeStreakService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PracticeStreakServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_summary_tracks_current_and_longest_streaks(): void
    {
        $this->travelTo(now()->setDate(2026, 7, 25)->startOfDay());

        $user = User::factory()->create();

        $this->completedSession($user, now());
        $this->completedSession($user, now()->subDay());
        $this->completedSession($user, now()->subDays(2));
        $this->completedSession($user, now()->subDays(2)->addHour());
        $this->completedSession($user, now()->subDays(5));
        $this->completedSession($user, now()->subDays(6));
        $this->completedSession($user, now()->subDays(7));
        $this->completedSession($user, now()->subDays(8));

        $summary = app(PracticeStreakService::class)->summary($user->id);

        $this->assertSame(3, $summary['current']);
        $this->assertSame(4, $summary['longest']);
        $this->assertTrue($summary['practiced_today']);
        $this->assertSame(now()->toDateString(), $summary['last_practice_date']);
        $this->assertCount(7, $summary['week']);
    }

    public function test_current_streak_stays_active_when_last_practice_was_yesterday(): void
    {
        $this->travelTo(now()->setDate(2026, 7, 25)->startOfDay());

        $user = User::factory()->create();

        $this->completedSession($user, now()->subDay());
        $this->completedSession($user, now()->subDays(2));

        $summary = app(PracticeStreakService::class)->summary($user->id);

        $this->assertSame(2, $summary['current']);
        $this->assertFalse($summary['practiced_today']);
        $this->assertSame(now()->subDay()->toDateString(), $summary['last_practice_date']);
    }

    public function test_empty_summary_has_zero_streaks(): void
    {
        $user = User::factory()->create();

        $summary = app(PracticeStreakService::class)->summary($user->id);

        $this->assertSame(0, $summary['current']);
        $this->assertSame(0, $summary['longest']);
        $this->assertFalse($summary['practiced_today']);
        $this->assertNull($summary['last_practice_date']);
    }

    private function completedSession(User $user, mixed $completedAt): PracticeSession
    {
        return PracticeSession::factory()
            ->for($user)
            ->create([
                'status' => 'recorded',
                'completed_at' => $completedAt,
            ]);
    }
}
