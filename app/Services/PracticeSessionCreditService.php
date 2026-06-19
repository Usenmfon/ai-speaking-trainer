<?php

namespace App\Services;

use App\Models\PracticeSession;
use App\Models\PracticeSessionCredit;
use App\Models\Referral;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PracticeSessionCreditService
{
    /**
     * Record a starting balance for a newly created user without changing the cached balance.
     */
    public function recordInitialGrant(User $user): PracticeSessionCredit
    {
        return DB::transaction(function () use ($user): PracticeSessionCredit {
            $lockedUser = $this->lockedUser($user);

            return $this->createEntry(
                user: $lockedUser,
                type: PracticeSessionCredit::TypeInitialGrant,
                amount: User::InitialFreePracticeSessions,
                note: 'Welcome credits awarded at registration.',
            );
        }, attempts: 3);
    }

    /**
     * Grant credits to a user and increase their cached balance.
     */
    public function grant(
        User $user,
        int $amount,
        string $type,
        ?User $actor = null,
        ?string $note = null,
        ?Referral $referral = null,
    ): PracticeSessionCredit {
        return DB::transaction(function () use ($user, $amount, $type, $actor, $note, $referral): PracticeSessionCredit {
            $lockedUser = $this->lockedUser($user);
            $lockedUser->forceFill([
                'practice_sessions_remaining' => $lockedUser->practice_sessions_remaining + $amount,
            ])->save();

            return $this->createEntry(
                user: $lockedUser,
                type: $type,
                amount: $amount,
                note: $note,
                actor: $actor,
                referral: $referral,
            );
        }, attempts: 3);
    }

    /**
     * Spend one credit for a newly created practice session.
     *
     * @throws ValidationException
     */
    public function spendForSession(User $user, PracticeSession $practiceSession): PracticeSessionCredit
    {
        return DB::transaction(function () use ($user, $practiceSession): PracticeSessionCredit {
            $lockedUser = $this->lockedUser($user);

            if ($lockedUser->practice_sessions_remaining < 1) {
                throw ValidationException::withMessages([
                    'practice_sessions_remaining' => __('You have no free practice sessions remaining. Invite someone to earn more.'),
                ]);
            }

            $lockedUser->forceFill([
                'practice_sessions_remaining' => $lockedUser->practice_sessions_remaining - 1,
            ])->save();

            return $this->createEntry(
                user: $lockedUser,
                type: PracticeSessionCredit::TypeSessionCreated,
                amount: -1,
                note: 'Practice session created.',
                practiceSession: $practiceSession,
            );
        }, attempts: 3);
    }

    private function lockedUser(User $user): User
    {
        return User::query()
            ->whereKey($user->getKey())
            ->lockForUpdate()
            ->firstOrFail();
    }

    private function createEntry(
        User $user,
        string $type,
        int $amount,
        ?string $note = null,
        ?User $actor = null,
        ?PracticeSession $practiceSession = null,
        ?Referral $referral = null,
    ): PracticeSessionCredit {
        return PracticeSessionCredit::query()->create([
            'user_id' => $user->id,
            'actor_id' => $actor?->id,
            'practice_session_id' => $practiceSession?->id,
            'referral_id' => $referral?->id,
            'type' => $type,
            'amount' => $amount,
            'balance_after' => $user->practice_sessions_remaining,
            'note' => $note,
        ]);
    }
}
