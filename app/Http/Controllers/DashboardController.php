<?php

namespace App\Http\Controllers;

use App\Models\PracticeSession;
use App\Models\SpeakingFeedbackReport;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the authenticated user's analytics dashboard.
     */
    public function index(Request $request): RedirectResponse|Response
    {
        $user = $request->user();

        if ($user->isAdmin()) {
            return to_route('admin.dashboard');
        }

        $sessionQuery = PracticeSession::query()
            ->whereBelongsTo($user);
        $reportQuery = SpeakingFeedbackReport::query()
            ->whereBelongsTo($user);

        $latestSession = (clone $sessionQuery)
            ->select(['id', 'title', 'topic', 'session_type', 'status', 'created_at', 'completed_at'])
            ->latest()
            ->first();

        $recentSessions = (clone $sessionQuery)
            ->select(['id', 'title', 'topic', 'session_type', 'status', 'created_at', 'completed_at'])
            ->latest()
            ->limit(5)
            ->get();

        $recentReports = (clone $reportQuery)
            ->select([
                'id',
                'practice_session_id',
                'overall_score',
                'clarity_score',
                'structure_score',
                'confidence_score',
                'pace_score',
                'filler_word_score',
                'summary_feedback',
                'weaknesses',
                'status',
                'processed_at',
            ])
            ->with('practiceSession:id,title,session_type,status,created_at')
            ->latest('processed_at')
            ->limit(5)
            ->get();

        $weaknesses = (clone $reportQuery)
            ->select(['weaknesses'])
            ->whereNotNull('weaknesses')
            ->latest('processed_at')
            ->limit(50)
            ->get()
            ->pluck('weaknesses')
            ->filter()
            ->flatten()
            ->map(fn (string $weakness): string => trim($weakness))
            ->filter();

        return Inertia::render('dashboard', [
            'analytics' => [
                'stats' => [
                    'totalPracticeSessions' => (clone $sessionQuery)->count(),
                    'completedSessions' => (clone $sessionQuery)
                        ->whereIn('status', ['recorded', 'transcribing', 'transcribed', 'analyzing', 'analyzed'])
                        ->count(),
                    'averageOverallScore' => $this->roundedNullable((clone $reportQuery)
                        ->whereNotNull('overall_score')
                        ->avg('overall_score')),
                    'bestScore' => $this->roundedNullable((clone $reportQuery)->max('overall_score')),
                ],
                'latestSession' => $latestSession,
                'mostCommonWeakness' => $this->mostCommonValue($weaknesses),
                'recentSessions' => $recentSessions,
                'recentReports' => $recentReports,
            ],
        ]);
    }

    /**
     * Round nullable numeric aggregate values.
     */
    private function roundedNullable(mixed $value): ?int
    {
        if ($value === null) {
            return null;
        }

        return (int) round((float) $value);
    }

    /**
     * Return the most frequent value in a collection.
     *
     * @param  Collection<int, string>  $values
     */
    private function mostCommonValue(Collection $values): ?string
    {
        if ($values->isEmpty()) {
            return null;
        }

        return $values
            ->countBy()
            ->sortDesc()
            ->keys()
            ->first();
    }
}
