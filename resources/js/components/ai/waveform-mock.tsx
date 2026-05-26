import type { CSSProperties } from 'react';
import { cn } from '@/lib/utils';

type WaveformMockProps = {
    className?: string;
    bars?: number;
};

export function WaveformMock({ className, bars = 36 }: WaveformMockProps) {
    return (
        <div
            className={cn(
                'flex h-28 items-center justify-center gap-1.5 overflow-hidden rounded-2xl border border-cyan-300/10 bg-slate-950/55 p-5',
                'border-cyan-500/15 bg-muted/60 dark:border-cyan-300/10 dark:bg-slate-950/55',
                className,
            )}
            aria-hidden="true"
        >
            {Array.from({ length: bars }).map((_, index) => (
                <span
                    key={index}
                    className="waveform-bar block w-1.5 rounded-full bg-linear-to-t from-violet-500 via-cyan-300 to-white shadow-[0_0_14px_rgba(34,211,238,0.55)]"
                    style={
                        {
                            height: `${22 + ((index * 17) % 58)}%`,
                            animationDelay: `${index * 45}ms`,
                        } as CSSProperties
                    }
                />
            ))}
        </div>
    );
}
