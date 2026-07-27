import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    AudioLines,
    BadgeCheck,
    BarChart3,
    BriefcaseBusiness,
    Check,
    ChevronRight,
    CircleDot,
    GraduationCap,
    MessagesSquare,
    Mic2,
    Monitor,
    Moon,
    Play,
    Presentation,
    Quote,
    Rocket,
    ShieldCheck,
    Sparkles,
    Sun,
    TimerReset,
    UsersRound,
    Volume2,
    Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import AppLogoIcon from '@/components/app-logo-icon';
import { useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';
import { dashboard, login, register } from '@/routes';

const outcomes = [
    'Interview answers that land cleanly',
    'Presentation structure without rambling',
    'Confidence, pace, and filler-word tracking',
];

const metrics = [
    {
        label: 'Pace',
        value: '142',
        suffix: 'wpm',
        tone: 'text-emerald-600 dark:text-emerald-300',
    },
    {
        label: 'Confidence',
        value: '91',
        suffix: '%',
        tone: 'text-cyan-700 dark:text-cyan-300',
    },
    {
        label: 'Fillers',
        value: '3',
        suffix: 'words',
        tone: 'text-amber-600 dark:text-amber-300',
    },
];

const practiceModes: Array<{
    title: string;
    description: string;
    icon: LucideIcon;
}> = [
    {
        title: 'Interview room',
        description:
            'Practice role-specific answers with crisp follow-through.',
        icon: BriefcaseBusiness,
    },
    {
        title: 'Presentation table',
        description:
            'Turn scattered talking points into a clean narrative arc.',
        icon: Presentation,
    },
    {
        title: 'Pitch sprint',
        description: 'Sharpen your opening, proof, and ask under pressure.',
        icon: Rocket,
    },
    {
        title: 'Panel answer',
        description: 'Handle fast questions without losing your thread.',
        icon: UsersRound,
    },
    {
        title: 'Story practice',
        description: 'Build momentum, contrast, and a memorable close.',
        icon: MessagesSquare,
    },
    {
        title: 'Pronunciation pass',
        description:
            'Slow down tough sounds and make delivery easier to follow.',
        icon: GraduationCap,
    },
];

const feedbackSteps = [
    {
        title: 'Record one focused take',
        description:
            'Choose a goal and speak naturally. No studio setup, no awkward ceremony.',
        icon: Mic2,
    },
    {
        title: 'Get scored feedback',
        description:
            'See clarity, structure, confidence, pace, and filler-word signals in one place.',
        icon: BarChart3,
    },
    {
        title: 'Practice the next move',
        description:
            'Leave with one concrete recommendation instead of a vague pep talk.',
        icon: TimerReset,
    },
];

function MiniWaveform({ compact = false }: { compact?: boolean }) {
    return (
        <div
            className={cn('flex items-center gap-1', compact ? 'h-9' : 'h-24')}
            aria-hidden="true"
        >
            {Array.from({ length: compact ? 18 : 36 }).map((_, index) => (
                <span
                    key={index}
                    className="w-1 flex-1 rounded-full bg-current opacity-80"
                    style={{
                        height: `${18 + ((index * 23) % (compact ? 54 : 78))}%`,
                    }}
                />
            ))}
        </div>
    );
}

function VoiceLabScene() {
    return (
        <div className="relative min-h-[520px] overflow-hidden rounded-lg border border-slate-950/10 bg-[#101820] shadow-2xl shadow-slate-950/20 dark:border-white/10 dark:bg-[#08110f]">
            <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(20,184,166,0.18),transparent_34%),linear-gradient(252deg,rgba(245,158,11,0.22),transparent_30%)]" />
            <div className="absolute inset-x-0 top-0 h-28 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.18),transparent)]" />
            <div className="absolute top-8 right-8 left-8 flex items-center justify-between text-white/70">
                <div className="flex items-center gap-2 text-xs font-medium uppercase">
                    <CircleDot className="size-4 text-rose-300" />
                    Live rehearsal
                </div>
                <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs backdrop-blur">
                    <Volume2 className="size-3.5" />
                    Voice ready
                </div>
            </div>

            <div className="absolute top-24 right-8 left-8 rounded-lg border border-white/10 bg-white/[0.08] p-5 text-white shadow-xl backdrop-blur-md">
                <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-teal-300 text-slate-950">
                        <Sparkles className="size-5" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-white/55">
                            Coach prompt
                        </p>
                        <p className="mt-2 text-lg leading-7 font-semibold">
                            Walk me through a time you handled a difficult
                            stakeholder.
                        </p>
                    </div>
                </div>
            </div>

            <div className="absolute right-8 bottom-[10.5rem] left-8 text-teal-200">
                <MiniWaveform />
            </div>

            <div className="absolute right-8 bottom-8 left-8 grid gap-3 sm:grid-cols-3">
                {metrics.map((metric) => (
                    <div
                        key={metric.label}
                        className="rounded-lg border border-white/10 bg-white/[0.09] p-4 text-white backdrop-blur-md"
                    >
                        <p className="text-xs text-white/55">{metric.label}</p>
                        <div className="mt-2 flex items-end gap-1">
                            <span
                                className={cn(
                                    'text-3xl font-semibold',
                                    metric.tone,
                                )}
                            >
                                {metric.value}
                            </span>
                            <span className="pb-1 text-xs text-white/55">
                                {metric.suffix}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="absolute bottom-[7.75rem] left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white backdrop-blur-md">
                <span className="flex size-8 items-center justify-center rounded-full bg-white text-slate-950">
                    <Play className="ml-0.5 size-4 fill-current" />
                </span>
                <span>Answer captured</span>
            </div>
        </div>
    );
}

export default function Welcome() {
    const { auth } = usePage().props;
    const { appearance, resolvedAppearance, updateAppearance } =
        useAppearance();

    const nextAppearance = resolvedAppearance === 'dark' ? 'light' : 'dark';
    const ThemeIcon =
        appearance === 'system'
            ? Monitor
            : resolvedAppearance === 'dark'
              ? Moon
              : Sun;
    const primaryHref = auth.user ? dashboard() : register();

    return (
        <>
            <Head title="AI Speaking Practice Coach" />
            <main className="min-h-screen bg-[#f4f7f5] text-slate-950 dark:bg-[#07100e] dark:text-white">
                <section className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,23,42,0.08)_1px,transparent_1px),linear-gradient(rgba(15,23,42,0.08)_1px,transparent_1px)] bg-[size:56px_56px] opacity-45 dark:bg-[linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)]" />
                    <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <header className="flex items-center justify-between gap-4 py-5">
                            <Link
                                href="/"
                                className="flex min-w-0 items-center gap-3"
                            >
                                <AppLogoIcon className="size-10 rounded-lg" />
                                <span className="truncate text-sm font-semibold tracking-normal">
                                    TWAC
                                </span>
                            </Link>

                            <div className="flex items-center gap-2 sm:gap-3">
                                <button
                                    type="button"
                                    onClick={() =>
                                        updateAppearance(nextAppearance)
                                    }
                                    className="inline-flex size-10 items-center justify-center rounded-lg border border-slate-950/10 bg-white/70 text-slate-700 transition hover:border-teal-500/50 hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:outline-none dark:border-white/10 dark:bg-white/8 dark:text-slate-200 dark:hover:border-teal-300/50 dark:hover:text-white"
                                    aria-label={`Switch to ${nextAppearance} theme`}
                                    title={`Switch to ${nextAppearance} theme`}
                                >
                                    <ThemeIcon className="size-4" />
                                </button>

                                {auth.user ? (
                                    <Link
                                        href={dashboard()}
                                        className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-teal-700 focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:outline-none dark:bg-white dark:text-slate-950 dark:hover:bg-teal-100"
                                    >
                                        Dashboard
                                        <ArrowRight className="size-4" />
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={login()}
                                            className="hidden h-10 items-center rounded-lg px-4 text-sm font-medium text-slate-700 transition hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:outline-none sm:inline-flex dark:text-slate-300 dark:hover:text-white"
                                        >
                                            Log in
                                        </Link>
                                        <Link
                                            href={register()}
                                            className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-teal-700 focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:outline-none dark:bg-white dark:text-slate-950 dark:hover:bg-teal-100"
                                        >
                                            Start
                                            <ChevronRight className="size-4" />
                                        </Link>
                                    </>
                                )}
                            </div>
                        </header>

                        <div className="grid min-h-[calc(100vh-80px)] items-center gap-10 py-10 lg:grid-cols-[minmax(0,0.88fr)_minmax(480px,0.9fr)] lg:py-14">
                            <div className="max-w-3xl">
                                <div className="inline-flex items-center gap-2 rounded-lg border border-teal-600/20 bg-white/60 px-3 py-2 text-sm font-medium text-teal-800 shadow-sm dark:border-teal-300/20 dark:bg-white/8 dark:text-teal-100">
                                    <AudioLines className="size-4" />
                                    AI feedback for real speaking reps
                                </div>

                                <h1 className="mt-6 text-5xl leading-[0.95] font-semibold tracking-normal text-slate-950 sm:text-6xl lg:text-7xl dark:text-white">
                                    AI speaking practice coach
                                </h1>

                                <p className="mt-6 max-w-2xl text-base leading-7 text-slate-700 sm:text-lg dark:text-slate-300">
                                    Rehearse interviews, presentations, pitches,
                                    and tough Q&A in a private voice-first
                                    workspace. Record a take, get precise
                                    feedback, and know exactly what to improve
                                    next.
                                </p>

                                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                    <Link
                                        href={primaryHref}
                                        className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-teal-600 px-6 text-sm font-semibold text-white shadow-lg shadow-teal-600/20 transition hover:bg-teal-700 focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:outline-none"
                                    >
                                        {auth.user
                                            ? 'Open dashboard'
                                            : 'Start practicing'}
                                        <ArrowRight className="size-4" />
                                    </Link>
                                    {!auth.user && (
                                        <Link
                                            href={login()}
                                            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-slate-950/10 bg-white/70 px-6 text-sm font-semibold text-slate-900 transition hover:border-slate-950/25 focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:outline-none dark:border-white/10 dark:bg-white/8 dark:text-white dark:hover:border-white/25"
                                        >
                                            Log in
                                        </Link>
                                    )}
                                </div>

                                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                                    {outcomes.map((item) => (
                                        <div
                                            key={item}
                                            className="flex items-start gap-2 text-sm leading-6 text-slate-700 dark:text-slate-300"
                                        >
                                            <Check className="mt-1 size-4 shrink-0 text-teal-600 dark:text-teal-300" />
                                            <span>{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <VoiceLabScene />
                        </div>
                    </div>
                </section>

                <section className="px-4 py-16 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="grid gap-6 lg:grid-cols-[0.72fr_1fr] lg:items-end">
                            <div>
                                <p className="text-sm font-semibold text-teal-700 dark:text-teal-300">
                                    Practice modes
                                </p>
                                <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-normal sm:text-4xl">
                                    Designed around the rooms you actually need
                                    to speak in.
                                </h2>
                            </div>
                            <p className="max-w-2xl text-sm leading-7 text-slate-700 lg:justify-self-end dark:text-slate-300">
                                The experience shifts with your goal: interviews
                                get sharper answer structure, presentations get
                                narrative flow, and impromptu practice keeps you
                                calm when the script disappears.
                            </p>
                        </div>

                        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {practiceModes.map((mode) => {
                                const Icon = mode.icon;

                                return (
                                    <article
                                        key={mode.title}
                                        className="group rounded-lg border border-slate-950/10 bg-white/70 p-5 shadow-sm transition hover:-translate-y-1 hover:border-teal-500/40 hover:shadow-xl hover:shadow-slate-950/10 dark:border-white/10 dark:bg-white/[0.06] dark:hover:border-teal-300/35"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex size-11 items-center justify-center rounded-lg bg-slate-950 text-white transition group-hover:bg-teal-600 dark:bg-white dark:text-slate-950">
                                                <Icon className="size-5" />
                                            </div>
                                            <ChevronRight className="size-5 text-slate-400 transition group-hover:translate-x-1 group-hover:text-teal-600 dark:text-slate-500 dark:group-hover:text-teal-300" />
                                        </div>
                                        <h3 className="mt-5 text-lg font-semibold">
                                            {mode.title}
                                        </h3>
                                        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                                            {mode.description}
                                        </p>
                                    </article>
                                );
                            })}
                        </div>
                    </div>
                </section>

                <section className="px-4 py-16 sm:px-6 lg:px-8">
                    <div className="mx-auto grid max-w-7xl overflow-hidden rounded-lg border border-slate-950/10 bg-slate-950 text-white shadow-2xl shadow-slate-950/20 lg:grid-cols-[0.9fr_1.1fr] dark:border-white/10 dark:bg-white/[0.06]">
                        <div className="p-6 sm:p-8 lg:p-10">
                            <p className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm text-teal-100">
                                <BadgeCheck className="size-4" />
                                Coaching loop
                            </p>
                            <h2 className="mt-6 text-3xl font-semibold tracking-normal sm:text-4xl">
                                From recorded answer to next rep in minutes.
                            </h2>
                            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">
                                TWAC keeps feedback practical: score the
                                delivery, explain the pattern, and turn it into
                                the next focused practice session.
                            </p>
                        </div>

                        <div className="grid border-t border-white/10 lg:border-t-0 lg:border-l">
                            {feedbackSteps.map((step, index) => {
                                const Icon = step.icon;

                                return (
                                    <div
                                        key={step.title}
                                        className="grid gap-4 border-b border-white/10 p-6 last:border-b-0 sm:grid-cols-[auto_1fr] sm:p-8"
                                    >
                                        <div className="flex size-12 items-center justify-center rounded-lg bg-teal-300 text-slate-950">
                                            <Icon className="size-5" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-semibold text-teal-200">
                                                    0{index + 1}
                                                </span>
                                                <h3 className="text-lg font-semibold">
                                                    {step.title}
                                                </h3>
                                            </div>
                                            <p className="mt-2 text-sm leading-6 text-slate-300">
                                                {step.description}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                <section className="px-4 py-16 sm:px-6 lg:px-8">
                    <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1fr_0.85fr] lg:items-center">
                        <div className="rounded-lg border border-slate-950/10 bg-white/70 p-6 shadow-sm sm:p-8 dark:border-white/10 dark:bg-white/[0.06]">
                            <Quote className="size-8 text-teal-600 dark:text-teal-300" />
                            <p className="mt-5 text-2xl leading-9 font-semibold tracking-normal">
                                The best speaking practice is not more notes. It
                                is hearing yourself, spotting the pattern, and
                                trying again with one sharper intention.
                            </p>
                            <div className="mt-6 flex flex-wrap gap-2">
                                {[
                                    'Private sessions',
                                    'Readable feedback',
                                    'Streak tracking',
                                    'Interview setup',
                                ].map((item) => (
                                    <span
                                        key={item}
                                        className="rounded-lg border border-slate-950/10 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 dark:border-white/10 dark:bg-white/8 dark:text-slate-200"
                                    >
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-lg border border-teal-600/20 bg-teal-600 p-6 text-white shadow-xl shadow-teal-700/20 sm:p-8">
                            <ShieldCheck className="size-8" />
                            <h2 className="mt-5 text-3xl font-semibold tracking-normal">
                                Build a better speaking streak.
                            </h2>
                            <p className="mt-3 text-sm leading-7 text-teal-50">
                                Start with one short session today. Keep the
                                habit visible, listen back to feedback, and make
                                every rep less random.
                            </p>
                            <Link
                                href={primaryHref}
                                className="mt-7 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-white px-5 text-sm font-semibold text-teal-800 transition hover:bg-teal-50 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                            >
                                {auth.user
                                    ? 'Continue practicing'
                                    : 'Create free account'}
                                <Zap className="size-4" />
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}
