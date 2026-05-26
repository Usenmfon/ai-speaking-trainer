import type { LucideIcon } from 'lucide-react';
import { GlassCard } from '@/components/ai/glass-card';

type FeedbackCardProps = {
    title: string;
    body: string;
    icon: LucideIcon;
    tone?: 'info' | 'success' | 'warning';
};

const toneClasses = {
    info: 'border-cyan-500/20 bg-cyan-500/10 text-cyan-700 dark:border-cyan-300/20 dark:bg-cyan-300/10 dark:text-cyan-200',
    success:
        'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:border-emerald-300/20 dark:bg-emerald-300/10 dark:text-emerald-200',
    warning:
        'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:border-amber-300/20 dark:bg-amber-300/10 dark:text-amber-200',
};

export function FeedbackCard({
    title,
    body,
    icon: Icon,
    tone = 'info',
}: FeedbackCardProps) {
    return (
        <GlassCard className="p-4">
            <div className="flex gap-3">
                <div
                    className={`h-fit rounded-xl border p-2 ${toneClasses[tone]}`}
                >
                    <Icon className="size-4" />
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-foreground dark:text-white">
                        {title}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground dark:text-slate-300">
                        {body}
                    </p>
                </div>
            </div>
        </GlassCard>
    );
}
