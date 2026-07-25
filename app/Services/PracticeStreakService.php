<?php

namespace App\Services;

use App\Models\PracticeSession;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;

class PracticeStreakService
{
    /**
     * Build a practice streak summary from days with completed sessions.
     *
     * @return array{current: int, longest: int, practiced_today: bool, last_practice_date: string|null, week: array<int, array{date: string, label: string, practiced: bool}>}
     */
    public function summary(int $userId): array
    {
        $dates = $this->practiceDates($userId);
        $today = CarbonImmutable::today();

        return [
            'current' => $this->currentStreak($dates, $today),
            'longest' => $this->longestStreak($dates),
            'practiced_today' => $dates->contains($today->toDateString()),
            'last_practice_date' => $dates->first(),
            'week' => $this->weekActivity($dates, $today),
        ];
    }

    /**
     * @return Collection<int, string>
     */
    private function practiceDates(int $userId): Collection
    {
        return PracticeSession::query()
            ->where('user_id', $userId)
            ->whereNotNull('completed_at')
            ->orderByDesc('completed_at')
            ->pluck('completed_at')
            ->map(fn (mixed $date): string => CarbonImmutable::parse($date)->toDateString())
            ->unique()
            ->values();
    }

    /**
     * @param  Collection<int, string>  $dates
     */
    private function currentStreak(Collection $dates, CarbonImmutable $today): int
    {
        if ($dates->isEmpty()) {
            return 0;
        }

        $streak = 0;
        $cursor = $dates->contains($today->toDateString())
            ? $today
            : $today->subDay();

        while ($dates->contains($cursor->toDateString())) {
            $streak++;
            $cursor = $cursor->subDay();
        }

        return $streak;
    }

    /**
     * @param  Collection<int, string>  $dates
     */
    private function longestStreak(Collection $dates): int
    {
        $longest = 0;
        $current = 0;
        $previous = null;

        foreach ($dates->sort()->values() as $date) {
            $currentDate = CarbonImmutable::parse($date);
            $current = $previous?->addDay()->isSameDay($currentDate) ? $current + 1 : 1;
            $longest = max($longest, $current);
            $previous = $currentDate;
        }

        return $longest;
    }

    /**
     * @param  Collection<int, string>  $dates
     * @return array<int, array{date: string, label: string, practiced: bool}>
     */
    private function weekActivity(Collection $dates, CarbonImmutable $today): array
    {
        return collect(range(6, 0))
            ->map(function (int $daysAgo) use ($dates, $today): array {
                $date = $today->subDays($daysAgo);

                return [
                    'date' => $date->toDateString(),
                    'label' => $date->format('D'),
                    'practiced' => $dates->contains($date->toDateString()),
                ];
            })
            ->values()
            ->all();
    }
}
