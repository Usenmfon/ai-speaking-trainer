<?php

namespace Database\Factories;

use App\Models\PracticeSession;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PracticeSession>
 */
class PracticeSessionFactory extends Factory
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
            'title' => fake()->sentence(4),
            'topic' => fake()->sentence(6),
            'session_type' => fake()->randomElement(PracticeSession::SessionTypes),
            'target_duration_seconds' => fake()->randomElement([120, 180, 300, 600]),
            'objective' => fake()->sentence(12),
            'status' => 'draft',
            'started_at' => null,
            'completed_at' => null,
        ];
    }

    /**
     * Indicate that the session has been recorded.
     */
    public function recorded(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'recorded',
            'started_at' => now()->subMinutes(10),
            'completed_at' => now()->subMinutes(5),
        ]);
    }

    /**
     * Indicate that the session processing has failed.
     */
    public function failed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'failed',
            'started_at' => now()->subMinutes(10),
            'completed_at' => now()->subMinutes(5),
        ]);
    }
}
