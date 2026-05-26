<?php

namespace App\Http\Controllers;

use App\Models\PracticeSession;
use App\Models\SpeakingFeedbackReport;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    /**
     * Display the admin overview.
     */
    public function index(): Response
    {
        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'totalUsers' => User::query()->count(),
                'totalPracticeSessions' => PracticeSession::query()->count(),
                'completedSessions' => PracticeSession::query()
                    ->whereIn('status', ['recorded', 'analyzed'])
                    ->count(),
                'failedTranscriptions' => PracticeSession::query()
                    ->where('status', 'failed')
                    ->whereHas('recording')
                    ->doesntHave('transcript')
                    ->count(),
                'failedAnalyses' => SpeakingFeedbackReport::query()
                    ->where('status', 'failed')
                    ->count(),
            ],
            'recentSessions' => PracticeSession::query()
                ->select(['id', 'user_id', 'title', 'status', 'created_at'])
                ->with([
                    'user:id,name,email',
                    'feedbackReport:id,practice_session_id,status',
                ])
                ->latest()
                ->limit(5)
                ->get(),
        ]);
    }

    /**
     * Display users for admin review.
     */
    public function users(): Response
    {
        return Inertia::render('Admin/Users/Index', [
            'users' => User::query()
                ->select(['id', 'public_id', 'name', 'email', 'is_admin', 'created_at'])
                ->with('profile:id,user_id,onboarding_completed')
                ->withCount('practiceSessions')
                ->latest()
                ->paginate(15)
                ->withQueryString(),
        ]);
    }

    /**
     * Display practice sessions for admin review.
     */
    public function sessions(): Response
    {
        return Inertia::render('Admin/Sessions/Index', [
            'sessions' => PracticeSession::query()
                ->select(['id', 'user_id', 'title', 'status', 'created_at'])
                ->with([
                    'user:id,name,email',
                    'feedbackReport:id,practice_session_id,status',
                ])
                ->latest()
                ->paginate(15)
                ->withQueryString(),
        ]);
    }
}
