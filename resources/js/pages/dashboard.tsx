import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Award,
    BarChart3,
    CalendarDays,
    CheckCircle2,
    Copy,
    FileText,
    ListChecks,
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

function scoreStatus(value: number | null): {
    status: string;
    tone: 'default' | 'success' | 'warning';
} {
    if (value === null) {
        return {
            status: 'Waiting for reports',
            tone: 'warning',
        };
    }

    if (value >= 80) {
        return {
            status: 'Strong',
            tone: 'success',
        };
    }

    if (value >= 60) {
        return {
            status: 'Building',
            tone: 'default',
        };
    }

    return {
        status: 'Needs focus',
        tone: 'warning',
    };
}

export default function Dashboard({ analytics }: DashboardProps) {
    const { auth } = usePage().props;
    const hasActivity = analytics.stats.totalPracticeSessions > 0;
    const [hasCopiedReferralLink, setHasCopiedReferralLink] = useState(false);
    const completionRate =
        analytics.stats.totalPracticeSessions > 0
            ? Math.round(
                  (analytics.stats.completedSessions /
                      analytics.stats.totalPracticeSessions) *
                      100,
              )
            : 0;
    const averageScoreStatus = scoreStatus(analytics.stats.averageOverallScore);
    const bestScoreStatus = scoreStatus(analytics.stats.bestScore);
    const recommendedTitle = analytics.mostCommonWeakness
        ? `Practice ${analytics.mostCommonWeakness}`
        : hasActivity
          ? 'Record another focused take'
          : 'Create your first practice session';
    const recommendedDescription = analytics.mostCommonWeakness
        ? 'Use your most common feedback theme as the focus for the next short drill.'
        : hasActivity
          ? 'Keep the momentum going with one short recording while your last session is still fresh.'
          : 'Start with a two or three minute session so your first feedback report has useful context.';

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
                            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-stretch">
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

                                <div className="rounded-2xl border border-border bg-background/80 p-4 lg:w-80">
                                    <p className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-700 uppercase dark:text-cyan-200">
                                        <ListChecks className="size-4" />
                                        Recommended next
                                    </p>
                                    <h2 className="mt-3 text-base font-semibold">
                                        {recommendedTitle}
                                    </h2>
                                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                        {recommendedDescription}
                                    </p>
                                    <Button asChild className="mt-4 w-full">
                                        <Link href={create()}>
                                            <Mic2 className="size-4" />
                                            Start practice
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {!hasActivity && (
                        <section className="rounded-2xl border border-dashed border-border bg-card p-5 shadow-sm sm:p-8">
                            <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <AppLogoIcon className="size-12 rounded-2xl" />
                                        <FileText className="size-8 text-cyan-700 dark:text-cyan-200" />
                                    </div>
                                    <h2 className="mt-4 text-xl font-semibold">
                                        Your analytics will appear here
                                    </h2>
                                    <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                                        Create a practice session, upload a
                                        recording, and AI feedback will turn
                                        into a clean progress overview on this
                                        dashboard.
                                    </p>
                                    <Button
                                        asChild
                                        className="mt-5 w-full sm:w-auto"
                                    >
                                        <Link href={create()}>
                                            <Mic2 className="size-4" />
                                            Start New Practice
                                        </Link>
                                    </Button>
                                </div>
                                <div className="grid gap-3">
                                    {[
                                        'Choose a topic and target duration',
                                        'Record or re-record until it feels ready',
                                        'Review feedback and pick one thing to improve',
                                    ].map((step, index) => (
                                        <div
                                            key={step}
                                            className="flex items-center gap-3 rounded-xl border border-border bg-background p-3"
                                        >
                                            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 text-sm font-semibold text-cyan-700 dark:text-cyan-200">
                                                {index + 1}
                                            </span>
                                            <span className="text-sm font-medium">
                                                {step}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}

                    <section className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <StatCard
                            icon={CalendarDays}
                            label="Total practice sessions"
                            value={`${analytics.stats.totalPracticeSessions}`}
                            helper="Every session you create, including drafts and recordings."
                            status={
                                hasActivity
                                    ? 'History started'
                                    : 'No sessions yet'
                            }
                            tone={hasActivity ? 'success' : 'warning'}
                        />
                        <StatCard
                            icon={CheckCircle2}
                            label="Completed sessions"
                            value={`${analytics.stats.completedSessions}`}
                            helper="Uploaded sessions that are recorded, processing, or analyzed."
                            status={`${completionRate}% completion`}
                            tone={completionRate > 0 ? 'success' : 'warning'}
                        />
                        <StatCard
                            icon={BarChart3}
                            label="Average overall score"
                            value={formatScore(
                                analytics.stats.averageOverallScore,
                            )}
                            helper="Average score across completed feedback reports."
                            status={averageScoreStatus.status}
                            tone={averageScoreStatus.tone}
                        />
                        <StatCard
                            icon={Trophy}
                            label="Best score"
                            value={formatScore(analytics.stats.bestScore)}
                            helper="Your highest overall AI feedback score so far."
                            status={bestScoreStatus.status}
                            tone={bestScoreStatus.tone}
                        />
                    </section>

                    <section className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
                        <div className="order-2 xl:order-1">
                            <ImprovementInsightCard
                                latestSessionTitle={
                                    analytics.latestSession?.title ?? null
                                }
                                mostCommonWeakness={
                                    analytics.mostCommonWeakness
                                }
                            />
                        </div>

                        <section className="order-1 min-w-0 rounded-2xl border border-border bg-card p-5 shadow-sm xl:order-2">
                            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                                <div>
                                    <h2 className="text-lg font-semibold">
                                        Progress snapshot
                                    </h2>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        A quick read on where your practice loop
                                        stands.
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

                            <div className="mt-5 rounded-2xl border border-border bg-background p-4">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <p className="text-sm font-medium">
                                            Sessions with usable feedback
                                        </p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Recorded or analyzed sessions out of
                                            everything created.
                                        </p>
                                    </div>
                                    <span className="text-2xl font-semibold">
                                        {completionRate}%
                                    </span>
                                </div>
                                <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                                    <div
                                        className="h-full rounded-full bg-linear-to-r from-cyan-400 to-emerald-500"
                                        style={{ width: `${completionRate}%` }}
                                    />
                                </div>
                            </div>

                            <div className="mt-4 grid gap-4 md:grid-cols-3">
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

                            <Button
                                asChild
                                className="mt-4 w-full"
                                variant="ghost"
                            >
                                <Link href={create()}>
                                    Start the next rep
                                    <ArrowRight className="size-4" />
                                </Link>
                            </Button>
                        </section>
                    </section>

                    <section className="grid min-w-0 gap-5 xl:grid-cols-2">
                        <RecentSessionList
                            sessions={analytics.recentSessions}
                        />
                        <RecentReportList reports={analytics.recentReports} />
                    </section>

                    <section className="order-last rounded-2xl border border-border bg-card p-5 shadow-sm">
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
