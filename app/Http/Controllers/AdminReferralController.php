<?php

namespace App\Http\Controllers;

use App\Models\Referral;
use Inertia\Inertia;
use Inertia\Response;

class AdminReferralController extends Controller
{
    /**
     * Display referral signups for admin review.
     */
    public function index(): Response
    {
        return Inertia::render('Admin/Referrals/Index', [
            'referrals' => Referral::query()
                ->select(['id', 'referrer_id', 'referred_user_id', 'referral_code', 'status', 'registered_at', 'created_at'])
                ->with([
                    'referrer:id,name,email,referral_code',
                    'referredUser:id,name,email,created_at',
                ])
                ->latest('registered_at')
                ->paginate(15)
                ->withQueryString(),
        ]);
    }
}
