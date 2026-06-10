import { Mic2 } from 'lucide-react';
import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

export default function AppLogoIcon({
    className,
    ...props
}: HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                'flex aspect-square items-center justify-center rounded-2xl bg-linear-to-br from-cyan-300 to-violet-500 text-slate-950 shadow-[0_0_24px_rgba(34,211,238,0.28)]',
                className,
            )}
            {...props}
        >
            <Mic2 className="size-3/5" />
        </div>
    );
}
