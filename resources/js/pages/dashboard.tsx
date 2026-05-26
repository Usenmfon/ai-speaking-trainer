import { Head, Link, usePage } from '@inertiajs/react';
import {
    Award,
    BarChart3,
    BrainCircuit,
    CalendarDays,
    Flame,
    Gauge,
    MessageCircle,
    Mic2,
    Play,
    Sparkles,
    Target,
    Timer,
    TrendingUp,
    Trophy,
    Volume2,
} from 'lucide-react';
import { FeedbackCard } from '@/components/ai/feedback-card';
import { GlassCard } from '@/components/ai/glass-card';
import { GradientButton } from '@/components/ai/gradient-button';
import { ProgressChartMock } from '@/components/ai/progress-chart-mock';
import { SessionCard } from '@/components/ai/session-card';
import { StatCard } from '@/components/ai/stat-card';
import { WaveformMock } from '@/components/ai/waveform-mock';
import { dashboard, practice } from '@/routes';

const stats = [
    {
        label: 'Confidence',
        value: '88%',
        trend: '+12% from last week',
        icon: TrendingUp,
    },
    {
        label: 'Speaking speed',
        value: '137',
        trend: 'Ideal range',
        icon: Gauge,
    },
    {
        label: 'Filler words',
        value: '6',
        trend: '-41% in 14 days',
        icon: MessageCircle,
    },
    {
        label: 'Pronunciation',
        value: '93%',
        trend: 'Excellent clarity',
        icon: Volume2,
    },
];

const sessions = [
    {
        title: 'Investor pitch rehearsal',
        date: 'Today, 8:42 AM',
        score: '91%',
        duration: '12m',
    },
    {
        title: 'Behavioral interview prep',
        date: 'Yesterday, 6:12 PM',
        score: '86%',
        duration: '18m',
    },
    {
        title: 'Product demo walkthrough',
        date: 'Monday, 10:05 AM',
        score: '89%',
        duration: '15m',
    },
];

const dashboardHighlights = [
    { label: 'Practice streak', value: '8 days', icon: Flame },
    { label: 'Sessions', value: '34 total', icon: CalendarDays },
    { label: 'Next milestone', value: 'Fluency Pro', icon: Trophy },
];

