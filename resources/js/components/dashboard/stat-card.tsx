import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

type StatCardProps = {
    icon: LucideIcon;
    label: string;
    value: string;
    helper: string;
    status?: string;
    tone?: 'default' | 'success' | 'warning';
};

const toneClasses = {
    default:
        'border-cyan-500/20 bg-cyan-500/10 text-cyan-700 dark:text-cyan-200',
    success:
        'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200',
    warning:
        'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-200',
};

export function StatCard({
    helper,
    icon: Icon,
    label,
    status,
    tone = 'default',
    value,
}: StatCardProps) {
    return (
        <div className="min-w-0 rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="mt-3 text-2xl font-semibold tracking-normal break-words sm:text-3xl">
                        {value}
                    </p>
                </div>
                <div
                    className={cn(
                        'shrink-0 rounded-2xl border p-3',
                        toneClasses[tone],
                    )}
                >
                    <Icon className="size-5" />
                </div>
            </div>
            {status && (
                <span
                    className={cn(
                        'mt-4 inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold',
                        toneClasses[tone],
                    )}
                >
                    {status}
                </span>
            )}
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
                {helper}
            </p>
        </div>
    );
}
