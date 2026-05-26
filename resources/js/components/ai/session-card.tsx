import { Clock, Mic2 } from 'lucide-react';
import { GlassCard } from '@/components/ai/glass-card';

type SessionCardProps = {
    title: string;
    date: string;
    score: string;
    duration: string;
};

export function SessionCard({ title, date, score, duration }: SessionCardProps) {
    return (
        <GlassCard className="p-4 hover:-translate-y-0.5">
            <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                    <div className="rounded-xl border border-violet-300/20 bg-violet-300/10 p-2 text-violet-200">
                        <Mic2 className="size-4" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-white">
                            {title}
                        </h3>
                        <p className="text-xs text-slate-400">{date}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-sm font-semibold text-cyan-200">
                        {score}
                    </p>
                    <p className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock className="size-3" />
                        {duration}
                    </p>
                </div>
            </div>
        </GlassCard>
    );
}
