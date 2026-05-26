<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class UserProfileOnboardingTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_receives_uuid7_public_id(): void
    {
        $user = User::factory()->create();

        $this->assertIsString($user->public_id);
        $this->assertMatchesRegularExpression(
            '/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/',
            $user->public_id,
        );
    }

    public function test_user_without_completed_profile_is_redirected_from_dashboard(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get(route('dashboard'));

        $response->assertRedirect(route('user-profile.complete'));
    }

    public function test_complete_profile_page_renders_for_incomplete_user(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get(route('user-profile.complete'));

        $response
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('profile/complete')
                ->has('speakingLevels')
                ->has('mainGoals')
            );
    }

    public function test_user_can_complete_profile(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post(route('user-profile.store'), [
            'full_name' => 'Ada Lovelace',
            'speaking_level' => 'intermediate',
            'main_goal' => 'presentations',
            'preferred_language' => 'English',
            'bio' => 'Preparing for product demos and investor updates.',
        ]);

        $response->assertRedirect(route('dashboard'));

        $this->assertDatabaseHas('user_profiles', [
            'user_id' => $user->id,
            'full_name' => 'Ada Lovelace',
            'speaking_level' => 'intermediate',
            'main_goal' => 'presentations',
            'preferred_language' => 'English',
            'onboarding_completed' => true,
        ]);
    }

    public function test_profile_completion_validates_required_fields(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post(route('user-profile.store'), [
            'full_name' => '',
            'speaking_level' => 'expert',
            'main_goal' => 'singing',
            'preferred_language' => '',
            'bio' => str_repeat('a', 1001),
        ]);

        $response->assertSessionHasErrors([
            'full_name',
            'speaking_level',
            'main_goal',
            'preferred_language',
            'bio',
        ]);
    }

    public function test_completed_user_can_visit_dashboard(): void
    {
        $user = User::factory()
            ->has(UserProfile::factory(), 'profile')
            ->create();

        $response = $this->actingAs($user)->get(route('dashboard'));

        $response->assertOk();
    }

    public function test_user_can_update_speaking_profile(): void
    {
        $user = User::factory()
            ->has(UserProfile::factory(), 'profile')
            ->create();

        $response = $this->actingAs($user)->patch(route('user-profile.update'), [
            'full_name' => 'Grace Hopper',
            'speaking_level' => 'advanced',
            'main_goal' => 'storytelling',
            'preferred_language' => 'English',
            'bio' => 'Working on clearer technical narratives.',
        ]);

        $response->assertRedirect(route('user-profile.edit'));

        $this->assertDatabaseHas('user_profiles', [
            'user_id' => $user->id,
            'full_name' => 'Grace Hopper',
            'speaking_level' => 'advanced',
            'main_goal' => 'storytelling',
            'onboarding_completed' => true,
        ]);
    }
}
