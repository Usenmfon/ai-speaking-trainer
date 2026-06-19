import { Link } from '@inertiajs/react';
import { BarChart3, Sparkles } from 'lucide-react';

import {
    index,
    show,
} from '@/actions/App/Http/Controllers/SpeakingFeedbackReportController';
import { getScoreTone } from '@/components/feedback/score-card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { SpeakingFeedbackReport } from '@/types';

type RecentReportListProps = {
    reports: SpeakingFeedbackReport[];
};

export function RecentReportList({ reports }: RecentReportListProps) {
    return (
        <section className="min-w-0 rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                    <h2 className="text-lg font-semibold">
                        Recent feedback reports
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Scores and coaching summaries.
                    </p>
                </div>
                <Button asChild size="sm" variant="outline">
                    <Link href={index()}>
                        <BarChart3 className="size-4" />
                        View all
                    </Link>
                </Button>
            </div>

            <div className="mt-5 flex flex-col gap-3">
                {reports.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-border bg-background p-4 text-sm text-muted-foreground">
                        Feedback reports will appear after your first analyzed
                        recording.
                    </p>
                ) : (
                    reports.map((report) => {
                        const tone = getScoreTone(report.overall_score);

                        return (
                            <Link
                                key={report.id}
                                href={show(report.id)}
                                className="rounded-xl border border-border bg-background p-4 transition hover:border-cyan-400/50 hover:bg-accent"
                            >
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="min-w-0">
                                        <p className="font-medium break-words">
                                            {report.practice_session?.title ??
                                                'Feedback report'}
                                        </p>
                                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                                            {report.summary_feedback ||
                                                'Analysis is still processing.'}
                                        </p>
                                    </div>
                                    <span
                                        className={cn(
                                            'w-fit rounded-full border px-2.5 py-1 text-xs font-semibold',
                                            tone.badge,
                                        )}
                                    >
                                        {report.overall_score ?? '--'}
                                    </span>
                                </div>
                                <span className="mt-3 inline-flex items-center gap-2 text-sm text-cyan-700 dark:text-cyan-200">
                                    <Sparkles className="size-4" />
                                    {tone.label}
                                </span>
                            </Link>
                        );
                    })
                )}
            </div>
        </section>
    );
}
