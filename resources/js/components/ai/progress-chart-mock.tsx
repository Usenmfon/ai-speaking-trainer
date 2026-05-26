import { cn } from '@/lib/utils';

type ProgressChartMockProps = {
    className?: string;
};

const chartBars = [42, 58, 51, 72, 68, 86, 80, 92, 88, 96];

export function ProgressChartMock({ className }: ProgressChartMockProps) {
    return (
        <div className={cn('flex h-36 items-end gap-2', className)}>
            {chartBars.map((value, index) => (
                <div
                    key={index}
                    className="flex flex-1 items-end rounded-full bg-muted dark:bg-white/6"
                >
                    <div
                        className="w-full rounded-full bg-linear-to-t from-violet-500 via-blue-400 to-cyan-300 shadow-[0_0_22px_rgba(56,189,248,0.25)]"
                        style={{ height: `${value}%` }}
                    />
                </div>
            ))}
        </div>
    );
}
