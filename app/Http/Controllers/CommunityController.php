<?php

namespace App\Http\Controllers;

use App\Models\PracticeSession;
use App\Models\SpeakingFeedbackReport;
use App\Support\ContentLibrary;
use Inertia\Inertia;
use Inertia\Response;

class CommunityController extends Controller
{
    /**
     * Display the community page.
     */
    public function __invoke(ContentLibrary $content): Response
    {
        return Inertia::render('community', [
            'discussionThreads' => $content->list('community', 'threads'),
            'practiceCircles' => $content->list('community', 'circles'),
            'upcomingSessions' => $content->list('community', 'rooms'),
            'communityStats' => [
                [
                    'label' => 'Active speakers',
                    'value' => (string) PracticeSession::query()
                        ->where('created_at', '>=', now()->subWeek())
                        ->distinct('user_id')
                        ->count('user_id'),
                    'helper' => 'Members practicing this week',
                    'icon' => 'users',
                ],
                [
                    'label' => 'Practice sessions',
                    'value' => (string) PracticeSession::query()
                        ->where('created_at', '>=', now()->subWeek())
                        ->count(),
                    'helper' => 'Sessions created this week',
                    'icon' => 'flame',
                ],
                [
                    'label' => 'Feedback reports',
                    'value' => (string) SpeakingFeedbackReport::query()
                        ->where('status', 'completed')
                        ->where('processed_at', '>=', now()->subMonth())
                        ->count(),
                    'helper' => 'AI reports completed this month',
                    'icon' => 'message',
                ],
            ],
            'challenge' => $content->item('community', 'challenge', 'weekly'),
        ]);
    }
}
