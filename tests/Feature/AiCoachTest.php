<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class AiCoachTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_login(): void
    {
        $response = $this->get(route('ai-coach'));

        $response->assertRedirect(route('login'));
    }

    public function test_authenticated_users_can_view_ai_coach_page(): void
    {
        $user = User::factory()
            ->has(UserProfile::factory(), 'profile')
            ->create();

        $response = $this->actingAs($user)->get(route('ai-coach'));

        $response
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('ai-coach')
            );
    }
}
