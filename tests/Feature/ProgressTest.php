<?php

namespace Tests\Feature;

use App\Models\PracticeSession;
use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class ProgressTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_login(): void
    {
        $response = $this->get(route('progress'));

        $response->assertRedirect(route('login'));
    }

    public function test_authenticated_users_can_view_progress_page(): void
    {
        $user = User::factory()
            ->has(UserProfile::factory(), 'profile')
            ->create();

        PracticeSession::factory()
            ->for($user)
            ->recorded()
            ->create(['completed_at' => now()]);
        PracticeSession::factory()
            ->for($user)
            ->recorded()
            ->create(['completed_at' => now()->subDay()]);

        $response = $this->actingAs($user)->get(route('progress'));

        $response
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('progress')
                ->where('streak.current', 2)
                ->where('streak.longest', 2)
                ->where('streak.practiced_today', true)
                ->has('streak.week', 7)
            );
    }
}
