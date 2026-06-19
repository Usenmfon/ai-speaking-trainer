import { router } from '@inertiajs/react';
import {
    AlertCircle,
    CheckCircle2,
    Mic,
    Pause,
    Play,
    RotateCcw,
    Square,
    UploadCloud,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { AudioPreview } from './audio-preview';
import { RecordingTimer } from './recording-timer';

type RecorderStatus =
    | 'idle'
    | 'requesting'
    | 'recording'
    | 'paused'
    | 'stopped';

type AudioRecorderProps = {
    disabled?: boolean;
    disabledReason?: string;
    hasStoredRecording?: boolean;
    targetDurationSeconds: number;
    uploadUrl: string;
};

const preferredMimeTypes = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg',
];

const mimeTypeExtensions: Record<string, string> = {
    'audio/webm': 'webm',
    'audio/ogg': 'ogg',
};

function getSupportedMimeType(): string | undefined {
    if (typeof MediaRecorder === 'undefined') {
        return undefined;
    }

    return preferredMimeTypes.find((mimeType) =>
        MediaRecorder.isTypeSupported(mimeType),
    );
}

function getPermissionMessage(error: unknown): string {
    if (error instanceof DOMException) {
        if (
            error.name === 'NotAllowedError' ||
            error.name === 'PermissionDeniedError'
        ) {
            return 'Microphone access was blocked. Enable microphone permissions in your browser to record this practice session.';
        }

        if (
            error.name === 'NotFoundError' ||
            error.name === 'DevicesNotFoundError'
        ) {
            return 'No microphone was found. Connect a microphone and try again.';
        }
    }

    return 'We could not start recording. Check your browser microphone settings and try again.';
}

