<?php

namespace App\Http\Controllers;

use App\Models\PracticeSession;
use App\Models\SpeakingFeedbackReport;
use App\Models\User;
use App\Support\ContentLibrary;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    public function __construct(private ContentLibrary $content) {}

    /**
     * @return array<string, mixed>
     */
    private function managementSection(
        string $sectionKey,
    ): array {
        $section = $this->content->item('admin', $sectionKey, '_section') ?? [
            'title' => str($sectionKey)->headline()->toString(),
            'value' => 'Management',
            'description' => 'No content has been configured for this section yet.',
        ];
        $items = collect($this->content->list('admin', $sectionKey))
            ->reject(fn (array $item): bool => $item['key'] === '_section')
            ->map(fn (array $item): array => [
                'title' => $item['title'],
                'description' => $item['description'],
                'status' => $item['value'] ?? 'Planned',
            ])
            ->values()
            ->all();

        return [
            'section' => [
                'title' => $section['title'],
                'eyebrow' => $section['value'],
                'description' => $section['description'],
                'items' => $items,
            ],
        ];
    }

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
                    ->whereIn('status', ['recorded', 'transcribing', 'transcribed', 'analyzing', 'analyzed'])
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
                ->select(['id', 'public_id', 'name', 'email', 'created_at'])
                ->with('profile:id,user_id,onboarding_completed')
                ->with('roles:id,name')
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

    /**
     * Display CMS controls for admin review.
     */
    public function content(): Response
    {
        return Inertia::render('Admin/ManagementSection', $this->managementSection('content'));
    }

    /**
     * Display AI processing controls for admin review.
     */
    public function processing(): Response
    {
        return Inertia::render('Admin/ManagementSection', $this->managementSection('processing'));
    }

    /**
     * Display notification controls for admin review.
     */
    public function notifications(): Response
    {
        return Inertia::render('Admin/ManagementSection', $this->managementSection('notifications'));
    }

    /**
     * Display system settings for admin review.
     */
    public function settings(): Response
    {
        return Inertia::render('Admin/ManagementSection', $this->managementSection('settings'));
    }

    /**
     * Display audit logs for admin review.
     */
    public function auditLogs(): Response
    {
        return Inertia::render('Admin/ManagementSection', $this->managementSection('audit-logs'));
    }
}
