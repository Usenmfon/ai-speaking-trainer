<?php

namespace App\Policies;

use App\Models\SpeakingFeedbackReport;
use App\Models\User;

class FeedbackReportPolicy
{
    /**
     * Determine whether the user can view the feedback report.
     */
    public function view(User $user, SpeakingFeedbackReport $feedbackReport): bool
    {
        return $feedbackReport->user_id === $user->id;
    }
}
