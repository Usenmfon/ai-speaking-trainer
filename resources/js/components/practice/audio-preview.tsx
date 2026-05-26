import { RotateCcw, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { formatRecordingDuration } from './recording-timer';

type AudioPreviewProps = {
    audioUrl: string;
    blob: Blob;
    durationSeconds: number;
    disabled?: boolean;
    onDelete: () => void;
};

function formatBytes(bytes: number): string {
    if (bytes < 1024 * 1024) {
        return `${Math.max(bytes / 1024, 1).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AudioPreview({
    audioUrl,
    blob,
    durationSeconds,
    disabled = false,
    onDelete,
}: AudioPreviewProps) {
    return (
        <div className="rounded-2xl border border-cyan-500/25 bg-cyan-500/10 p-4 dark:border-cyan-300/20 dark:bg-cyan-300/10">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                    <p className="text-sm font-semibold text-foreground">
                        Recording preview
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {formatRecordingDuration(durationSeconds)} audio clip ·{' '}
                        {formatBytes(blob.size)}
                    </p>
                </div>

                <Button
                    type="button"
                    variant="outline"
                    onClick={onDelete}
                    disabled={disabled}
                >
                    <Trash2 className="size-4" />
                    Delete
                </Button>
            </div>

            <audio
                src={audioUrl}
                controls
                className="mt-4 w-full"
                aria-label="Recorded practice session preview"
            />

            <div className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-background/70 px-3 py-2 text-sm text-muted-foreground">
                <RotateCcw className="size-4 text-cyan-700 dark:text-cyan-200" />
                Delete this clip to record again, or confirm upload to save it.
            </div>
        </div>
    );
}
