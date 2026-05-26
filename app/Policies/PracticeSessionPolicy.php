<?php

namespace App\Policies;

use App\Models\PracticeSession;
use App\Models\User;

class PracticeSessionPolicy
{
    /**
     * Determine whether the user can view the practice session.
     */
    public function view(User $user, PracticeSession $practiceSession): bool
    {
        return $practiceSession->user_id === $user->id;
    }

    /**
     * Determine whether the user can upload or replace a recording.
     */
    public function record(User $user, PracticeSession $practiceSession): bool
    {
        return $this->view($user, $practiceSession);
    }

    /**
     * Determine whether the user can retry processing.
     */
    public function retry(User $user, PracticeSession $practiceSession): bool
    {
        return $this->view($user, $practiceSession);
    }
}
