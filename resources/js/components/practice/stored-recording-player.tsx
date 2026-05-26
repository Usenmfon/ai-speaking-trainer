import { AlertCircle, FileAudio2, RefreshCw, ShieldCheck } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import type { PracticeSessionRecording } from '@/types';

type StoredRecordingPlayerProps = {
    playbackUrl: string;
    recording: PracticeSessionRecording | null | undefined;
};

function formatBytes(bytes: number): string {
    if (bytes < 1024 * 1024) {
        return `${Math.max(bytes / 1024, 1).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDuration(seconds: number | null): string {
    if (seconds === null) {
        return 'Duration unavailable';
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function StoredRecordingPlayer({
    playbackUrl,
    recording,
}: StoredRecordingPlayerProps) {
    const [playbackKey, setPlaybackKey] = useState(0);
    const [hasPlaybackError, setHasPlaybackError] = useState(false);
    const sourceUrl = useMemo(() => {
        const separator = playbackUrl.includes('?') ? '&' : '?';

        return `${playbackUrl}${separator}refresh=${playbackKey}`;
    }, [playbackKey, playbackUrl]);

    if (!recording) {
        return (
            <section className="rounded-2xl border border-dashed border-border bg-card p-5 text-sm leading-6 text-muted-foreground shadow-sm">
                <div className="flex items-start gap-3">
                    <FileAudio2 className="mt-0.5 size-5 text-cyan-700 dark:text-cyan-200" />
                    <div>
                        <p className="font-semibold text-foreground">
                            No uploaded recording yet
                        </p>
                        <p className="mt-1">
                            After you upload a take, secure playback will appear
                            here when you return to this session.
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                    <p className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-700 dark:text-cyan-200">
                        <ShieldCheck className="size-4" />
                        Secure recording playback
                    </p>
                    <h2 className="mt-2 text-xl font-semibold tracking-normal">
                        Uploaded audio
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {recording.original_filename ?? 'Practice recording'} ·{' '}
                        {formatBytes(recording.size)} ·{' '}
                        {formatDuration(recording.duration_seconds)}
                    </p>
                </div>

                <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                        setHasPlaybackError(false);
                        setPlaybackKey((key) => key + 1);
                    }}
                >
                    <RefreshCw className="size-4" />
                    Reload player
                </Button>
            </div>

            <audio
                key={sourceUrl}
                src={sourceUrl}
                controls
                preload="metadata"
                className="mt-5 w-full"
                aria-label="Uploaded practice session recording"
                onError={() => setHasPlaybackError(true)}
            />

            {hasPlaybackError && (
                <div className="mt-4 flex gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-900 dark:text-amber-100">
                    <AlertCircle className="mt-0.5 size-4 shrink-0" />
                    <span>
                        Playback could not start. Reload the player to request a
                        fresh secure URL, then try again.
                    </span>
                </div>
            )}
        </section>
    );
}
