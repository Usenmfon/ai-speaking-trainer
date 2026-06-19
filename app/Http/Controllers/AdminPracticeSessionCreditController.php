<?php

namespace App\Http\Controllers;

use App\Http\Requests\Admin\GrantPracticeSessionCreditsRequest;
use App\Models\PracticeSessionCredit;
use App\Services\PracticeSessionCreditService;
use Illuminate\Http\RedirectResponse;

class AdminPracticeSessionCreditController extends Controller
{
    /**
     * Grant practice session credits to a user.
     */
    public function store(
        GrantPracticeSessionCreditsRequest $request,
        PracticeSessionCreditService $credits,
    ): RedirectResponse {
        $credit = $credits->grant(
            user: $request->targetUser(),
            amount: $request->amount(),
            type: PracticeSessionCredit::TypeAdminGrant,
            actor: $request->user(),
            note: $request->validated('note') ?: 'Admin grant.',
        );

        return back()->with('success', __(':amount practice session credits added. New balance: :balance.', [
            'amount' => $credit->amount,
            'balance' => $credit->balance_after,
        ]));
    }
}
