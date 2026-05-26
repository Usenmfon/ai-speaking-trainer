import { cn } from '@/lib/utils';

type ScoreTone = {
    label: string;
    bar: string;
    badge: string;
    text: string;
};

type ScoreCardProps = {
    label: string;
    value: number | null;
    description?: string;
};

export function getScoreTone(value: number | null): ScoreTone {
    if (value === null) {
        return {
            label: 'Pending',
            bar: 'bg-muted-foreground/40',
            badge: 'border-border bg-muted text-muted-foreground',
            text: 'text-muted-foreground',
        };
    }

    if (value >= 80) {
        return {
            label: 'Excellent',
            bar: 'bg-emerald-500',
            badge: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200',
            text: 'text-emerald-700 dark:text-emerald-200',
        };
    }

    if (value >= 60) {
        return {
            label: 'Good',
            bar: 'bg-cyan-500',
            badge: 'border-cyan-500/25 bg-cyan-500/10 text-cyan-700 dark:text-cyan-200',
            text: 'text-cyan-700 dark:text-cyan-200',
        };
    }

    if (value >= 40) {
        return {
            label: 'Needs improvement',
            bar: 'bg-amber-500',
            badge: 'border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-200',
            text: 'text-amber-700 dark:text-amber-200',
        };
    }

    return {
        label: 'Weak',
        bar: 'bg-rose-500',
        badge: 'border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-200',
        text: 'text-rose-700 dark:text-rose-200',
    };
}

export function ScoreCard({ description, label, value }: ScoreCardProps) {
    const tone = getScoreTone(value);

    return (
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">
                        {label}
                    </p>
                    {description && (
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                            {description}
                        </p>
                    )}
                </div>
                <span
                    className={cn(
                        'shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold',
                        tone.badge,
                    )}
                >
                    {tone.label}
                </span>
            </div>

            <div className="mt-4 flex items-end gap-1">
                <span className={cn('text-4xl font-semibold', tone.text)}>
                    {value ?? '--'}
                </span>
                {value !== null && (
                    <span className="pb-1 text-sm text-muted-foreground">
                        /100
                    </span>
                )}
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                <div
                    className={cn(
                        'h-full rounded-full transition-all duration-500',
                        tone.bar,
                    )}
                    style={{ width: `${value ?? 0}%` }}
                />
            </div>
        </div>
    );
}
