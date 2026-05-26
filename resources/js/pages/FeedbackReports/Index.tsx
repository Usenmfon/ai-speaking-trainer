import { Head, Link } from '@inertiajs/react';
import { BarChart3, Clock3, FileText, Plus } from 'lucide-react';

import { create } from '@/actions/App/Http/Controllers/PracticeSessionController';
import {
    index as reportsIndex,
    show,
} from '@/actions/App/Http/Controllers/SpeakingFeedbackReportController';
import { getScoreTone } from '@/components/feedback/score-card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { SpeakingFeedbackReport } from '@/types';

type IndexProps = {
    reports: SpeakingFeedbackReport[];
};

function formatDate(value: string | null): string {
    if (!value) {
        return 'Processing';
    }

    return new Date(value).toLocaleDateString();
}

export default function Index({ reports }: IndexProps) {
    return (
        <>
            <Head title="Feedback reports" />

            <div className="min-h-full bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
                <div className="mx-auto max-w-6xl">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                        <div>
                            <p className="text-sm font-semibold text-cyan-700 dark:text-cyan-200">
                                AI feedback
                            </p>
                            <h1 className="mt-2 text-3xl font-semibold tracking-normal sm:text-4xl">
                                Feedback reports
                            </h1>
                            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                                Review your analyzed speaking sessions, track
                                score patterns, and turn feedback into focused
                                practice.
                            </p>
                        </div>

                        <Button asChild>
                            <Link href={create()}>
                                <Plus className="size-4" />
                                New practice
                            </Link>
                        </Button>
                    </div>

                    {reports.length === 0 ? (
                        <div className="mt-8 rounded-2xl border border-dashed border-border bg-card p-8 text-center">
                            <FileText className="mx-auto size-10 text-cyan-700 dark:text-cyan-200" />
                            <h2 className="mt-4 text-xl font-semibold">
                                No feedback reports yet
                            </h2>
                            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                                Complete a recording and analysis will generate
                                a detailed report here.
                            </p>
                            <Button asChild className="mt-5">
                                <Link href={create()}>
                                    <Plus className="size-4" />
                                    Start a session
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {reports.map((report) => {
                                const tone = getScoreTone(report.overall_score);

                                return (
                                    <Link
                                        key={report.id}
                                        href={show(report.id)}
                                        className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-400/50 hover:shadow-lg"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-sm text-muted-foreground">
                                                    {report.practice_session
                                                        ?.session_type.replaceAll(
                                                            '_',
                                                            ' ',
                                                        ) ?? 'Practice session'}
                                                </p>
                                                <h2 className="mt-2 line-clamp-2 text-lg font-semibold">
                                                    {report.practice_session
                                                        ?.title ??
                                                        'Untitled report'}
                                                </h2>
                                            </div>
                                            <span
                                                className={cn(
                                                    'rounded-full border px-2.5 py-1 text-xs font-semibold',
                                                    tone.badge,
                                                )}
                                            >
                                                {tone.label}
                                            </span>
                                        </div>

                                        <div className="mt-5 flex items-end gap-1">
                                            <span className={cn('text-4xl font-semibold', tone.text)}>
                                                {report.overall_score ?? '--'}
                                            </span>
                                            {report.overall_score !== null && (
                                                <span className="pb-1 text-sm text-muted-foreground">
                                                    /100
                                                </span>
                                            )}
                                        </div>

                                        <div className="mt-5 flex items-center justify-between gap-3 text-sm text-muted-foreground">
                                            <span className="inline-flex items-center gap-2">
                                                <Clock3 className="size-4" />
                                                {formatDate(report.processed_at)}
                                            </span>
                                            <span className="inline-flex items-center gap-2 font-medium text-cyan-700 transition group-hover:translate-x-0.5 dark:text-cyan-200">
                                                <BarChart3 className="size-4" />
                                                Open report
                                            </span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

Index.layout = {
    breadcrumbs: [
        {
            title: 'Feedback reports',
            href: reportsIndex(),
        },
    ],
};
