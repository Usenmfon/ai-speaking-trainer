import { Head, Link, usePage } from '@inertiajs/react';
import {
    AudioLines,
    CheckCircle2,
    ChevronRight,
    Mic2,
    Monitor,
    Moon,
    Sun,
} from 'lucide-react';
import { GlassCard } from '@/components/ai/glass-card';
import { GradientButton } from '@/components/ai/gradient-button';
import { WaveformMock } from '@/components/ai/waveform-mock';
import { useAppearance } from '@/hooks/use-appearance';
import { dashboard, login, register } from '@/routes';

const highlights = [
    'Practice with guided speech prompts',
    'Get clear feedback after each session',
    'Track confidence, pace, and filler words',
];

const coachingNotes = [
    {
        label: 'Pace',
        value: '142 wpm',
    },
    {
        label: 'Confidence',
        value: '91%',
    },
    {
        label: 'Fillers',
        value: '3',
    },
];

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

    return (
        <>
            <Head title="AI Speaking Coach" />
            <main className="min-h-screen bg-slate-50 text-slate-950 dark:bg-[#070914] dark:text-white">
                <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
                    <Link href="/" className="flex min-w-0 items-center gap-3">
                        <span className="flex size-10 items-center justify-center rounded-xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                            <Mic2 className="size-5" />
                        </span>
                        <span className="truncate text-sm font-semibold">
                            SpeakAI Coach
                        </span>
                    </Link>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <button
                            type="button"
                            onClick={() => updateAppearance(nextAppearance)}
                            className="inline-flex size-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-cyan-500/40 hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:outline-none dark:border-white/10 dark:bg-white/8 dark:text-slate-200 dark:hover:border-cyan-300/50 dark:hover:text-white"
                            aria-label={`Switch to ${nextAppearance} theme`}
                            title={`Switch to ${nextAppearance} theme`}
                        >
                            <ThemeIcon className="size-4" />
                        </button>

                        {auth.user ? (
                            <GradientButton
                                href={dashboard()}
                                className="px-4 sm:px-5"
                            >
                                Dashboard
                            </GradientButton>
                        ) : (
                            <>
                                <Link
                                    href={login()}
                                    className="hidden rounded-full px-4 py-2 text-sm text-slate-600 transition hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:outline-none sm:inline-flex dark:text-slate-300 dark:hover:text-white"
                                >
                                    Log in
                                </Link>
                                <GradientButton
                                    href={register()}
                                    className="px-4 sm:px-5"
                                >
                                    Start
                                </GradientButton>
                            </>
                        )}
                    </div>
                </header>

                <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,0.85fr)] lg:px-8">
                    <div className="min-w-0">
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-700 dark:border-cyan-300/20 dark:bg-cyan-300/10 dark:text-cyan-100">
                            <AudioLines className="size-4" />
                            Simple speaking practice with AI feedback
                        </div>

                        <h1 className="max-w-3xl text-4xl font-semibold tracking-normal text-slate-950 sm:text-5xl lg:text-6xl dark:text-white">
                            Speak better with one focused practice session.
                        </h1>

                        <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg dark:text-slate-300">
                            Record a speech, interview answer, or presentation
                            draft. SpeakAI Coach listens, then shows the few
                            improvements that matter most.
                        </p>

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <GradientButton
                                href={auth.user ? dashboard() : register()}
                                className="w-full px-7 sm:w-auto"
                            >
                                Start practicing
                                <ChevronRight className="size-4" />
                            </GradientButton>
                            {!auth.user && (
                                <GradientButton
                                    href={login()}
                                    variant="secondary"
                                    className="w-full sm:w-auto"
                                >
                                    Log in
                                </GradientButton>
                            )}
                        </div>

                        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                            No credit card required. Your practice sessions stay
                            private.
                        </p>

                        <div className="mt-8 grid gap-3 text-sm text-slate-600 dark:text-slate-300">
                            {highlights.map((item) => (
                                <div
                                    key={item}
                                    className="flex items-center gap-2"
                                >
                                    <CheckCircle2 className="size-4 shrink-0 text-cyan-500 dark:text-cyan-300" />
                                    <span>{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <GlassCard className="p-4 sm:p-5" glow>
                        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-950/70">
                            <div className="mb-5 flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Practice session
                                    </p>
                                    <h2 className="mt-1 text-xl font-semibold">
                                        Interview answer
                                    </h2>
                                </div>
                                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-700 dark:bg-emerald-300/10 dark:text-emerald-200">
                                    Ready
                                </span>
                            </div>

                            <WaveformMock bars={28} />

                            <div className="mt-5 grid gap-3 sm:grid-cols-3">
                                {coachingNotes.map((note) => (
                                    <div
                                        key={note.label}
                                        className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/[0.05]"
                                    >
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            {note.label}
                                        </p>
                                        <p className="mt-1 text-lg font-semibold">
                                            {note.value}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-5 rounded-xl border border-cyan-500/15 bg-cyan-500/10 p-4 text-sm leading-6 text-slate-700 dark:border-cyan-300/10 dark:bg-cyan-300/10 dark:text-slate-200">
                                Slow down before your final point. Replace the
                                next filler word with a short pause.
                            </div>
                        </div>
                    </GlassCard>
                </section>

                <section className="border-y border-slate-200 bg-white/70 px-4 py-14 sm:px-6 lg:px-8 dark:border-white/10 dark:bg-white/[0.03]">
                    <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">
                        {[
                            [
                                '1',
                                'Choose a goal',
                                'Pick interview, speech, or presentation practice.',
                            ],
                            [
                                '2',
                                'Record naturally',
                                'Speak out loud and keep the session focused.',
                            ],
                            [
                                '3',
                                'Improve one thing',
                                'Leave with a short, useful coaching note.',
                            ],
                        ].map(([step, title, description]) => (
                            <div
                                key={step}
                                className="rounded-xl bg-transparent p-1"
                            >
                                <div className="mb-4 flex size-9 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white dark:bg-white dark:text-slate-950">
                                    {step}
                                </div>
                                <h3 className="text-lg font-semibold">
                                    {title}
                                </h3>
                                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                                    {description}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6 sm:py-20 lg:px-8">
                    <h2 className="text-2xl font-semibold sm:text-4xl">
                        Less noise. Better practice.
                    </h2>
                    <p className="mx-auto mt-4 max-w-2xl text-slate-600 dark:text-slate-300">
                        Start with one session and get a simple read on what to
                        keep, what to adjust, and what to practice next.
                    </p>
                    <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                        Free to start. Private by default.
                    </p>
                    <div className="mt-8 flex justify-center">
                        <GradientButton
                            href={auth.user ? dashboard() : register()}
                        >
                            {auth.user
                                ? 'Go to dashboard'
                                : 'Create free account'}
                            <ChevronRight className="size-4" />
                        </GradientButton>
                    </div>
                </section>
            </main>
        </>
    );
}
