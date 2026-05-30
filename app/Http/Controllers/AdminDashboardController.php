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
     * @return array<string, mixed>
     */
    private function managementSection(
        string $title,
        string $eyebrow,
        string $description,
        array $items,
    ): array {
        return [
            'section' => [
                'title' => $title,
                'eyebrow' => $eyebrow,
                'description' => $description,
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
        return Inertia::render('Admin/ManagementSection', $this->managementSection(
            title: 'Content management',
            eyebrow: 'CMS',
            description: 'Manage coaching content, public site copy, and reusable learning material.',
            items: [
                [
                    'title' => 'Practice prompts',
                    'description' => 'Create and organize prompt packs for interviews, sales calls, presentations, and debates.',
                    'status' => 'Planned',
                ],
                [
                    'title' => 'Session types',
                    'description' => 'Control the labels, descriptions, and defaults shown when users create practice sessions.',
                    'status' => 'Planned',
                ],
                [
                    'title' => 'Coaching tips',
                    'description' => 'Curate reusable guidance that can appear in onboarding, reports, and empty states.',
                    'status' => 'Planned',
                ],
                [
                    'title' => 'Landing page content',
                    'description' => 'Update product messaging, feature copy, FAQs, and pricing copy without code changes.',
                    'status' => 'Planned',
                ],
            ],
        ));
    }

    /**
     * Display AI processing controls for admin review.
     */
    public function processing(): Response
    {
        return Inertia::render('Admin/ManagementSection', $this->managementSection(
            title: 'AI and processing',
            eyebrow: 'Operations',
            description: 'Monitor transcription, feedback analysis, retries, and failed processing states.',
            items: [
                [
                    'title' => 'Transcription jobs',
                    'description' => 'Track queued, completed, and failed transcription work across uploaded recordings.',
                    'status' => 'Planned',
                ],
                [
                    'title' => 'Analysis jobs',
                    'description' => 'Review feedback generation status and surface sessions that need intervention.',
                    'status' => 'Planned',
                ],
                [
                    'title' => 'Failed jobs',
                    'description' => 'Centralize failures with retry actions and enough context for support.',
                    'status' => 'Planned',
                ],
                [
                    'title' => 'Provider health',
                    'description' => 'Expose AI provider configuration, worker connectivity, and recent error signals.',
                    'status' => 'Planned',
                ],
            ],
        ));
    }

    /**
     * Display notification controls for admin review.
     */
    public function notifications(): Response
    {
        return Inertia::render('Admin/ManagementSection', $this->managementSection(
            title: 'Notifications',
            eyebrow: 'Messaging',
            description: 'Manage system announcements, lifecycle messages, and user notification templates.',
            items: [
                [
                    'title' => 'System announcements',
                    'description' => 'Publish account-wide updates for maintenance windows, releases, and product news.',
                    'status' => 'Planned',
                ],
                [
                    'title' => 'Email templates',
                    'description' => 'Review transactional email copy for analysis completion, failures, and account events.',
                    'status' => 'Planned',
                ],
                [
                    'title' => 'User notifications',
                    'description' => 'Audit in-app notification delivery and retry messages that did not send cleanly.',
                    'status' => 'Planned',
                ],
            ],
        ));
    }

    /**
     * Display system settings for admin review.
     */
    public function settings(): Response
    {
        return Inertia::render('Admin/ManagementSection', $this->managementSection(
            title: 'System settings',
            eyebrow: 'Configuration',
            description: 'Centralize product-level controls that affect recording, AI processing, and rollout behavior.',
            items: [
                [
                    'title' => 'Recording limits',
                    'description' => 'Configure maximum upload sizes, allowed formats, and practice duration options.',
                    'status' => 'Planned',
                ],
                [
                    'title' => 'AI provider settings',
                    'description' => 'Review provider choices, worker endpoints, and operational guardrails.',
                    'status' => 'Planned',
                ],
                [
                    'title' => 'Feature flags',
                    'description' => 'Prepare staged rollout controls for experiments and admin-only previews.',
                    'status' => 'Planned',
                ],
            ],
        ));
    }

    /**
     * Display audit logs for admin review.
     */
    public function auditLogs(): Response
    {
        return Inertia::render('Admin/ManagementSection', $this->managementSection(
            title: 'Audit logs',
            eyebrow: 'Governance',
            description: 'Track sensitive platform events, admin activity, and support actions.',
            items: [
                [
                    'title' => 'Admin actions',
                    'description' => 'Record who changed system content, settings, roles, and operational queues.',
                    'status' => 'Planned',
                ],
                [
                    'title' => 'Security events',
                    'description' => 'Surface sensitive account events such as 2FA, passkeys, and password changes.',
                    'status' => 'Planned',
                ],
                [
                    'title' => 'Error logs',
                    'description' => 'Connect production error signals to user-facing sessions and processing events.',
                    'status' => 'Planned',
                ],
            ],
        ));
    }
}
