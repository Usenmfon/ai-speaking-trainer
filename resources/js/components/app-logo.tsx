import { Mic2 } from 'lucide-react';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-9 items-center justify-center rounded-2xl bg-linear-to-br from-cyan-300 to-violet-500 text-slate-950 shadow-[0_0_24px_rgba(34,211,238,0.28)]">
                <Mic2 className="size-5" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold text-white">
                    SpeakAI Coach
                </span>
                <span className="truncate text-xs text-slate-400">
                    Speaking trainer
                </span>
            </div>
        </>
    );
}
