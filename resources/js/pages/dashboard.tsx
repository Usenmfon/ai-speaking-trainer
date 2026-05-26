import { Head, Link, usePage } from '@inertiajs/react';
import {
    Award,
    BarChart3,
    CalendarDays,
    CheckCircle2,
    FileText,
    Mic2,
    Sparkles,
    Trophy,
} from 'lucide-react';

import { create } from '@/actions/App/Http/Controllers/PracticeSessionController';
import { index as reportsIndex } from '@/actions/App/Http/Controllers/SpeakingFeedbackReportController';
import { ImprovementInsightCard } from '@/components/dashboard/improvement-insight-card';
import { RecentReportList } from '@/components/dashboard/recent-report-list';
import { RecentSessionList } from '@/components/dashboard/recent-session-list';
import { StatCard } from '@/components/dashboard/stat-card';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes';
import type { DashboardAnalytics } from '@/types';

type DashboardProps = {
    analytics: DashboardAnalytics;
};

function formatScore(value: number | null): string {
    return value === null ? '--' : `${value}`;
}

export default function Dashboard({ analytics }: DashboardProps) {
    const { auth } = usePage().props;
    const hasActivity = analytics.stats.totalPracticeSessions > 0;

    return (
        <>
            <Head title="Dashboard" />

            <div className="min-h-full bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
                <div className="mx-auto flex max-w-7xl flex-col gap-6">
                    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                        <div className="bg-linear-to-br from-cyan-500/10 via-violet-500/10 to-background p-5 sm:p-8">
                            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                                <div>
                                    <p className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-700 dark:text-cyan-200">
                                        <Sparkles className="size-4" />
                                        AI coach dashboard
                                    </p>
                                    <h1 className="mt-3 text-3xl font-semibold tracking-normal sm:text-4xl">
                                        Welcome back,{' '}
                                        {auth.user?.name ?? 'speaker'}
                                    </h1>
                                    <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
                                        Track practice volume, score trends, and
                                        the coaching theme that deserves your
                                        next focused rep.
                                    </p>
                                </div>

                                <Button asChild size="lg">
                                    <Link href={create()}>
                                        <Mic2 className="size-4" />
                                        Start New Practice
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </section>

                    {!hasActivity && (
                        <section className="rounded-2xl border border-dashed border-border bg-card p-8 text-center shadow-sm">
                            <FileText className="mx-auto size-10 text-cyan-700 dark:text-cyan-200" />
                            <h2 className="mt-4 text-xl font-semibold">
                                Your analytics will appear here
                            </h2>
                            <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                                Create a practice session, upload a recording,
                                and AI feedback will turn into a clean progress
                                overview on this dashboard.
                            </p>
                            <Button asChild className="mt-5">
                                <Link href={create()}>
                                    <Mic2 className="size-4" />
                                    Start New Practice
                                </Link>
                            </Button>
                        </section>
                    )}

                    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <StatCard
                            icon={CalendarDays}
                            label="Total practice sessions"
                            value={`${analytics.stats.totalPracticeSessions}`}
                            helper="Every session you create, including drafts and recordings."
                        />
                        <StatCard
                            icon={CheckCircle2}
                            label="Completed sessions"
                            value={`${analytics.stats.completedSessions}`}
                            helper="Recorded or analyzed sessions ready for review."
                        />
                        <StatCard
                            icon={BarChart3}
                            label="Average overall score"
                            value={formatScore(
                                analytics.stats.averageOverallScore,
                            )}
                            helper="Average score across completed feedback reports."
                        />
                        <StatCard
                            icon={Trophy}
                            label="Best score"
                            value={formatScore(analytics.stats.bestScore)}
                            helper="Your highest overall AI feedback score so far."
                        />
                    </section>

                    <section className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
                        <ImprovementInsightCard
                            latestSessionTitle={
                                analytics.latestSession?.title ?? null
                            }
                            mostCommonWeakness={
                                analytics.mostCommonWeakness
                            }
                        />

                        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                                <div>
                                    <h2 className="text-lg font-semibold">
                                        Progress overview
                                    </h2>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Your latest session and recent report
                                        activity at a glance.
                                    </p>
                                </div>
                                <Button asChild variant="outline">
                                    <Link href={reportsIndex()}>
                                        <Award className="size-4" />
                                        View reports
                                    </Link>
                                </Button>
                            </div>

                            <div className="mt-5 grid gap-4 md:grid-cols-3">
                                <div className="rounded-2xl border border-border bg-background p-4">
                                    <p className="text-sm text-muted-foreground">
                                        Latest session
                                    </p>
                                    <p className="mt-2 line-clamp-2 font-semibold">
                                        {analytics.latestSession?.title ??
                                            'No session yet'}
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-border bg-background p-4">
                                    <p className="text-sm text-muted-foreground">
                                        Common weakness
                                    </p>
                                    <p className="mt-2 line-clamp-2 font-semibold">
                                        {analytics.mostCommonWeakness ??
                                            'Not enough reports'}
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-border bg-background p-4">
                                    <p className="text-sm text-muted-foreground">
                                        Recent reports
                                    </p>
                                    <p className="mt-2 text-2xl font-semibold">
                                        {analytics.recentReports.length}
                                    </p>
                                </div>
                            </div>
                        </section>
                    </section>

                    <section className="grid gap-5 xl:grid-cols-2">
                        <RecentSessionList
                            sessions={analytics.recentSessions}
                        />
                        <RecentReportList reports={analytics.recentReports} />
                    </section>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
