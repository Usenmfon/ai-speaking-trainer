<?php

namespace App\Services;

use App\Models\Referral;
use App\Models\User;
use Illuminate\Support\Str;

class ReferralService
{
    /**
     * Generate a unique referral code for a user.
     */
    public function generateCode(): string
    {
        do {
            $code = Str::upper(Str::random(8));
        } while (User::query()->where('referral_code', $code)->exists());

        return $code;
    }

    /**
     * Ensure an existing user has a referral code.
     */
    public function ensureCode(User $user): string
    {
        if ($user->referral_code) {
            return $user->referral_code;
        }

        $user->forceFill([
            'referral_code' => $this->generateCode(),
        ])->save();

        return $user->referral_code;
    }

    /**
     * Record a successful referral signup when a valid code exists.
     */
    public function recordSignup(User $referredUser, ?string $referralCode): void
    {
        if (! $referralCode) {
            return;
        }

        $referrer = User::query()
            ->where('referral_code', Str::upper($referralCode))
            ->first();

        if (! $referrer || $referrer->is($referredUser)) {
            return;
        }

        Referral::query()->firstOrCreate(
            ['referred_user_id' => $referredUser->id],
            [
                'referrer_id' => $referrer->id,
                'referral_code' => $referrer->referral_code,
                'status' => 'registered',
                'registered_at' => now(),
            ],
        );
    }
}
