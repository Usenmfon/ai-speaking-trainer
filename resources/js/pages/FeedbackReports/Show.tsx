import { Head, Link } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    CheckCircle2,
    Clock3,
    Lightbulb,
    MessageSquareText,
    Mic2,
    Sparkles,
} from 'lucide-react';

import { show as showSession } from '@/actions/App/Http/Controllers/PracticeSessionController';
import {
    index as reportsIndex,
} from '@/actions/App/Http/Controllers/SpeakingFeedbackReportController';
import { FeedbackList } from '@/components/feedback/feedback-list';
import { ReportStatusPanel } from '@/components/feedback/report-status-panel';
import { getScoreTone, ScoreCard } from '@/components/feedback/score-card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { PracticeSession, SpeakingFeedbackReport } from '@/types';

type ShowProps = {
    report: SpeakingFeedbackReport | null;
    session?: PracticeSession;
};

function formatDate(value: string | null | undefined): string {
    if (!value) {
        return 'Processing';
    }

    return new Date(value).toLocaleString();
}

function formatStatus(status: string | undefined): string {
    if (!status) {
        return 'Processing';
    }

    return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function Show({ report, session: fallbackSession }: ShowProps) {
    const session = report?.practice_session ?? fallbackSession ?? null;
    const transcript = report?.transcript ?? session?.transcript ?? null;
    const overallTone = getScoreTone(report?.overall_score ?? null);

    return (
        <>
            <Head title={`${session?.title ?? 'Feedback report'} feedback`} />

            <div className="min-h-full bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
                <div className="mx-auto max-w-6xl">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        <Link
                            href={reportsIndex()}
                            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
                        >
                            <ArrowLeft className="size-4" />
                            Back to reports
                        </Link>

                        {session && (
                            <Button asChild variant="outline">
                                <Link href={showSession(session.id)}>
                                    <Mic2 className="size-4" />
                                    Practice session
                                </Link>
                            </Button>
                        )}
                    </div>

                    <section className="mt-6 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                        <div className="bg-linear-to-br from-cyan-500/10 via-violet-500/10 to-background p-5 sm:p-8">
                            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
                                <div>
                                    <p className="inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1 text-sm font-semibold text-cyan-700 dark:text-cyan-200">
                                        <Sparkles className="size-4" />
                                        AI feedback report
                                    </p>
                                    <h1 className="mt-4 text-3xl font-semibold tracking-normal sm:text-4xl">
                                        {session?.title ?? 'Report processing'}
                                    </h1>
                                    <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
                                        {session?.topic ??
                                            'Your speaking analysis will appear here when processing finishes.'}
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-border bg-background/80 px-5 py-4">
                                    <p className="text-sm text-muted-foreground">
                                        Overall score
                                    </p>
                                    <div className="mt-2 flex items-end gap-1">
                                        <span
                                            className={cn(
                                                'text-5xl font-semibold',
                                                overallTone.text,
                                            )}
                                        >
                                            {report?.overall_score ?? '--'}
                                        </span>
                                        {report?.overall_score !== null &&
                                            report?.overall_score !== undefined && (
                                                <span className="pb-1 text-sm text-muted-foreground">
                                                    /100
                                                </span>
                                            )}
                                    </div>
                                    <span
                                        className={cn(
                                            'mt-3 inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold',
                                            overallTone.badge,
                                        )}
                                    >
                                        {overallTone.label}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6 flex flex-wrap gap-3 text-sm text-muted-foreground">
                                <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1">
                                    <Clock3 className="size-4" />
                                    {formatDate(report?.processed_at)}
                                </span>
                                <span className="rounded-full border border-border bg-background/80 px-3 py-1">
                                    {formatStatus(report?.status)}
                                </span>
                            </div>
                        </div>
                    </section>

                    <div className="mt-6">
                        <ReportStatusPanel report={report} />
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                        <ScoreCard
                            label="Clarity"
                            value={report?.clarity_score ?? null}
                            description="How easy your ideas are to follow."
                        />
                        <ScoreCard
                            label="Structure"
                            value={report?.structure_score ?? null}
                            description="How well the message is organized."
                        />
                        <ScoreCard
                            label="Confidence"
                            value={report?.confidence_score ?? null}
                            description="How assured and grounded you sound."
                        />
                        <ScoreCard
                            label="Pace"
                            value={report?.pace_score ?? null}
                            description="How balanced your speed feels."
                        />
                        <ScoreCard
                            label="Filler words"
                            value={report?.filler_word_score ?? null}
                            description="How cleanly you avoid verbal clutter."
                        />
                    </div>

                    <section className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <div className="flex items-center gap-2">
                            <MessageSquareText className="size-5 text-cyan-700 dark:text-cyan-200" />
                            <h2 className="text-lg font-semibold">
                                Summary feedback
                            </h2>
                        </div>
                        {report?.summary_feedback ? (
                            <p className="mt-4 text-sm leading-7 text-muted-foreground">
                                {report.summary_feedback}
                            </p>
                        ) : (
                            <div className="mt-4 space-y-3">
                                <div className="h-4 w-full animate-pulse rounded bg-muted" />
                                <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
                                <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                            </div>
                        )}
                    </section>

                    <div className="mt-6 grid gap-5 lg:grid-cols-3">
                        <FeedbackList
                            title="Strengths"
                            icon={
                                <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-300" />
                            }
                            items={report?.strengths ?? null}
                        />
                        <FeedbackList
                            title="Weaknesses"
                            icon={
                                <AlertCircle className="size-5 text-amber-600 dark:text-amber-300" />
                            }
                            items={report?.weaknesses ?? null}
                        />
                        <FeedbackList
                            title="Recommendations"
                            icon={
                                <Lightbulb className="size-5 text-violet-600 dark:text-violet-300" />
                            }
                            items={report?.recommendations ?? null}
                        />
                    </div>

                    <div className="mt-6 grid gap-5 lg:grid-cols-2">
                        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                            <h2 className="text-lg font-semibold">
                                Filler words detected
                            </h2>
                            <div className="mt-4 flex flex-wrap gap-2">
                                {(report?.filler_words?.length
                                    ? report.filler_words
                                    : [{ word: 'None detected', count: 0 }]
                                ).map((item) => (
                                    <span
                                        key={item.word}
                                        className="rounded-full border border-border bg-background px-3 py-1 text-sm text-muted-foreground"
                                    >
                                        {item.word}: {item.count}
                                    </span>
                                ))}
                            </div>
                        </section>

                        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                            <h2 className="text-lg font-semibold">
                                Improved version
                            </h2>
                            <p className="mt-4 text-sm leading-7 text-muted-foreground">
                                {report?.improved_version ??
                                    'No improved version is available yet.'}
                            </p>
                        </section>
                    </div>

                    <section className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <h2 className="text-lg font-semibold">Transcript</h2>
                        <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
                            {transcript?.text ??
                                'Transcript is not available yet.'}
                        </p>
                    </section>
                </div>
            </div>
        </>
    );
}

Show.layout = {
    breadcrumbs: [
        {
            title: 'Feedback reports',
            href: reportsIndex(),
        },
        {
            title: 'Report',
            href: '#',
        },
    ],
};
