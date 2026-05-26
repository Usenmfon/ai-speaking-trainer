import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type GlassCardProps = {
    children: ReactNode;
    glow?: boolean;
} & ComponentPropsWithoutRef<'div'>;

export function GlassCard({
    children,
    className,
    glow = false,
    ...props
}: GlassCardProps) {
    return (
        <div
            className={cn(
                'relative overflow-hidden rounded-2xl border border-border/70 bg-card/80 shadow-xl shadow-slate-950/5 backdrop-blur-xl transition duration-300 dark:border-white/10 dark:bg-white/[0.06] dark:shadow-2xl dark:shadow-black/20',
                'before:pointer-events-none before:absolute before:inset-0 before:bg-linear-to-br before:from-white/50 before:via-transparent before:to-transparent dark:before:from-white/12 dark:before:via-white/[0.03]',
                glow &&
                    'after:pointer-events-none after:absolute after:inset-px after:rounded-[calc(1rem-1px)] after:shadow-[0_0_34px_rgba(14,165,233,0.12)] dark:after:shadow-[0_0_40px_rgba(56,189,248,0.12)]',
                className,
            )}
            {...props}
        >
            <div className="relative">{children}</div>
        </div>
    );
}
