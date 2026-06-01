<?php

namespace App\Http\Controllers;

use App\Models\PracticeSession;
use App\Models\SpeakingFeedbackReport;
use App\Support\ContentLibrary;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class ProgressController extends Controller
{
    /**
     * Display the progress page.
     */
    public function __invoke(Request $request, ContentLibrary $content): Response
    {
        $user = $request->user();

        $reports = SpeakingFeedbackReport::query()
            ->whereBelongsTo($user)
            ->where('status', 'completed')
            ->latest('processed_at')
            ->get();

        $totalSessions = PracticeSession::query()
            ->whereBelongsTo($user)
            ->count();

        $completedSessions = PracticeSession::query()
            ->whereBelongsTo($user)
            ->whereIn('status', ['recorded', 'transcribing', 'transcribed', 'analyzing', 'analyzed'])
            ->count();

        $bestScore = $reports->max('overall_score');
        $skillAverages = $this->skillAverages($reports);

        return Inertia::render('progress', [
            'stats' => [
                [
                    'label' => 'Practice streak',
                    'value' => $this->practiceStreak($user->id).' days',
                    'helper' => 'Keep momentum with one short drill today.',
                    'icon' => 'flame',
                ],
                [
                    'label' => 'Sessions completed',
                    'value' => (string) $completedSessions,
                    'helper' => max(0, 10 - $completedSessions).' more sessions to unlock the next habit milestone.',
                    'icon' => 'calendar',
                ],
                [
                    'label' => 'Best score',
                    'value' => $bestScore ? (string) $bestScore : 'No score yet',
                    'helper' => 'Your strongest overall AI feedback score.',
                    'icon' => 'trophy',
                ],
                [
                    'label' => 'Focus area',
                    'value' => $this->focusArea($skillAverages),
                    'helper' => 'Practice the lowest-scoring skill from your reports.',
                    'icon' => 'target',
                ],
            ],
            'skillTrends' => $this->skillTrends($reports),
            'milestones' => [
                [
                    'title' => 'First analyzed session',
                    'description' => 'Complete one recording and receive AI feedback.',
                    'complete' => $reports->isNotEmpty(),
                ],
                [
                    'title' => 'Three-session streak',
                    'description' => 'Practice three times in one week.',
                    'complete' => $this->practiceStreak($user->id) >= 3,
                ],
                [
                    'title' => 'Score above 85',
                    'description' => 'Reach an overall feedback score of 85 or higher.',
                    'complete' => ($bestScore ?? 0) >= 85,
                ],
                [
                    'title' => 'Ten-session habit',
                    'description' => 'Build consistency with ten completed practice sessions.',
                    'complete' => $totalSessions >= 10,
                ],
            ],
            'weeklyPlan' => $content->list('progress', 'weekly-plan'),
        ]);
    }

    /**
     * @param  Collection<int, SpeakingFeedbackReport>  $reports
     * @return array<string, int>
     */
    private function skillAverages(Collection $reports): array
    {
        return [
            'Clarity' => (int) round($reports->avg('clarity_score') ?? 0),
            'Structure' => (int) round($reports->avg('structure_score') ?? 0),
            'Confidence' => (int) round($reports->avg('confidence_score') ?? 0),
            'Pace' => (int) round($reports->avg('pace_score') ?? 0),
            'Filler words' => (int) round($reports->avg('filler_word_score') ?? 0),
        ];
    }

    /**
     * @param  array<string, int>  $skillAverages
     */
    private function focusArea(array $skillAverages): string
    {
        $scored = array_filter($skillAverages, fn (int $score): bool => $score > 0);

        if ($scored === []) {
            return 'Start practice';
        }

        asort($scored);

        return array_key_first($scored);
    }

    /**
     * @param  Collection<int, SpeakingFeedbackReport>  $reports
     * @return array<int, array<string, mixed>>
     */
    private function skillTrends(Collection $reports): array
    {
        $fields = [
            'Clarity' => 'clarity_score',
            'Structure' => 'structure_score',
            'Confidence' => 'confidence_score',
            'Pace' => 'pace_score',
            'Filler words' => 'filler_word_score',
        ];

        return collect($fields)->map(function (string $field, string $label) use ($reports): array {
            $latest = $reports->first()?->{$field};
            $previous = $reports->skip(1)->first()?->{$field};
            $average = (int) round($reports->avg($field) ?? 0);
            $change = $latest !== null && $previous !== null
                ? sprintf('%+d%%', $latest - $previous)
                : '0%';

            return [
                'label' => $label,
                'value' => $average,
                'change' => $change,
            ];
        })->values()->all();
    }

    private function practiceStreak(int $userId): int
    {
        $dates = PracticeSession::query()
            ->where('user_id', $userId)
            ->whereNotNull('completed_at')
            ->orderByDesc('completed_at')
            ->pluck('completed_at')
            ->map(fn (mixed $date): string => Carbon::parse($date)->toDateString())
            ->unique()
            ->values();

        $streak = 0;
        $cursor = now()->toDateString();

        foreach ($dates as $date) {
            if ($date === $cursor) {
                $streak++;
                $cursor = now()->subDays($streak)->toDateString();

                continue;
            }

            if ($streak === 0 && $date === now()->subDay()->toDateString()) {
                $streak++;
                $cursor = now()->subDays(2)->toDateString();

                continue;
            }

            break;
        }

        return $streak;
    }
}
