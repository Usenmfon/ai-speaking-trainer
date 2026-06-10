<?php

namespace Database\Factories;

use App\Models\Referral;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Referral>
 */
class ReferralFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $referrer = User::factory();
        $referredUser = User::factory();

        return [
            'referrer_id' => $referrer,
            'referred_user_id' => $referredUser,
            'referral_code' => fake()->bothify('REF###??'),
            'status' => 'registered',
            'registered_at' => now(),
        ];
    }
}
