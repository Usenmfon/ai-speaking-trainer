import type { LucideIcon } from 'lucide-react';
import { GlassCard } from '@/components/ai/glass-card';

type StatCardProps = {
    label: string;
    value: string;
    trend?: string;
    icon: LucideIcon;
};

export function StatCard({ label, value, trend, icon: Icon }: StatCardProps) {
    return (
        <GlassCard className="p-5 hover:-translate-y-1" glow>
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm text-slate-400">{label}</p>
                    <p className="mt-3 text-3xl font-semibold text-white">
                        {value}
                    </p>
                </div>
                <div className="rounded-xl border border-cyan-300/20 bg-cyan-300/10 p-2 text-cyan-200">
                    <Icon className="size-5" />
                </div>
            </div>
            {trend && <p className="mt-4 text-sm text-emerald-300">{trend}</p>}
        </GlassCard>
    );
}
