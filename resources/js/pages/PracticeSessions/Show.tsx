import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, BarChart3, Clock3, FilePlus2, Mic2, Target } from 'lucide-react';
import { create, index } from '@/actions/App/Http/Controllers/PracticeSessionController';
import { store as storeRecording } from '@/actions/App/Http/Controllers/PracticeSessionRecordingController';
import { show as showFeedbackReport } from '@/actions/App/Http/Controllers/SpeakingFeedbackReportController';
import { AudioRecorder } from '@/components/practice/audio-recorder';
import { Button } from '@/components/ui/button';
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

export default function Show({ session }: ShowProps) {
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
                                        <Link href={showFeedbackReport(session.id)}>
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
                            <h2 className="text-lg font-semibold">
                                Objective
                            </h2>
                            <p className="mt-3 text-sm leading-7 text-muted-foreground">
                                {session.objective}
                            </p>
                        </div>
                    </div>

                    <div className="mt-6">
                        <AudioRecorder
                            targetDurationSeconds={
                                session.target_duration_seconds
                            }
                            uploadUrl={storeRecording.url(session.id)}
                            hasStoredRecording={Boolean(session.recording)}
                            disabled={session.status === 'analyzed'}
                            disabledReason="This session has already been analyzed, so recording is locked."
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
