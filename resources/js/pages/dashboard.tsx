import { Head, Link, usePage } from '@inertiajs/react';
import {
    Award,
    BarChart3,
    CalendarDays,
    CheckCircle2,
    Copy,
    FileText,
    Mic2,
    Sparkles,
    Trophy,
    UserPlus,
} from 'lucide-react';
import { useState } from 'react';

import { create } from '@/actions/App/Http/Controllers/PracticeSessionController';
import { index as reportsIndex } from '@/actions/App/Http/Controllers/SpeakingFeedbackReportController';
import AppLogoIcon from '@/components/app-logo-icon';
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
    const [hasCopiedReferralLink, setHasCopiedReferralLink] = useState(false);

    function copyReferralLink(): void {
        void navigator.clipboard
            .writeText(analytics.referrals.link)
            .then(() => {
                setHasCopiedReferralLink(true);
                window.setTimeout(() => setHasCopiedReferralLink(false), 2000);
            });
    }

    return (
        <>
            <Head title="Dashboard" />

            <div className="min-h-full bg-background px-4 py-5 text-foreground sm:px-6 sm:py-6 lg:px-8">
                <div className="mx-auto flex max-w-7xl min-w-0 flex-col gap-5 sm:gap-6">
                    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                        <div className="bg-linear-to-br from-cyan-500/10 via-violet-500/10 to-background p-5 sm:p-8">
                            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                                <div className="flex min-w-0 gap-4">
                                    <AppLogoIcon className="mt-1 hidden size-14 rounded-2xl sm:flex" />
                                    <div className="min-w-0">
                                        <p className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-700 dark:text-cyan-200">
                                            <Sparkles className="size-4 shrink-0" />
                                            AI coach dashboard
                                        </p>
                                        <h1 className="mt-3 text-2xl font-semibold tracking-normal break-words sm:text-4xl">
                                            Welcome back,{' '}
                                            {auth.user?.name ?? 'speaker'}
                                        </h1>
                                        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
                                            Track practice volume, score trends,
                                            and the coaching theme that deserves
                                            your next focused rep.
                                        </p>
                                    </div>
                                </div>

                                <Button
                                    asChild
                                    size="lg"
                                    className="w-full sm:w-auto"
                                >
                                    <Link href={create()}>
                                        <Mic2 className="size-4" />
                                        Start New Practice
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </section>

                    {!hasActivity && (
                        <section className="rounded-2xl border border-dashed border-border bg-card p-5 text-center shadow-sm sm:p-8">
                            <div className="mx-auto flex items-center justify-center gap-3">
                                <AppLogoIcon className="size-12 rounded-2xl" />
                                <FileText className="size-8 text-cyan-700 dark:text-cyan-200" />
                            </div>
                            <h2 className="mt-4 text-xl font-semibold">
                                Your analytics will appear here
                            </h2>
                            <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                                Create a practice session, upload a recording,
                                and AI feedback will turn into a clean progress
                                overview on this dashboard.
                            </p>
                            <Button asChild className="mt-5 w-full sm:w-auto">
                                <Link href={create()}>
                                    <Mic2 className="size-4" />
                                    Start New Practice
                                </Link>
                            </Button>
                        </section>
                    )}

                    <section className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
                            helper="Uploaded sessions that are recorded, processing, or analyzed."
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

                    <section className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
                        <ImprovementInsightCard
                            latestSessionTitle={
                                analytics.latestSession?.title ?? null
                            }
                            mostCommonWeakness={analytics.mostCommonWeakness}
                        />

                        <section className="min-w-0 rounded-2xl border border-border bg-card p-5 shadow-sm">
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
                                <Button
                                    asChild
                                    variant="outline"
                                    className="w-full sm:w-auto"
                                >
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

                    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                            <div className="min-w-0">
                                <p className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-700 dark:text-cyan-200">
                                    <UserPlus className="size-4 shrink-0" />
                                    Invite friends
                                </p>
                                <h2 className="mt-3 text-lg font-semibold">
                                    Share SpeakAI Coach
                                </h2>
                                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                                    Send your link to people who want clearer
                                    interviews, presentations, or everyday
                                    speaking practice.
                                </p>
                            </div>

                            <div className="rounded-2xl border border-border bg-background p-4 text-center lg:min-w-40">
                                <p className="text-2xl font-semibold">
                                    {analytics.referrals.registeredCount}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    joined from your link
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                            <div className="min-w-0 flex-1 rounded-xl border border-border bg-background px-4 py-3 font-mono text-sm text-muted-foreground">
                                <span className="block truncate">
                                    {analytics.referrals.link}
                                </span>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full sm:w-auto"
                                onClick={copyReferralLink}
                            >
                                {hasCopiedReferralLink ? (
                                    <CheckCircle2 className="size-4" />
                                ) : (
                                    <Copy className="size-4" />
                                )}
                                {hasCopiedReferralLink ? 'Copied' : 'Copy link'}
                            </Button>
                        </div>
                    </section>

                    <section className="grid min-w-0 gap-5 xl:grid-cols-2">
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
