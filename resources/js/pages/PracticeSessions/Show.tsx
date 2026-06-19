import { Head, Link, router, usePoll } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowRight,
    ArrowLeft,
    BarChart3,
    Clock3,
    FilePlus2,
    Mic2,
    RefreshCw,
    Target,
} from 'lucide-react';
import { useState } from 'react';
import {
    create,
    index,
} from '@/actions/App/Http/Controllers/PracticeSessionController';
import {
    playback as playbackRecording,
    store as storeRecording,
} from '@/actions/App/Http/Controllers/PracticeSessionRecordingController';
import {
    analysis as retryAnalysis,
    transcription as retryTranscription,
} from '@/actions/App/Http/Controllers/PracticeSessionRetryController';
import { show as showFeedbackReport } from '@/actions/App/Http/Controllers/SpeakingFeedbackReportController';
import { AudioRecorder } from '@/components/practice/audio-recorder';
import { RetryProcessingButton } from '@/components/practice/retry-processing-button';
import { StoredRecordingPlayer } from '@/components/practice/stored-recording-player';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { PracticeSession } from '@/types';

type ShowProps = {
    session: PracticeSession;
};

function formatOption(value: string): string {
    return value
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

function formatDuration(seconds: number): string {
    const minutes = Math.round(seconds / 60);

    return `${minutes} minute${minutes === 1 ? '' : 's'}`;
}

function statusTone(status: PracticeSession['status']): string {
    if (status === 'failed') {
        return 'border-destructive/30 bg-destructive/10 text-destructive';
    }

    if (status === 'analyzed') {
        return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200';
    }

    if (status === 'transcribing' || status === 'analyzing') {
        return 'border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-200';
    }

    if (status === 'recorded' || status === 'transcribed') {
        return 'border-cyan-500/30 bg-cyan-500/10 text-cyan-700 dark:text-cyan-200';
    }

    return 'border-border bg-muted text-muted-foreground';
}

function processingMessage(status: PracticeSession['status']): string | null {
    if (status === 'transcribing') {
        return 'Your recording is being transcribed. The transcript will appear before AI analysis begins.';
    }

    if (status === 'transcribed') {
        return 'Your transcript is ready and queued for AI feedback analysis. This page will keep checking for updates.';
    }

    if (status === 'analyzing') {
        return 'Your AI coach is analyzing clarity, pace, confidence, structure, and filler words. This page will keep checking for updates.';
    }

    return null;
}

function nextAction(session: PracticeSession): {
    title: string;
    description: string;
    label: string;
    href: string;
    variant: 'default' | 'outline';
} {
    if (session.status === 'draft') {
        return {
            title: 'Record this session',
            description:
                'Your setup is ready. Record a take, review it, then upload when it feels right.',
            label: 'Go to recorder',
            href: '#recording',
            variant: 'default',
        };
    }

    if (session.status === 'recorded') {
        return {
            title: 'Recording saved',
            description:
                'You can replace the recording before transcription begins, or wait for processing to continue.',
            label: 'Review recording',
            href: '#recording',
            variant: 'outline',
        };
    }

    if (session.status === 'analyzed' && session.feedback_report) {
        return {
            title: 'Feedback is ready',
            description:
                'Start with the top recommendations, then use one point as your next practice focus.',
            label: 'View feedback report',
            href: showFeedbackReport.url(session.feedback_report.id),
            variant: 'default',
        };
    }

    if (session.status === 'failed') {
        return {
            title: 'Processing needs attention',
            description:
                'Use the retry option below to queue the failed step again.',
            label: 'Review issue',
            href: '#processing-status',
            variant: 'outline',
        };
    }

    return {
        title: 'Processing in progress',
        description:
            'This page checks for updates while transcription or analysis is running.',
        label: 'Check status',
        href: '#processing-status',
        variant: 'outline',
    };
}

export default function Show({ session }: ShowProps) {
    const [isRefreshingStatus, setIsRefreshingStatus] = useState(false);
    const message = processingMessage(session.status);
    const action = nextAction(session);
    const isProcessing = ['transcribing', 'transcribed', 'analyzing'].includes(
        session.status,
    );
    const recordingLocked = [
        'transcribing',
        'transcribed',
        'analyzing',
        'analyzed',
    ].includes(session.status);
    const canRetryAnalysis =
        session.status === 'failed' &&
        Boolean(session.transcript) &&
        session.feedback_report?.status === 'failed';
    const canRetryTranscription =
        session.status === 'failed' &&
        Boolean(session.recording) &&
        !session.transcript &&
        !session.feedback_report;

    usePoll(
        10000,
        {
            preserveScroll: true,
            preserveState: true,
        },
        {
            autoStart: isProcessing,
        },
    );

    function refreshStatus(): void {
        setIsRefreshingStatus(true);

        router.reload({
            preserveScroll: true,
            preserveState: true,
            onFinish: () => setIsRefreshingStatus(false),
        });
    }

    return (
        <>
            <Head title={session.title} />

            <div className="min-h-full bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
                <div className="mx-auto max-w-5xl">
                    <Link
                        href={index()}
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
                    >
                        <ArrowLeft className="size-4" />
                        Back to sessions
                    </Link>

                    <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-8">
                        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                            <div>
                                <p className="text-sm font-semibold text-cyan-700 dark:text-cyan-200">
                                    {formatOption(session.status)} session
                                </p>
                                <span
                                    className={cn(
                                        'mt-3 inline-flex rounded-full border px-3 py-1 text-xs font-semibold',
                                        statusTone(session.status),
                                    )}
                                >
                                    {formatOption(session.status)}
                                </span>
                                <h1 className="mt-3 text-3xl font-semibold tracking-normal sm:text-4xl">
                                    {session.title}
                                </h1>
                                <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                                    {session.topic}
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row">
                                {session.feedback_report && (
                                    <Button asChild variant="outline">
                                        <Link
                                            href={showFeedbackReport(
                                                session.feedback_report.id,
                                            )}
                                        >
                                            <BarChart3 className="size-4" />
                                            View report
                                        </Link>
                                    </Button>
                                )}
                                <Button asChild>
                                    <Link href={create()}>
                                        <FilePlus2 className="size-4" />
                                        New session
                                    </Link>
                                </Button>
                            </div>
                        </div>

                        <div className="mt-8 grid gap-4 md:grid-cols-3">
                            <div className="rounded-2xl border border-border bg-background p-4">
                                <Mic2 className="size-5 text-cyan-700 dark:text-cyan-200" />
                                <p className="mt-3 text-sm text-muted-foreground">
                                    Session type
                                </p>
                                <p className="mt-1 font-semibold">
                                    {formatOption(session.session_type)}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-border bg-background p-4">
                                <Clock3 className="size-5 text-cyan-700 dark:text-cyan-200" />
                                <p className="mt-3 text-sm text-muted-foreground">
                                    Target duration
                                </p>
                                <p className="mt-1 font-semibold">
                                    {formatDuration(
                                        session.target_duration_seconds,
                                    )}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-border bg-background p-4">
                                <Target className="size-5 text-cyan-700 dark:text-cyan-200" />
                                <p className="mt-3 text-sm text-muted-foreground">
                                    Created
                                </p>
                                <p className="mt-1 font-semibold">
                                    {new Date(
                                        session.created_at,
                                    ).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 rounded-2xl border border-border bg-background p-5">
                            <h2 className="text-lg font-semibold">Objective</h2>
                            <p className="mt-3 text-sm leading-7 text-muted-foreground">
                                {session.objective}
                            </p>
                        </div>

                        <div
                            id="processing-status"
                            className="mt-6 rounded-2xl border border-cyan-500/25 bg-cyan-500/10 p-5"
                        >
                            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                                <div>
                                    <h2 className="font-semibold">
                                        {action.title}
                                    </h2>
                                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                        {action.description}
                                    </p>
                                </div>
                                <Button
                                    asChild
                                    variant={action.variant}
                                    className="w-full sm:w-auto"
                                >
                                    {action.href.startsWith('#') ? (
                                        <a href={action.href}>
                                            {action.label}
                                            <ArrowRight className="size-4" />
                                        </a>
                                    ) : (
                                        <Link href={action.href}>
                                            {action.label}
                                            <ArrowRight className="size-4" />
                                        </Link>
                                    )}
                                </Button>
                            </div>
                        </div>

                        {message && (
                            <div className="mt-6 rounded-2xl border border-violet-500/25 bg-violet-500/10 p-5 text-violet-900 dark:text-violet-100">
                                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 font-semibold">
                                            <Clock3 className="size-5 animate-pulse" />
                                            Processing update
                                        </div>
                                        <p className="mt-2 text-sm leading-6">
                                            {message}
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full bg-background sm:w-auto"
                                        onClick={refreshStatus}
                                        disabled={isRefreshingStatus}
                                    >
                                        <RefreshCw
                                            className={cn(
                                                'size-4',
                                                isRefreshingStatus &&
                                                    'animate-spin',
                                            )}
                                        />
                                        {isRefreshingStatus
                                            ? 'Checking...'
                                            : 'Refresh status'}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {(canRetryTranscription || canRetryAnalysis) && (
                            <div className="mt-6 rounded-2xl border border-destructive/30 bg-destructive/10 p-5 text-destructive">
                                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                                    <div>
                                        <div className="flex items-center gap-2 font-semibold">
                                            <AlertCircle className="size-5" />
                                            Processing failed
                                        </div>
                                        <p className="mt-2 text-sm">
                                            {canRetryAnalysis
                                                ? 'The transcript is ready, but AI feedback analysis failed. You can queue a fresh analysis attempt.'
                                                : 'The recording could not be transcribed. You can queue a fresh transcription attempt.'}
                                        </p>
                                    </div>
                                    {canRetryAnalysis ? (
                                        <RetryProcessingButton
                                            action={retryAnalysis.url(
                                                session.id,
                                            )}
                                            label="Retry analysis"
                                        />
                                    ) : (
                                        <RetryProcessingButton
                                            action={retryTranscription.url(
                                                session.id,
                                            )}
                                            label="Retry transcription"
                                        />
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-6" id="recording">
                        <StoredRecordingPlayer
                            recording={session.recording}
                            playbackUrl={playbackRecording.url(session.id)}
                        />
                    </div>

                    <div className="mt-6">
                        <AudioRecorder
                            targetDurationSeconds={
                                session.target_duration_seconds
                            }
                            uploadUrl={storeRecording.url(session.id)}
                            hasStoredRecording={Boolean(session.recording)}
                            disabled={recordingLocked}
                            disabledReason={
                                session.status === 'analyzed'
                                    ? 'This session has already been analyzed, so recording is locked.'
                                    : 'This session is already being processed, so recording is locked.'
                            }
                        />
                    </div>
                </div>
            </div>
        </>
    );
}

Show.layout = {
    breadcrumbs: [
        {
            title: 'Practice sessions',
            href: index(),
        },
    ],
};
