type RecordingTimerProps = {
    elapsedSeconds: number;
    targetSeconds: number;
};

function formatSeconds(totalSeconds: number): string {
    const minutes = Math.floor(totalSeconds / 60)
        .toString()
        .padStart(2, '0');
    const seconds = Math.floor(totalSeconds % 60)
        .toString()
        .padStart(2, '0');

    return `${minutes}:${seconds}`;
}

export function RecordingTimer({
    elapsedSeconds,
    targetSeconds,
}: RecordingTimerProps) {
    const progress = Math.min((elapsedSeconds / targetSeconds) * 100, 100);
    const remainingSeconds = Math.max(targetSeconds - elapsedSeconds, 0);

    return (
        <div className="relative overflow-hidden rounded-2xl border border-border bg-background/80 p-4">
            <div className="absolute inset-x-0 top-0 h-16 bg-linear-to-b from-cyan-500/10 to-transparent" />
            <div className="relative flex items-center justify-between gap-4">
                <div className="min-w-0">
                    <p className="text-sm text-muted-foreground">Elapsed</p>
                    <p className="mt-1 font-mono text-4xl font-semibold tracking-normal text-foreground">
                        {formatSeconds(elapsedSeconds)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        {formatSeconds(remainingSeconds)} remaining
                    </p>
                </div>

                <div
                    className="relative flex size-20 shrink-0 items-center justify-center rounded-full"
                    style={{
                        background: `conic-gradient(var(--color-cyan-500) ${progress * 3.6}deg, var(--color-muted) 0deg)`,
                    }}
                    aria-hidden="true"
                >
                    <div className="flex size-16 items-center justify-center rounded-full border border-border bg-background shadow-sm">
                        <span className="font-mono text-sm font-semibold">
                            {Math.round(progress)}%
                        </span>
                    </div>
                </div>
            </div>

            <div className="relative mt-4 grid grid-cols-3 gap-2">
                {['Warm-up', 'Focus', 'Finish'].map((label, index) => {
                    const threshold = (index + 1) * 33.34;
                    const active =
                        progress >= threshold || progress > index * 33.34;

                    return (
                        <div
                            key={label}
                            className="rounded-xl border border-border bg-card/70 px-3 py-2"
                        >
                            <p className="text-xs text-muted-foreground">
                                {label}
                            </p>
                            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                                <div
                                    className="h-full rounded-full bg-linear-to-r from-cyan-400 to-violet-500 transition-all duration-500"
                                    style={{
                                        width: active ? '100%' : '0%',
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="relative mt-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="text-xs font-medium text-muted-foreground">
                        Session target
                    </p>
                    <p className="font-mono text-xs font-semibold text-muted-foreground">
                        {formatSeconds(targetSeconds)}
                    </p>
                </div>
                <div
                    className="h-2 overflow-hidden rounded-full bg-muted"
                    aria-label="Recording progress"
                    aria-valuemax={targetSeconds}
                    aria-valuemin={0}
                    aria-valuenow={Math.min(elapsedSeconds, targetSeconds)}
                    role="progressbar"
                >
                    <div
                        className="h-full rounded-full bg-linear-to-r from-cyan-400 via-violet-500 to-fuchsia-500 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </div>
    );
}

export function formatRecordingDuration(seconds: number): string {
    return formatSeconds(seconds);
}
