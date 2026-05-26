import { Head, Link } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    CheckCircle2,
    Lightbulb,
    MessageSquareText,
    Sparkles,
} from 'lucide-react';
import type { ReactNode } from 'react';

import { index, show } from '@/actions/App/Http/Controllers/PracticeSessionController';
import { Button } from '@/components/ui/button';
import type { PracticeSession, SpeakingFeedbackReport } from '@/types';

type FeedbackReportProps = {
    session: PracticeSession;
};

type ScoreCardProps = {
    label: string;
    value: number | null;
};

function ScoreCard({ label, value }: ScoreCardProps) {
    return (
        <div className="rounded-2xl border border-border bg-background p-4">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-normal">
                {value ?? '--'}
                {value !== null && (
                    <span className="text-base text-muted-foreground">
                        /100
                    </span>
                )}
            </p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                <div
                    className="h-full rounded-full bg-linear-to-r from-cyan-400 to-violet-500"
                    style={{ width: `${value ?? 0}%` }}
                />
            </div>
        </div>
    );
}

function FeedbackList({
    icon,
    items,
    title,
}: {
    icon: ReactNode;
    items: string[] | null;
    title: string;
}) {
    return (
        <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2">
                {icon}
                <h2 className="text-lg font-semibold">{title}</h2>
            </div>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
                {(items?.length ? items : ['Feedback is not available yet.']).map(
                    (item) => (
                        <li key={item} className="rounded-xl bg-background p-3">
                            {item}
                        </li>
                    ),
                )}
            </ul>
        </div>
    );
}

function StatusPanel({ report }: { report: SpeakingFeedbackReport | null }) {
    if (report?.status === 'failed') {
        return (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-5 text-destructive">
                <div className="flex items-center gap-2 font-semibold">
                    <AlertCircle className="size-5" />
                    Analysis failed
                </div>
                <p className="mt-2 text-sm">{report.error_message}</p>
            </div>
        );
    }

    if (!report || report.status === 'pending' || report.status === 'processing') {
        return (
            <div className="rounded-2xl border border-cyan-500/25 bg-cyan-500/10 p-5 text-cyan-900 dark:text-cyan-100">
                <div className="flex items-center gap-2 font-semibold">
                    <Sparkles className="size-5" />
                    AI analysis is in progress
                </div>
                <p className="mt-2 text-sm">
                    Your transcript is ready and the feedback report will appear
                    here when analysis completes.
                </p>
            </div>
        );
    }

    return null;
}

export default function FeedbackReport({ session }: FeedbackReportProps) {
    const report = session.feedback_report ?? null;
    const transcript = session.transcript ?? null;

    return (
        <>
            <Head title={`${session.title} feedback`} />

            <div className="min-h-full bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
                <div className="mx-auto max-w-6xl">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        <Link
                            href={show(session.id)}
                            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
                        >
                            <ArrowLeft className="size-4" />
                            Back to session
                        </Link>

                        <Button asChild variant="outline">
                            <Link href={index()}>All sessions</Link>
                        </Button>
                    </div>

                    <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-8">
                        <p className="text-sm font-semibold text-cyan-700 dark:text-cyan-200">
                            AI feedback report
                        </p>
                        <div className="mt-3 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
                            <div>
                                <h1 className="text-3xl font-semibold tracking-normal sm:text-4xl">
                                    {session.title}
                                </h1>
                                <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
                                    {session.topic}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-border bg-background px-5 py-4">
                                <p className="text-sm text-muted-foreground">
                                    Overall score
                                </p>
                                <p className="mt-1 text-4xl font-semibold tracking-normal">
                                    {report?.overall_score ?? '--'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6">
                        <StatusPanel report={report} />
                    </div>

                    {report && (
                        <>
                            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                                <ScoreCard
                                    label="Clarity"
                                    value={report.clarity_score}
                                />
                                <ScoreCard
                                    label="Structure"
                                    value={report.structure_score}
                                />
                                <ScoreCard
                                    label="Confidence"
                                    value={report.confidence_score}
                                />
                                <ScoreCard label="Pace" value={report.pace_score} />
                                <ScoreCard
                                    label="Filler words"
                                    value={report.filler_word_score}
                                />
                            </div>

                            <div className="mt-6 rounded-2xl border border-border bg-card p-5">
                                <div className="flex items-center gap-2">
                                    <MessageSquareText className="size-5 text-cyan-700 dark:text-cyan-200" />
                                    <h2 className="text-lg font-semibold">
                                        Summary
                                    </h2>
                                </div>
                                <p className="mt-4 text-sm leading-7 text-muted-foreground">
                                    {report.summary_feedback}
                                </p>
                            </div>

                            <div className="mt-6 grid gap-5 lg:grid-cols-3">
                                <FeedbackList
                                    title="Strengths"
                                    icon={
                                        <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-300" />
                                    }
                                    items={report.strengths}
                                />
                                <FeedbackList
                                    title="Weaknesses"
                                    icon={
                                        <AlertCircle className="size-5 text-amber-600 dark:text-amber-300" />
                                    }
                                    items={report.weaknesses}
                                />
                                <FeedbackList
                                    title="Recommendations"
                                    icon={
                                        <Lightbulb className="size-5 text-violet-600 dark:text-violet-300" />
                                    }
                                    items={report.recommendations}
                                />
                            </div>

                            <div className="mt-6 grid gap-5 lg:grid-cols-2">
                                <div className="rounded-2xl border border-border bg-card p-5">
                                    <h2 className="text-lg font-semibold">
                                        Filler words
                                    </h2>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {(report.filler_words?.length
                                            ? report.filler_words
                                            : [{ word: 'None detected', count: 0 }]
                                        ).map((item) => (
                                            <span
                                                key={item.word}
                                                className="rounded-full border border-border bg-background px-3 py-1 text-sm"
                                            >
                                                {item.word}: {item.count}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-border bg-card p-5">
                                    <h2 className="text-lg font-semibold">
                                        Improved version
                                    </h2>
                                    <p className="mt-4 text-sm leading-7 text-muted-foreground">
                                        {report.improved_version ??
                                            'No improved version is available yet.'}
                                    </p>
                                </div>
                            </div>
                        </>
                    )}

                    <div className="mt-6 rounded-2xl border border-border bg-card p-5">
                        <h2 className="text-lg font-semibold">Transcript</h2>
                        <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
                            {transcript?.text ??
                                'Transcript is not available yet.'}
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}

FeedbackReport.layout = {
    breadcrumbs: [
        {
            title: 'Practice sessions',
            href: index(),
        },
        {
            title: 'Feedback report',
            href: '#',
        },
    ],
};
