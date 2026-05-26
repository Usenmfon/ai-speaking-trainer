import type { LucideIcon } from 'lucide-react';
import { GlassCard } from '@/components/ai/glass-card';

type FeatureCardProps = {
    title: string;
    description: string;
    icon: LucideIcon;
};

export function FeatureCard({ title, description, icon: Icon }: FeatureCardProps) {
    return (
        <GlassCard className="h-full p-6 hover:-translate-y-1" glow>
            <div className="mb-5 inline-flex rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-cyan-200">
                <Icon className="size-5" />
            </div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">
                {description}
            </p>
        </GlassCard>
    );
}
