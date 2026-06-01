<?php

namespace Database\Seeders;

use App\Models\ContentItem;
use Illuminate\Database\Seeder;

class ContentItemSeeder extends Seeder
{
    /**
     * Seed database-backed content that was previously hardcoded in pages.
     */
    public function run(): void
    {
        foreach ($this->items() as $index => $item) {
            ContentItem::query()->updateOrCreate(
                [
                    'page' => $item['page'],
                    'section' => $item['section'],
                    'item_key' => $item['item_key'],
                ],
                [
                    'title' => $item['title'],
                    'description' => $item['description'] ?? null,
                    'value' => $item['value'] ?? null,
                    'metadata' => $item['metadata'] ?? null,
                    'sort_order' => $item['sort_order'] ?? $index,
                    'is_active' => $item['is_active'] ?? true,
                ],
            );
        }
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function items(): array
    {
        return [
            ...$this->aiCoachItems(),
            ...$this->progressItems(),
            ...$this->communityItems(),
            ...$this->sidebarItems(),
            ...$this->adminManagementItems(),
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function aiCoachItems(): array
    {
        return [
            [
                'page' => 'ai-coach',
                'section' => 'drills',
                'item_key' => 'executive-summary',
                'title' => 'Executive summary',
                'description' => 'Structure',
                'value' => 'Explain the main idea in three sentences: problem, decision, and expected result.',
                'metadata' => ['duration' => '4 min'],
                'sort_order' => 1,
            ],
            [
                'page' => 'ai-coach',
                'section' => 'drills',
                'item_key' => 'calm-objection-response',
                'title' => 'Calm objection response',
                'description' => 'Confidence',
                'value' => 'Respond to a skeptical stakeholder without rushing or over-explaining.',
                'metadata' => ['duration' => '5 min'],
                'sort_order' => 2,
            ],
            [
                'page' => 'ai-coach',
                'section' => 'drills',
                'item_key' => 'cleaner-opening',
                'title' => 'Cleaner opening',
                'description' => 'Clarity',
                'value' => 'Open a presentation with a concise hook, one useful context line, and the outcome.',
                'metadata' => ['duration' => '3 min'],
                'sort_order' => 3,
            ],
            [
                'page' => 'ai-coach',
                'section' => 'signals',
                'item_key' => 'primary-focus',
                'title' => 'Primary focus',
                'value' => 'Sharper openings',
                'description' => 'Start with the outcome before the context.',
                'metadata' => ['icon' => 'target'],
                'sort_order' => 1,
            ],
            [
                'page' => 'ai-coach',
                'section' => 'signals',
                'item_key' => 'delivery-cue',
                'title' => 'Delivery cue',
                'value' => 'Pause after key claims',
                'description' => 'Give the listener a beat to process.',
                'metadata' => ['icon' => 'timer'],
                'sort_order' => 2,
            ],
            [
                'page' => 'ai-coach',
                'section' => 'signals',
                'item_key' => 'language-habit',
                'title' => 'Language habit',
                'value' => 'Trim softeners',
                'description' => 'Replace maybe and kind of with direct phrasing.',
                'metadata' => ['icon' => 'message'],
                'sort_order' => 3,
            ],
            ...collect([
                'Read the prompt once, then look away.',
                'Record one clean take without restarting.',
                'Review the first 20 seconds for clarity.',
                'Repeat only the weakest section.',
            ])->map(fn (string $step, int $index): array => [
                'page' => 'ai-coach',
                'section' => 'session-plan',
                'item_key' => 'step-'.($index + 1),
                'title' => 'Step '.($index + 1),
                'description' => $step,
                'sort_order' => $index + 1,
            ])->all(),
            [
                'page' => 'ai-coach',
                'section' => 'coach-note',
                'item_key' => 'default',
                'title' => 'Coach note',
                'description' => 'Keep this page open before each recording. Pick one drill, speak once without restarting, then create a full practice session when the cue feels natural.',
                'value' => 'Best next move: complete the selected drill, then record one full take for AI feedback.',
            ],
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function progressItems(): array
    {
        return collect([
            'Record one concise opening.',
            'Repeat your weakest transition.',
            'Run a full timed practice.',
            'Review the newest feedback report.',
        ])->map(fn (string $step, int $index): array => [
            'page' => 'progress',
            'section' => 'weekly-plan',
            'item_key' => 'day-'.($index + 1),
            'title' => 'Day '.($index + 1),
            'description' => $step,
            'sort_order' => $index + 1,
        ])->all();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function communityItems(): array
    {
        return [
            [
                'page' => 'community',
                'section' => 'threads',
                'item_key' => 'rushing-presentations',
                'title' => 'How do you stop rushing during presentations?',
                'description' => 'Delivery',
                'metadata' => ['replies' => 18, 'latest' => '12 min ago'],
                'sort_order' => 1,
            ],
            [
                'page' => 'community',
                'section' => 'threads',
                'item_key' => 'one-minute-intro',
                'title' => 'Share a one-minute intro and get structure feedback',
                'description' => 'Practice exchange',
                'metadata' => ['replies' => 31, 'latest' => '46 min ago'],
                'sort_order' => 2,
            ],
            [
                'page' => 'community',
                'section' => 'threads',
                'item_key' => 'warm-up-routines',
                'title' => 'Best warm-up routines before a high-stakes call',
                'description' => 'Preparation',
                'metadata' => ['replies' => 12, 'latest' => '2 hr ago'],
                'sort_order' => 3,
            ],
            [
                'page' => 'community',
                'section' => 'circles',
                'item_key' => 'interview-readiness',
                'title' => 'Interview readiness',
                'value' => '214 members',
                'description' => 'Answer structure, confidence, and concise examples.',
                'sort_order' => 1,
            ],
            [
                'page' => 'community',
                'section' => 'circles',
                'item_key' => 'product-storytelling',
                'title' => 'Product storytelling',
                'value' => '148 members',
                'description' => 'Clear launches, demos, and stakeholder updates.',
                'sort_order' => 2,
            ],
            [
                'page' => 'community',
                'section' => 'circles',
                'item_key' => 'english-fluency-reps',
                'title' => 'English fluency reps',
                'value' => '326 members',
                'description' => 'Daily speaking prompts and supportive peer feedback.',
                'sort_order' => 3,
            ],
            [
                'page' => 'community',
                'section' => 'rooms',
                'item_key' => 'live-prompt-sprint',
                'title' => 'Live prompt sprint',
                'metadata' => ['time' => 'Today, 6:00 PM', 'seats' => '8 spots open'],
                'sort_order' => 1,
            ],
            [
                'page' => 'community',
                'section' => 'rooms',
                'item_key' => 'peer-feedback-room',
                'title' => 'Peer feedback room',
                'metadata' => ['time' => 'Tomorrow, 7:30 PM', 'seats' => '12 spots open'],
                'sort_order' => 2,
            ],
            [
                'page' => 'community',
                'section' => 'rooms',
                'item_key' => 'confidence-clinic',
                'title' => 'Confidence clinic',
                'metadata' => ['time' => 'Friday, 5:00 PM', 'seats' => '5 spots open'],
                'sort_order' => 3,
            ],
            [
                'page' => 'community',
                'section' => 'challenge',
                'item_key' => 'weekly',
                'title' => 'Community challenge',
                'description' => 'Complete three short recordings this week and share one takeaway with a practice circle.',
                'value' => 'Current challenge progress: 1 of 3 recordings completed.',
            ],
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function sidebarItems(): array
    {
        return [
            [
                'page' => 'sidebar',
                'section' => 'footer',
                'item_key' => 'user',
                'title' => 'Fluency Pro',
                'description' => 'Two more sessions to unlock your next badge.',
            ],
            [
                'page' => 'sidebar',
                'section' => 'footer',
                'item_key' => 'admin',
                'title' => 'Admin mode',
                'description' => 'Manage content, users, processing, and system controls.',
            ],
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function adminManagementItems(): array
    {
        $sections = [
            'content' => [
                'title' => 'Content management',
                'eyebrow' => 'CMS',
                'description' => 'Manage coaching content, public site copy, and reusable learning material.',
                'items' => [
                    ['Practice prompts', 'Create and organize prompt packs for interviews, sales calls, presentations, and debates.'],
                    ['Session types', 'Control the labels, descriptions, and defaults shown when users create practice sessions.'],
                    ['Coaching tips', 'Curate reusable guidance that can appear in onboarding, reports, and empty states.'],
                    ['Landing page content', 'Update product messaging, feature copy, FAQs, and pricing copy without code changes.'],
                ],
            ],
            'processing' => [
                'title' => 'AI and processing',
                'eyebrow' => 'Operations',
                'description' => 'Monitor transcription, feedback analysis, retries, and failed processing states.',
                'items' => [
                    ['Transcription jobs', 'Track queued, completed, and failed transcription work across uploaded recordings.'],
                    ['Analysis jobs', 'Review feedback generation status and surface sessions that need intervention.'],
                    ['Failed jobs', 'Centralize failures with retry actions and enough context for support.'],
                    ['Provider health', 'Expose AI provider configuration, worker connectivity, and recent error signals.'],
                ],
            ],
            'notifications' => [
                'title' => 'Notifications',
                'eyebrow' => 'Messaging',
                'description' => 'Manage system announcements, lifecycle messages, and user notification templates.',
                'items' => [
                    ['System announcements', 'Publish account-wide updates for maintenance windows, releases, and product news.'],
                    ['Email templates', 'Review transactional email copy for analysis completion, failures, and account events.'],
                    ['User notifications', 'Audit in-app notification delivery and retry messages that did not send cleanly.'],
                ],
            ],
            'settings' => [
                'title' => 'System settings',
                'eyebrow' => 'Configuration',
                'description' => 'Centralize product-level controls that affect recording, AI processing, and rollout behavior.',
                'items' => [
                    ['Recording limits', 'Configure maximum upload sizes, allowed formats, and practice duration options.'],
                    ['AI provider settings', 'Review provider choices, worker endpoints, and operational guardrails.'],
                    ['Feature flags', 'Prepare staged rollout controls for experiments and admin-only previews.'],
                ],
            ],
            'audit-logs' => [
                'title' => 'Audit logs',
                'eyebrow' => 'Governance',
                'description' => 'Track sensitive platform events, admin activity, and support actions.',
                'items' => [
                    ['Admin actions', 'Record who changed system content, settings, roles, and operational queues.'],
                    ['Security events', 'Surface sensitive account events such as 2FA, passkeys, and password changes.'],
                    ['Error logs', 'Connect production error signals to user-facing sessions and processing events.'],
                ],
            ],
        ];

        return collect($sections)->flatMap(function (array $section, string $key): array {
            $header = [[
                'page' => 'admin',
                'section' => $key,
                'item_key' => '_section',
                'title' => $section['title'],
                'description' => $section['description'],
                'value' => $section['eyebrow'],
                'sort_order' => 0,
            ]];

            $items = collect($section['items'])->map(fn (array $item, int $index): array => [
                'page' => 'admin',
                'section' => $key,
                'item_key' => str($item[0])->slug()->toString(),
                'title' => $item[0],
                'description' => $item[1],
                'value' => 'Planned',
                'sort_order' => $index + 1,
            ])->all();

            return [...$header, ...$items];
        })->values()->all();
    }
}
