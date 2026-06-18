import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

const logoSrc = '/android-chrome-192x192.png';

export default function AppLogoIcon({
    className,
    ...props
}: HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                'flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-slate-950 shadow-[0_0_24px_rgba(34,211,238,0.22)] ring-1 ring-white/10 dark:bg-black',
                className,
            )}
            {...props}
        >
            <img
                src={logoSrc}
                alt=""
                aria-hidden="true"
                className="size-full object-contain"
            />
        </div>
    );
}