export function AudioRecorder({
    disabled = false,
    disabledReason = 'Recording is disabled for this session.',
    hasStoredRecording = false,
    targetDurationSeconds,
    uploadUrl,
}: AudioRecorderProps) {
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const [status, setStatus] = useState<RecorderStatus>('idle');
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);
    const [uploadStatus, setUploadStatus] = useState<
        'idle' | 'uploading' | 'success' | 'error'
    >(hasStoredRecording ? 'success' : 'idle');

    const isRecording = status === 'recording';
    const isPaused = status === 'paused';
    const isUploading = uploadStatus === 'uploading';
    const hasRecording = recordedBlob !== null && audioUrl !== null;
    const recorderUnavailable =
        typeof window === 'undefined' ||
        !navigator.mediaDevices?.getUserMedia ||
        typeof MediaRecorder === 'undefined';
    const recordingSteps = [
        {
            title: 'Record',
            description: 'Capture a complete take.',
            complete: hasRecording || uploadStatus === 'success',
            active:
                status === 'idle' ||
                status === 'requesting' ||
                status === 'recording' ||
                status === 'paused',
        },
        {
            title: 'Preview',
            description: 'Listen before saving.',
            complete: hasRecording || uploadStatus === 'success',
            active: hasRecording && uploadStatus !== 'success',
        },
        {
            title: 'Upload',
            description: 'Confirm the take.',
            complete: uploadStatus === 'success',
            active: hasRecording && uploadStatus !== 'success',
        },
    ];

    useEffect(() => {
        if (!isRecording) {
            return;
        }

        const interval = window.setInterval(() => {
            setElapsedSeconds((seconds) =>
                Math.min(seconds + 1, targetDurationSeconds),
            );
        }, 1000);

        return () => window.clearInterval(interval);
    }, [isRecording, targetDurationSeconds]);

    useEffect(() => {
        if (isRecording && elapsedSeconds >= targetDurationSeconds) {
            stopRecording();
        }
    }, [elapsedSeconds, isRecording, targetDurationSeconds]);

    useEffect(() => {
        return () => {
            stopTracks();

            if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
            }
        };
    }, [audioUrl]);

    function stopTracks(): void {
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
    }

    function clearPreview(): void {
        if (audioUrl) {
            URL.revokeObjectURL(audioUrl);
        }

        setAudioUrl(null);
        setRecordedBlob(null);
    }

    function getRecordingFile(blob: Blob): File {
        const mimeType = blob.type.split(';')[0] || 'audio/webm';
        const extension = mimeTypeExtensions[mimeType] ?? 'webm';

        return new File(
            [blob],
            `practice-session-recording-${Date.now()}.${extension}`,
            { type: mimeType },
        );
    }

    async function startRecording(): Promise<void> {
        if (disabled || recorderUnavailable || isUploading) {
            return;
        }

        clearPreview();
        chunksRef.current = [];
        setElapsedSeconds(0);
        setError(null);
        setUploadError(null);
        setUploadProgress(null);
        setUploadStatus('idle');
        setStatus('requesting');

        try {
            const mimeType = getSupportedMimeType();

            if (!mimeType) {
                setError(
                    'Your browser cannot record in a supported audio format for upload.',
                );
                setStatus('idle');

                return;
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                },
            });
            const mediaRecorder = new MediaRecorder(stream, { mimeType });

            streamRef.current = stream;
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (event: BlobEvent) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onerror = () => {
                setError(
                    'Recording stopped because the browser reported an audio capture error.',
                );
                stopTracks();
                setStatus('idle');
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, {
                    type: mediaRecorder.mimeType || 'audio/webm',
                });

                if (blob.size > 0) {
                    setRecordedBlob(blob);
                    setAudioUrl(URL.createObjectURL(blob));
                }

                stopTracks();
                setStatus('stopped');
            };

            mediaRecorder.start(1000);
            setStatus('recording');
        } catch (startError) {
            setError(getPermissionMessage(startError));
            stopTracks();
            setStatus('idle');
        }
    }

    function pauseRecording(): void {
        const mediaRecorder = mediaRecorderRef.current;

        if (mediaRecorder?.state === 'recording') {
            mediaRecorder.pause();
            setStatus('paused');
        }
    }

    function resumeRecording(): void {
        const mediaRecorder = mediaRecorderRef.current;

        if (mediaRecorder?.state === 'paused') {
            mediaRecorder.resume();
            setStatus('recording');
        }
    }

    function stopRecording(): void {
        const mediaRecorder = mediaRecorderRef.current;

        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
        }
    }

    function deleteRecording(): void {
        chunksRef.current = [];
        setElapsedSeconds(0);
        clearPreview();
        setError(null);
        setUploadError(null);
        setUploadProgress(null);
        setUploadStatus(hasStoredRecording ? 'success' : 'idle');
        setStatus('idle');
    }

    function uploadRecording(): void {
        if (!recordedBlob || disabled || isUploading) {
            return;
        }

        const audioFile = getRecordingFile(recordedBlob);
        const formData = new FormData();
        formData.append('audio', audioFile, audioFile.name);

        if (elapsedSeconds > 0) {
            formData.append('duration_seconds', String(elapsedSeconds));
        }

        if (import.meta.env.DEV) {
            console.info('Uploading practice recording', {
                name: audioFile.name,
                size: audioFile.size,
                type: audioFile.type,
                uploadUrl,
            });
        }

        setUploadError(null);
        setUploadProgress(0);
        setUploadStatus('uploading');

        router.post(uploadUrl, formData, {
            forceFormData: true,
            preserveScroll: true,
            onProgress: (progress) => {
                setUploadProgress(progress?.percentage ?? 0);
            },
            onError: (errors) => {
                setUploadStatus('error');
                setUploadError(
                    errors.audio ??
                        errors.duration_seconds ??
                        'The recording could not be uploaded. Please try again.',
                );
            },
            onCancel: () => {
                setUploadStatus('idle');
                setUploadProgress(null);
            },
            onSuccess: () => {
                setUploadProgress(100);
                setUploadStatus('success');
            },
        });
    }

    return (
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                <div>
                    <p className="text-sm font-semibold text-cyan-700 dark:text-cyan-200">
                        Audio recorder
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-normal">
                        Record this practice session
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                        Capture your speech locally in the browser, review the
                        audio, then re-record until it feels ready.
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Nothing leaves your browser until you confirm the
                        upload.
                    </p>
                </div>

                <div
                    className={cn(
                        'inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium',
                        isRecording
                            ? 'border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-200'
                            : 'border-border bg-background text-muted-foreground',
                    )}
                >
                    <span
                        className={cn(
                            'size-2 rounded-full',
                            isRecording
                                ? 'animate-pulse bg-rose-500'
                                : 'bg-muted-foreground/50',
                        )}
                    />
                    {status === 'requesting'
                        ? 'Requesting microphone'
                        : status === 'paused'
                          ? 'Paused'
                          : status === 'recording'
                            ? 'Recording'
                            : hasRecording
                              ? 'Preview ready'
                              : 'Ready'}
                </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {recordingSteps.map((step, index) => (
                    <div
                        key={step.title}
                        className={cn(
                            'rounded-xl border p-3',
                            step.active || step.complete
                                ? 'border-cyan-500/30 bg-cyan-500/10'
                                : 'border-border bg-background/70',
                        )}
                    >
                        <div className="flex items-center gap-2">
                            <span
                                className={cn(
                                    'flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold',
                                    step.complete
                                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200'
                                        : step.active
                                          ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-700 dark:text-cyan-200'
                                          : 'border-border text-muted-foreground',
                                )}
                            >
                                {step.complete ? (
                                    <CheckCircle2 className="size-4" />
                                ) : (
                                    index + 1
                                )}
                            </span>
                            <p className="font-medium">{step.title}</p>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            {step.description}
                        </p>
                    </div>
                ))}
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-2xl border border-border bg-background/80 p-5">
                    <div
                        className={cn(
                            'flex min-h-48 items-center justify-center gap-1 overflow-hidden rounded-2xl border border-border bg-linear-to-br from-background via-cyan-500/10 to-violet-500/10 px-4',
                            disabled && 'opacity-70',
                        )}
                        aria-hidden="true"
                    >
                        {Array.from({ length: 38 }).map((_, index) => (
                            <span
                                key={index}
                                className={cn(
                                    'w-1 rounded-full bg-cyan-500/70 dark:bg-cyan-200/80',
                                    isRecording && 'animate-pulse',
                                )}
                                style={{
                                    height: `${18 + ((index * 17) % 84)}px`,
                                    animationDelay: `${(index % 8) * 90}ms`,
                                }}
                            />
                        ))}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3">
                        <Button
                            type="button"
                            onClick={startRecording}
                            disabled={
                                disabled ||
                                recorderUnavailable ||
                                isUploading ||
                                status === 'requesting' ||
                                isRecording ||
                                isPaused
                            }
                        >
                            <Mic className="size-4" />
                            {hasRecording ? 'Record again' : 'Start recording'}
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={pauseRecording}
                            disabled={!isRecording || isUploading}
                        >
                            <Pause className="size-4" />
                            Pause
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={resumeRecording}
                            disabled={!isPaused || isUploading}
                        >
                            <Play className="size-4" />
                            Resume
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={stopRecording}
                            disabled={
                                (!isRecording && !isPaused) || isUploading
                            }
                        >
                            <Square className="size-4" />
                            Stop
                        </Button>

                        {hasRecording && (
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={deleteRecording}
                                disabled={disabled || isUploading}
                            >
                                <RotateCcw className="size-4" />
                                Re-record
                            </Button>
                        )}
                    </div>

                    {(disabled || recorderUnavailable || error) && (
                        <div className="mt-4 flex gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-900 dark:text-amber-100">
                            <AlertCircle className="mt-0.5 size-4 shrink-0" />
                            <p>
                                {disabled
                                    ? disabledReason
                                    : recorderUnavailable
                                      ? 'Your browser does not support in-browser audio recording.'
                                      : error}
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-5">
                    <RecordingTimer
                        elapsedSeconds={elapsedSeconds}
                        targetSeconds={targetDurationSeconds}
                    />

                    {hasRecording ? (
                        <div className="flex flex-col gap-4">
                            <AudioPreview
                                audioUrl={audioUrl}
                                blob={recordedBlob}
                                durationSeconds={elapsedSeconds}
                                disabled={disabled || isUploading}
                                onDelete={deleteRecording}
                            />

                            <div className="rounded-2xl border border-border bg-background/70 p-4">
                                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">
                                            Step 3: Upload recording
                                        </p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Confirm this take to save it with
                                            your practice session.
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        onClick={uploadRecording}
                                        disabled={disabled || isUploading}
                                    >
                                        <UploadCloud className="size-4" />
                                        {isUploading
                                            ? 'Uploading...'
                                            : 'Confirm upload'}
                                    </Button>
                                </div>

                                {uploadProgress !== null && (
                                    <div
                                        className="mt-4 h-2 overflow-hidden rounded-full bg-muted"
                                        aria-label="Upload progress"
                                        aria-valuemax={100}
                                        aria-valuemin={0}
                                        aria-valuenow={uploadProgress}
                                        role="progressbar"
                                    >
                                        <div
                                            className="h-full rounded-full bg-linear-to-r from-cyan-400 to-violet-500 transition-all"
                                            style={{
                                                width: `${uploadProgress}%`,
                                            }}
                                        />
                                    </div>
                                )}

                                {uploadStatus === 'success' && (
                                    <div className="mt-4 flex gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-800 dark:text-emerald-100">
                                        <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                                        <span>
                                            Recording saved. You can re-record
                                            and upload again until analysis
                                            starts.
                                        </span>
                                    </div>
                                )}

                                {uploadStatus === 'error' && uploadError && (
                                    <div className="mt-4 flex gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                                        <AlertCircle className="mt-0.5 size-4 shrink-0" />
                                        <span>{uploadError}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-dashed border-border bg-background/70 p-5 text-sm leading-6 text-muted-foreground">
                            {hasStoredRecording
                                ? 'A recording has already been saved for this session. Record again to replace it before analysis starts.'
                                : 'Your audio preview will appear here after you stop recording.'}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
