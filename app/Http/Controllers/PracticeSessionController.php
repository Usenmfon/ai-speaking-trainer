<?php

namespace App\Http\Controllers;

use App\Http\Requests\PracticeSession\StorePracticeSessionRequest;
use App\Models\PracticeSession;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PracticeSessionController extends Controller
{
    /**
     * Display the user's practice session history.
     */
    public function index(Request $request): Response
    {
        $sessions = $request->user()
            ->practiceSessions()
            ->latest()
            ->get();

        return Inertia::render('PracticeSessions/Index', [
            'sessions' => $sessions,
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
        abort_unless($practiceSession->user_id === $request->user()->id, 404);

        return Inertia::render('PracticeSessions/Show', [
            'session' => $practiceSession,
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
}
