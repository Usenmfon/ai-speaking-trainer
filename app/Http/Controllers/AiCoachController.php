<?php

namespace App\Http\Controllers;

use App\Support\ContentLibrary;
use Inertia\Inertia;
use Inertia\Response;

class AiCoachController extends Controller
{
    /**
     * Display the AI coach page.
     */
    public function __invoke(ContentLibrary $content): Response
    {
        return Inertia::render('ai-coach', [
            'coachDrills' => $content->list('ai-coach', 'drills'),
            'coachingSignals' => $content->list('ai-coach', 'signals'),
            'sessionPlan' => $content->list('ai-coach', 'session-plan'),
            'coachNote' => $content->item('ai-coach', 'coach-note', 'default'),
        ]);
    }
}