export default function Dashboard() {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Dashboard" />
            <div className="min-h-full bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
                <div className="mx-auto flex max-w-7xl flex-col gap-6">
                    <section className="grid gap-5 lg:grid-cols-[1.4fr_0.6fr]">
                        <GlassCard className="p-6 sm:p-8" glow>
                            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                                <div>
                                    <p className="flex items-center gap-2 text-sm font-semibold text-cyan-700 dark:text-cyan-200">
                                        <Sparkles className="size-4" />
                                        AI coach dashboard
                                    </p>
                                    <h1 className="mt-3 text-3xl font-semibold tracking-normal sm:text-4xl">
                                        Welcome back, {auth.user?.name ?? 'speaker'}
                                    </h1>
                                    <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground dark:text-slate-300">
                                        Your next best rep is a two-minute
                                        opener drill. Focus on pausing after key
                                        claims and keeping pace under 145 words
                                        per minute.
                                    </p>
                                </div>
                                <GradientButton href={practice()} className="shrink-0">
                                    <Mic2 className="size-4" />
                                    Quick record
                                </GradientButton>
                            </div>
                            <div className="mt-8 grid gap-4 md:grid-cols-3">
                                {dashboardHighlights.map(
                                    ({ label, value, icon: Icon }) => (
                                    <div
                                        key={label}
                                        className="rounded-2xl border border-border bg-muted/40 p-4 dark:border-white/10 dark:bg-white/[0.04]"
                                    >
                                        <Icon className="size-5 text-cyan-700 dark:text-cyan-200" />
                                        <p className="mt-3 text-sm text-muted-foreground dark:text-slate-400">
                                            {label}
                                        </p>
                                        <p className="mt-1 text-xl font-semibold">
                                            {value}
                                        </p>
                                    </div>
                                    ),
                                )}
                            </div>
                        </GlassCard>

                        <GlassCard className="p-6" glow>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground dark:text-slate-400">
                                        Daily streak
                                    </p>
                                    <p className="mt-2 text-4xl font-semibold">
                                        8
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3 text-amber-700 dark:border-amber-300/20 dark:bg-amber-300/10 dark:text-amber-200">
                                    <Flame className="size-6" />
                                </div>
                            </div>
                            <div className="mt-6 grid grid-cols-7 gap-2">
                                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(
                                    (day, index) => (
                                        <div
                                            key={`${day}-${index}`}
                                            className={`flex aspect-square items-center justify-center rounded-xl text-xs font-semibold ${
                                                index < 5
                                                    ? 'bg-cyan-300 text-slate-950'
                                                    : 'bg-muted text-muted-foreground dark:bg-white/8 dark:text-slate-400'
                                            }`}
                                        >
                                            {day}
                                        </div>
                                    ),
                                )}
                            </div>
                            <p className="mt-5 text-sm leading-6 text-muted-foreground dark:text-slate-300">
                                Complete one practice today to unlock the
                                Consistent Speaker badge.
                            </p>
                        </GlassCard>
                    </section>

                    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {stats.map((stat) => (
                            <StatCard key={stat.label} {...stat} />
                        ))}
                    </section>

                    <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
                        <GlassCard className="p-6" glow>
                            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                                <div>
                                    <h2 className="text-xl font-semibold">
                                        Speech analytics summary
                                    </h2>
                                    <p className="mt-1 text-sm text-muted-foreground dark:text-slate-400">
                                        Confidence, fluency, and tone over your
                                        last ten practice sessions.
                                    </p>
                                </div>
                                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-700 dark:border-emerald-300/20 dark:bg-emerald-300/10 dark:text-emerald-200">
                                    +18% improvement
                                </span>
                            </div>
                            <ProgressChartMock className="mt-8" />
                        </GlassCard>

                        <GlassCard className="p-6" glow>
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold">
                                    Live readiness
                                </h2>
                                <BarChart3 className="size-5 text-cyan-700 dark:text-cyan-200" />
                            </div>
                            <WaveformMock className="mt-5 h-32" bars={28} />
                            <div className="mt-5 grid grid-cols-3 gap-3">
                                {[
                                    ['Tone', 'Warm'],
                                    ['Pace', 'Good'],
                                    ['Energy', 'High'],
                                ].map(([label, value]) => (
                                    <div
                                        key={label}
                                        className="rounded-2xl border border-border bg-muted/40 p-3 text-center dark:border-white/10 dark:bg-white/[0.04]"
                                    >
                                        <p className="text-xs text-muted-foreground dark:text-slate-400">
                                            {label}
                                        </p>
                                        <p className="mt-1 text-sm font-semibold">
                                            {value}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </GlassCard>
                    </section>

                    <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr_0.8fr]">
                        <GlassCard className="p-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold">
                                    Recent sessions
                                </h2>
                                <Link
                                    href="#"
                                    className="text-sm text-cyan-700 hover:text-cyan-600 dark:text-cyan-200 dark:hover:text-cyan-100"
                                >
                                    View all
                                </Link>
                            </div>
                            <div className="mt-5 flex flex-col gap-3">
                                {sessions.map((session) => (
                                    <SessionCard
                                        key={session.title}
                                        {...session}
                                    />
                                ))}
                            </div>
                        </GlassCard>

                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
                            <FeedbackCard
                                icon={Target}
                                title="Top coaching focus"
                                body="Pause for one beat after your strongest claims. Your arguments land better when the listener can catch up."
                                tone="info"
                            />
                            <FeedbackCard
                                icon={Timer}
                                title="Pacing insight"
                                body="Your average pace is in range, but the middle third of your talks spikes above 158 wpm."
                                tone="warning"
                            />
                            <FeedbackCard
                                icon={Award}
                                title="Achievement unlocked"
                                body="You completed three sessions above 85% confidence this week."
                                tone="success"
                            />
                        </div>

                        <GlassCard className="p-6" glow>
                            <div className="mb-5 flex items-center gap-3">
                                <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 p-3 text-violet-700 dark:border-violet-300/20 dark:bg-violet-300/10 dark:text-violet-200">
                                    <BrainCircuit className="size-5" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold">
                                        AI coach
                                    </h2>
                                    <p className="text-sm text-muted-foreground dark:text-slate-400">
                                        Ready with your next drill
                                    </p>
                                </div>
                            </div>
                            <p className="text-sm leading-6 text-muted-foreground dark:text-slate-300">
                                Try a 90-second answer to: "Tell me about a
                                time you handled ambiguity." I will score
                                structure, specificity, and confidence.
                            </p>
                            <GradientButton
                                href={practice()}
                                className="mt-6 w-full"
                                variant="secondary"
                            >
                                <Play className="size-4" />
                                Start drill
                            </GradientButton>
                        </GlassCard>
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
