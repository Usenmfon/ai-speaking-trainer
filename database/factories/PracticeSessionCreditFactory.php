<?php

namespace Database\Factories;

use App\Models\PracticeSessionCredit;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PracticeSessionCredit>
 */
class PracticeSessionCreditFactory extends Factory
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
            'actor_id' => null,
            'practice_session_id' => null,
            'referral_id' => null,
            'type' => PracticeSessionCredit::TypeAdminGrant,
            'amount' => 3,
            'balance_after' => 8,
            'note' => fake()->sentence(),
            'metadata' => null,
        ];
    }
}
