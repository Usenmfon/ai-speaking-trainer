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
                'relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] shadow-2xl shadow-black/20 backdrop-blur-xl transition duration-300',
                'before:pointer-events-none before:absolute before:inset-0 before:bg-linear-to-br before:from-white/12 before:via-white/[0.03] before:to-transparent',
                glow &&
                    'after:pointer-events-none after:absolute after:inset-px after:rounded-[calc(1rem-1px)] after:shadow-[0_0_40px_rgba(56,189,248,0.12)]',
                className,
            )}
            {...props}
        >
            <div className="relative">{children}</div>
        </div>
    );
}
