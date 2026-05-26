<?php

namespace App\Http\Controllers;

use App\Models\PracticeSession;
use App\Models\SpeakingFeedbackReport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class SpeakingFeedbackReportController extends Controller
{
    /**
     * Display the user's feedback reports.
     */
    public function index(Request $request): Response
    {
        return Inertia::render('FeedbackReports/Index', [
            'reports' => SpeakingFeedbackReport::query()
                ->whereBelongsTo($request->user())
                ->with('practiceSession')
                ->latest('processed_at')
                ->get(),
        ]);
    }

    /**
     * Display a feedback report.
     */
    public function show(Request $request, SpeakingFeedbackReport $feedbackReport): Response
    {
        Gate::authorize('view', $feedbackReport);

        return Inertia::render('FeedbackReports/Show', [
            'report' => $feedbackReport->load(['practiceSession', 'transcript']),
        ]);
    }

    /**
     * Display the feedback report for a practice session.
     */
    public function session(Request $request, PracticeSession $practiceSession): Response
    {
        Gate::authorize('view', $practiceSession);

        return Inertia::render('FeedbackReports/Show', [
            'report' => $practiceSession->feedbackReport()
                ->with(['practiceSession', 'transcript'])
                ->first(),
            'session' => $practiceSession->load('transcript'),
        ]);
    }
}
