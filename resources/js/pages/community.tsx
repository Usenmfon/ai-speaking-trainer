import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    CalendarDays,
    CheckCircle2,
    Flame,
    MessageCircle,
    Mic2,
    Sparkles,
    Trophy,
    Users,
} from 'lucide-react';

import { create } from '@/actions/App/Http/Controllers/PracticeSessionController';
import { Button } from '@/components/ui/button';
import { community, dashboard, progress } from '@/routes';

const discussionThreads = [
    {
        title: 'How do you stop rushing during presentations?',
        category: 'Delivery',
        replies: 18,
        latest: '12 min ago',
    },
    {
        title: 'Share a one-minute intro and get structure feedback',
        category: 'Practice exchange',
        replies: 31,
        latest: '46 min ago',
    },
    {
        title: 'Best warm-up routines before a high-stakes call',
        category: 'Preparation',
        replies: 12,
        latest: '2 hr ago',
    },
];

const practiceCircles = [
    {
        title: 'Interview readiness',
        members: '214 members',
        focus: 'Answer structure, confidence, and concise examples.',
    },
    {
        title: 'Product storytelling',
        members: '148 members',
        focus: 'Clear launches, demos, and stakeholder updates.',
    },
    {
        title: 'English fluency reps',
        members: '326 members',
        focus: 'Daily speaking prompts and supportive peer feedback.',
    },
];

const upcomingSessions = [
    {
        title: 'Live prompt sprint',
        time: 'Today, 6:00 PM',
        seats: '8 spots open',
    },
    {
        title: 'Peer feedback room',
        time: 'Tomorrow, 7:30 PM',
        seats: '12 spots open',
    },
    {
        title: 'Confidence clinic',
        time: 'Friday, 5:00 PM',
        seats: '5 spots open',
    },
];

const communityStats = [
    {
        label: 'Active speakers',
        value: '688',
        helper: 'Members practicing this week',
        icon: Users,
    },
    {
        label: 'Practice streaks',
        value: '142',
        helper: 'Streaks kept alive today',
        icon: Flame,
    },
    {
        label: 'Feedback shared',
        value: '1.9k',
        helper: 'Peer comments this month',
        icon: MessageCircle,
    },
];

export default function Community() {
    return (
        <>
            <Head title="Community" />

            <div className="min-h-full bg-background px-4 py-5 text-foreground sm:px-6 sm:py-6 lg:px-8">
                <div className="mx-auto flex max-w-7xl min-w-0 flex-col gap-5 sm:gap-6">
                    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                        <div className="bg-linear-to-br from-cyan-500/10 via-emerald-500/10 to-background p-5 sm:p-8">
                            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                                <div className="min-w-0">
                                    <p className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-700 dark:text-cyan-200">
                                        <Users className="size-4 shrink-0" />
                                        Community
                                    </p>
                                    <h1 className="mt-3 text-2xl font-semibold tracking-normal break-words sm:text-4xl">
                                        Practice with people improving the same
                                        skills
                                    </h1>
                                    <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
                                        Join focused circles, follow discussion
                                        threads, and use peer accountability to
                                        keep speaking practice consistent.
                                    </p>
                                </div>

                                <Button asChild size="lg" className="w-full sm:w-auto">
                                    <Link href={create()}>
                                        <Mic2 className="size-4" />
                                        Record a session
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </section>

                    <section className="grid min-w-0 gap-4 sm:grid-cols-3">
                        {communityStats.map((stat) => (
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
                                        Discussion board
                                    </h2>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Recent conversations from active
                                        learners.
                                    </p>
                                </div>
                                <Button asChild variant="outline" className="w-full sm:w-auto">
                                    <Link href={progress()}>
                                        <Trophy className="size-4" />
                                        View progress
                                    </Link>
                                </Button>
                            </div>

                            <div className="mt-5 flex flex-col gap-3">
                                {discussionThreads.map((thread) => (
                                    <div
                                        key={thread.title}
                                        className="rounded-xl border border-border bg-background p-4"
                                    >
                                        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                                            <div className="min-w-0">
                                                <span className="rounded-full border border-cyan-500/25 bg-cyan-500/10 px-2.5 py-1 text-xs font-semibold text-cyan-700 dark:text-cyan-200">
                                                    {thread.category}
                                                </span>
                                                <p className="mt-3 font-medium break-words">
                                                    {thread.title}
                                                </p>
                                            </div>
                                            <div className="flex shrink-0 items-center gap-3 text-sm text-muted-foreground">
                                                <span>{thread.replies} replies</span>
                                                <span>{thread.latest}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                            <div className="flex items-center gap-3">
                                <CalendarDays className="size-5 text-cyan-700 dark:text-cyan-200" />
                                <h2 className="text-lg font-semibold">
                                    Upcoming rooms
                                </h2>
                            </div>

                            <div className="mt-5 flex flex-col gap-3">
                                {upcomingSessions.map((session) => (
                                    <div
                                        key={session.title}
                                        className="rounded-xl border border-border bg-background p-4"
                                    >
                                        <p className="font-medium break-words">
                                            {session.title}
                                        </p>
                                        <div className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                                            <span>{session.time}</span>
                                            <span>{session.seats}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                            <div className="flex items-center gap-3">
                                <Sparkles className="size-5 text-cyan-700 dark:text-cyan-200" />
                                <h2 className="text-lg font-semibold">
                                    Practice circles
                                </h2>
                            </div>

                            <div className="mt-5 grid gap-3 md:grid-cols-3">
                                {practiceCircles.map((circle) => (
                                    <div
                                        key={circle.title}
                                        className="rounded-xl border border-border bg-background p-4"
                                    >
                                        <p className="font-medium break-words">
                                            {circle.title}
                                        </p>
                                        <p className="mt-2 text-sm font-semibold text-cyan-700 dark:text-cyan-200">
                                            {circle.members}
                                        </p>
                                        <p className="mt-3 text-sm leading-6 text-muted-foreground">
                                            {circle.focus}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="size-5 text-cyan-700 dark:text-cyan-200" />
                                <h2 className="text-lg font-semibold">
                                    Community challenge
                                </h2>
                            </div>
                            <p className="mt-4 text-sm leading-7 text-muted-foreground">
                                Complete three short recordings this week and
                                share one takeaway with a practice circle.
                            </p>
                            <div className="mt-5 rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4 text-sm text-emerald-800 dark:text-emerald-100">
                                <div className="flex gap-3">
                                    <Trophy className="mt-0.5 size-4 shrink-0" />
                                    <p>
                                        Current challenge progress: 1 of 3
                                        recordings completed.
                                    </p>
                                </div>
                            </div>
                            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                                <Button asChild className="w-full sm:w-auto">
                                    <Link href={create()}>
                                        Start next rep
                                        <ArrowRight className="size-4" />
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

Community.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Community',
            href: community(),
        },
    ],
};
