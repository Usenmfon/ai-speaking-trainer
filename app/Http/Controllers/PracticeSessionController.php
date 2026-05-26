<?php

namespace App\Http\Controllers;

use App\Http\Requests\PracticeSession\IndexPracticeSessionRequest;
use App\Http\Requests\PracticeSession\StorePracticeSessionRequest;
use App\Models\PracticeSession;
use App\Models\SpeakingFeedbackReport;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class PracticeSessionController extends Controller
{
    /**
     * Display the user's practice session history.
     */
    public function index(IndexPracticeSessionRequest $request): Response
    {
        $filters = [
            'search' => $request->validated('search'),
            'session_type' => $request->validated('session_type'),
            'status' => $request->validated('status'),
            'date_from' => $request->validated('date_from'),
            'date_to' => $request->validated('date_to'),
            'sort' => $request->validated('sort', 'newest'),
        ];

        $feedbackReportsTable = (new SpeakingFeedbackReport)->getTable();

        $sessions = $request
            ->user()
            ->practiceSessions()
            ->select('practice_sessions.*')
            ->leftJoin("{$feedbackReportsTable} as feedback_reports_for_sort", 'practice_sessions.id', '=', 'feedback_reports_for_sort.practice_session_id')
            ->addSelect('feedback_reports_for_sort.overall_score')
            ->with(['feedbackReport:id,practice_session_id,overall_score,status,processed_at'])
            ->when($filters['search'], function ($query, string $search): void {
                $query->where(function ($query) use ($search): void {
                    $query
                        ->where('practice_sessions.title', 'like', "%{$search}%")
                        ->orWhere('practice_sessions.topic', 'like', "%{$search}%");
                });
            })
            ->when($filters['session_type'], fn ($query, string $sessionType) => $query->where('practice_sessions.session_type', $sessionType))
            ->when($filters['status'], fn ($query, string $status) => $query->where('practice_sessions.status', $status))
            ->when($filters['date_from'], fn ($query, string $date) => $query->whereDate('practice_sessions.created_at', '>=', $date))
            ->when($filters['date_to'], fn ($query, string $date) => $query->whereDate('practice_sessions.created_at', '<=', $date))
            ->when(
                in_array($filters['sort'], ['highest_score', 'lowest_score'], true),
                function ($query) use ($filters): void {
                    $query
                        ->orderByRaw('CASE WHEN feedback_reports_for_sort.overall_score IS NULL THEN 1 ELSE 0 END')
                        ->orderBy('feedback_reports_for_sort.overall_score', $filters['sort'] === 'highest_score' ? 'desc' : 'asc')
                        ->latest('practice_sessions.created_at');
                },
                fn ($query) => $filters['sort'] === 'oldest'
                    ? $query->oldest('practice_sessions.created_at')
                    : $query->latest('practice_sessions.created_at')
            )
            ->paginate(9)
            ->withQueryString();

        return Inertia::render('PracticeSessions/Index', [
            'sessions' => $sessions,
            'filters' => $filters,
            'filterOptions' => $this->filterOptions(),
        ]);
    }

    /**
     * Show the practice session setup page.
     */
    public function create(): Response
    {
        return Inertia::render('PracticeSessions/Create', [
            ...$this->formOptions(),
        ]);
    }

    /**
     * Store a newly created practice session as a draft.
     */
    public function store(StorePracticeSessionRequest $request): RedirectResponse
    {
        $session = $request->user()->practiceSessions()->create([
            ...$request->validated(),
            'status' => 'draft',
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Practice session created.')]);

        return to_route('practice-sessions.show', $session);
    }

    /**
     * Display the selected practice session.
     */
    public function show(Request $request, PracticeSession $practiceSession): Response
    {
        Gate::authorize('view', $practiceSession);

        return Inertia::render('PracticeSessions/Show', [
            'session' => $practiceSession->load(['recording', 'transcript', 'feedbackReport']),
        ]);
    }

    /**
     * Get form options for the practice session setup flow.
     *
     * @return array{sessionTypes: array<int, string>, topicSuggestions: array<int, string>, durations: array<int, array{label: string, value: int}>}
     */
    private function formOptions(): array
    {
        return [
            'sessionTypes' => PracticeSession::SessionTypes,
            'durations' => [
                ['label' => '2 minutes', 'value' => 120],
                ['label' => '3 minutes', 'value' => 180],
                ['label' => '5 minutes', 'value' => 300],
                ['label' => '10 minutes', 'value' => 600],
                ['label' => '15 minutes', 'value' => 900],
            ],
            'topicSuggestions' => [
                'Introduce yourself for a senior product role interview',
                'Pitch an AI tool to a skeptical executive team',
                'Tell a story about overcoming a difficult project',
                'Explain a technical idea to a non-technical audience',
                'Give a two-minute elevator pitch for your startup idea',
                'Respond to an unexpected question during a panel',
            ],
        ];
    }

    /**
     * Get filter options for the practice session history.
     *
     * @return array{sessionTypes: array<int, string>, statuses: array<int, string>, sortOptions: array<int, array{label: string, value: string}>}
     */
    private function filterOptions(): array
    {
        return [
            'sessionTypes' => PracticeSession::SessionTypes,
            'statuses' => PracticeSession::Statuses,
            'sortOptions' => [
                ['label' => 'Newest first', 'value' => 'newest'],
                ['label' => 'Oldest first', 'value' => 'oldest'],
                ['label' => 'Highest score', 'value' => 'highest_score'],
                ['label' => 'Lowest score', 'value' => 'lowest_score'],
            ],
        ];
    }
}
