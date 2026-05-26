import type { LucideIcon } from 'lucide-react';
import { GlassCard } from '@/components/ai/glass-card';

type PracticeModeCardProps = {
    title: string;
    description: string;
    icon: LucideIcon;
    metric: string;
};

export function PracticeModeCard({
    title,
    description,
    icon: Icon,
    metric,
}: PracticeModeCardProps) {
    return (
        <GlassCard className="group h-full p-5 hover:-translate-y-1" glow>
            <div className="flex items-start justify-between gap-4">
                <div className="rounded-2xl border border-white/10 bg-white/8 p-3 text-cyan-200 transition group-hover:border-cyan-300/40 group-hover:bg-cyan-300/10">
                    <Icon className="size-5" />
                </div>
                <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs text-emerald-200">
                    {metric}
                </span>
            </div>
            <h3 className="mt-5 text-lg font-semibold text-white">{title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">
                {description}
            </p>
        </GlassCard>
    );
}
