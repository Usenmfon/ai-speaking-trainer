<?php

namespace App\Http\Controllers;

use App\Models\PracticeSession;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SpeakingFeedbackReportController extends Controller
{
    /**
     * Display the feedback report for a practice session.
     */
    public function show(Request $request, PracticeSession $practiceSession): Response
    {
        abort_unless($practiceSession->user_id === $request->user()->id, 404);

        return Inertia::render('PracticeSessions/FeedbackReport', [
            'session' => $practiceSession->load(['transcript', 'feedbackReport']),
        ]);
    }
}
