<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<UserProfile>
 */
class UserProfileFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'full_name' => fake()->name(),
            'speaking_level' => fake()->randomElement(UserProfile::SpeakingLevels),
            'main_goal' => fake()->randomElement(UserProfile::MainGoals),
            'preferred_language' => 'English',
            'bio' => fake()->paragraph(),
            'onboarding_completed' => true,
        ];
    }

    /**
     * Indicate that onboarding is incomplete.
     */
    public function incomplete(): static
    {
        return $this->state(fn (array $attributes) => [
            'onboarding_completed' => false,
        ]);
    }
}
