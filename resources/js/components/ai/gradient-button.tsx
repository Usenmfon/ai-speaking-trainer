import { Link } from '@inertiajs/react';
import type { InertiaLinkProps } from '@inertiajs/react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type GradientButtonProps = {
    children: ReactNode;
    className?: string;
    href?: InertiaLinkProps['href'];
    variant?: 'primary' | 'secondary';
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function GradientButton({
    children,
    className,
    href,
    variant = 'primary',
    type = 'button',
    ...props
}: GradientButtonProps) {
    const classes = cn(
        'inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition duration-300 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 focus-visible:outline-none',
        variant === 'primary'
            ? 'bg-linear-to-r from-cyan-300 via-blue-400 to-violet-500 text-slate-950 shadow-[0_0_32px_rgba(34,211,238,0.35)] hover:-translate-y-0.5 hover:shadow-[0_0_46px_rgba(139,92,246,0.42)]'
            : 'border border-white/12 bg-white/8 text-white hover:-translate-y-0.5 hover:border-cyan-300/50 hover:bg-white/12',
        className,
    );

    if (href) {
        return (
            <Link href={href} className={classes}>
                {children}
            </Link>
        );
    }

    return (
        <button type={type} className={classes} {...props}>
            {children}
        </button>
    );
}
