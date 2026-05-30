import type { LucideIcon } from 'lucide-react';

type StatCardProps = {
    icon: LucideIcon;
    label: string;
    value: string;
    helper: string;
};

export function StatCard({ helper, icon: Icon, label, value }: StatCardProps) {
    return (
        <div className="min-w-0 rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="mt-3 text-2xl font-semibold tracking-normal break-words sm:text-3xl">
                        {value}
                    </p>
                </div>
                <div className="shrink-0 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-3 text-cyan-700 dark:text-cyan-200">
                    <Icon className="size-5" />
                </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
                {helper}
            </p>
        </div>
    );
}
