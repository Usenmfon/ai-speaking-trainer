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

    return (
        <div className="rounded-2xl border border-border bg-background/80 p-4">
            <div className="flex items-end justify-between gap-4">
                <div>
                    <p className="text-sm text-muted-foreground">
                        Recording time
                    </p>
                    <p className="mt-1 font-mono text-3xl font-semibold tracking-normal text-foreground">
                        {formatSeconds(elapsedSeconds)}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-muted-foreground">Target</p>
                    <p className="mt-1 font-mono text-lg font-semibold text-foreground">
                        {formatSeconds(targetSeconds)}
                    </p>
                </div>
            </div>

            <div
                className="mt-4 h-2 overflow-hidden rounded-full bg-muted"
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
    );
}

export function formatRecordingDuration(seconds: number): string {
    return formatSeconds(seconds);
}
