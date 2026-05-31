import { Head, Link } from '@inertiajs/react';
import {
    Award,
    BarChart3,
    CalendarDays,
    CheckCircle2,
    Flame,
    LineChart,
    Mic2,
    Sparkles,
    Target,
    Trophy,
} from 'lucide-react';

import { create } from '@/actions/App/Http/Controllers/PracticeSessionController';
import { index as reportsIndex } from '@/actions/App/Http/Controllers/SpeakingFeedbackReportController';
import { Button } from '@/components/ui/button';
import { dashboard, progress } from '@/routes';

const skillTrends = [
    { label: 'Clarity', value: 82, change: '+12%' },
    { label: 'Structure', value: 76, change: '+8%' },
    { label: 'Confidence', value: 88, change: '+15%' },
    { label: 'Pace', value: 71, change: '+5%' },
];

const milestones = [
    {
        title: 'First analyzed session',
        description: 'Complete one recording and receive AI feedback.',
        complete: true,
    },
    {
        title: 'Three-session streak',
        description: 'Practice three times in one week.',
        complete: true,
    },
    {
        title: 'Score above 85',
        description: 'Reach an overall feedback score of 85 or higher.',
        complete: true,
    },
    {
        title: 'Ten-session habit',
        description: 'Build consistency with ten completed practice sessions.',
        complete: false,
    },
];

const weeklyPlan = [
    'Record one concise opening.',
    'Repeat your weakest transition.',
    'Run a full timed practice.',
    'Review the newest feedback report.',
];

export default function Progress() {
    return (
        <>
            <Head title="Progress" />

            <div className="min-h-full bg-background px-4 py-5 text-foreground sm:px-6 sm:py-6 lg:px-8">
                <div className="mx-auto flex max-w-7xl min-w-0 flex-col gap-5 sm:gap-6">
                    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                        <div className="bg-linear-to-br from-cyan-500/10 via-violet-500/10 to-background p-5 sm:p-8">
                            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                                <div className="min-w-0">
                                    <p className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-700 dark:text-cyan-200">
                                        <LineChart className="size-4 shrink-0" />
                                        Progress
                                    </p>
                                    <h1 className="mt-3 text-2xl font-semibold tracking-normal break-words sm:text-4xl">
                                        Track your speaking growth
                                    </h1>
                                    <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
                                        See practice consistency, skill trends,
                                        milestones, and the next actions that
                                        keep your progress moving.
                                    </p>
                                </div>

                                <Button asChild size="lg" className="w-full sm:w-auto">
                                    <Link href={create()}>
                                        <Mic2 className="size-4" />
                                        Practice today
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </section>

                    <section className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {[
                            {
                                label: 'Practice streak',
                                value: '3 days',
                                helper: 'Keep momentum with one short drill today.',
                                icon: Flame,
                            },
                            {
                                label: 'Sessions completed',
                                value: '8',
                                helper: 'Two more sessions to unlock the next habit milestone.',
                                icon: CalendarDays,
                            },
                            {
                                label: 'Best score',
                                value: '89',
                                helper: 'Your strongest overall AI feedback score.',
                                icon: Trophy,
                            },
                            {
                                label: 'Focus area',
                                value: 'Transitions',
                                helper: 'Practice linking ideas with fewer filler words.',
                                icon: Target,
                            },
                        ].map((stat) => (
                            <div
                                key={stat.label}
                                className="min-w-0 rounded-2xl border border-border bg-card p-5 shadow-sm"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <p className="text-sm text-muted-foreground">
                                            {stat.label}
                                        </p>
                                        <p className="mt-3 text-2xl font-semibold tracking-normal break-words sm:text-3xl">
                                            {stat.value}
                                        </p>
                                    </div>
                                    <div className="shrink-0 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-3 text-cyan-700 dark:text-cyan-200">
                                        <stat.icon className="size-5" />
                                    </div>
                                </div>
                                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                                    {stat.helper}
                                </p>
                            </div>
                        ))}
                    </section>

                    <section className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
                        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                                <div>
                                    <h2 className="text-lg font-semibold">
                                        Skill trend
                                    </h2>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Current coaching signals by category.
                                    </p>
                                </div>
                                <Button asChild variant="outline" className="w-full sm:w-auto">
                                    <Link href={reportsIndex()}>
                                        <BarChart3 className="size-4" />
                                        View reports
                                    </Link>
                                </Button>
                            </div>

                            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                {skillTrends.map((skill) => (
                                    <div
                                        key={skill.label}
                                        className="rounded-xl border border-border bg-background p-4"
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="font-medium">
                                                {skill.label}
                                            </p>
                                            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-200">
                                                {skill.change}
                                            </span>
                                        </div>
                                        <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                                            <div
                                                className="h-full rounded-full bg-linear-to-r from-cyan-400 to-violet-500"
                                                style={{ width: `${skill.value}%` }}
                                            />
                                        </div>
                                        <p className="mt-2 text-sm text-muted-foreground">
                                            {skill.value}% current score
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                            <div className="flex items-center gap-3">
                                <Award className="size-5 text-cyan-700 dark:text-cyan-200" />
                                <h2 className="text-lg font-semibold">
                                    Milestones
                                </h2>
                            </div>

                            <div className="mt-5 flex flex-col gap-3">
                                {milestones.map((milestone) => (
                                    <div
                                        key={milestone.title}
                                        className="rounded-xl border border-border bg-background p-4"
                                    >
                                        <div className="flex gap-3">
                                            <CheckCircle2
                                                className={`mt-0.5 size-5 shrink-0 ${
                                                    milestone.complete
                                                        ? 'text-emerald-600 dark:text-emerald-300'
                                                        : 'text-muted-foreground'
                                                }`}
                                            />
                                            <div className="min-w-0">
                                                <p className="font-medium break-words">
                                                    {milestone.title}
                                                </p>
                                                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                                    {milestone.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                            <div className="flex items-center gap-3">
                                <Sparkles className="size-5 text-cyan-700 dark:text-cyan-200" />
                                <h2 className="text-lg font-semibold">
                                    This week's plan
                                </h2>
                            </div>

                            <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                {weeklyPlan.map((item, index) => (
                                    <div
                                        key={item}
                                        className="rounded-xl border border-border bg-background p-4"
                                    >
                                        <span className="text-sm font-semibold text-cyan-700 dark:text-cyan-200">
                                            Day {index + 1}
                                        </span>
                                        <p className="mt-2 text-sm leading-6">
                                            {item}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                            <div className="flex items-center gap-3">
                                <Target className="size-5 text-cyan-700 dark:text-cyan-200" />
                                <h2 className="text-lg font-semibold">
                                    Next best action
                                </h2>
                            </div>
                            <p className="mt-4 text-sm leading-7 text-muted-foreground">
                                Your progress improves fastest when practice is
                                specific. Record one session focused only on
                                transitions, then compare the new report against
                                your current clarity and structure scores.
                            </p>
                            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                                <Button asChild className="w-full sm:w-auto">
                                    <Link href={create()}>
                                        <Mic2 className="size-4" />
                                        Record next session
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    variant="outline"
                                    className="w-full sm:w-auto"
                                >
                                    <Link href={dashboard()}>Back to dashboard</Link>
                                </Button>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}

Progress.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Progress',
            href: progress(),
        },
    ],
};
