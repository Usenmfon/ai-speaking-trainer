import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    AudioLines,
    BrainCircuit,
    CalendarCheck2,
    CheckCircle2,
    Lightbulb,
    MessageSquareText,
    Mic2,
    Play,
    Sparkles,
    Square,
    Target,
    Timer,
    WandSparkles,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { create } from '@/actions/App/Http/Controllers/PracticeSessionController';
import { Button } from '@/components/ui/button';
import { aiCoach, dashboard } from '@/routes';

type CoachDrill = {
    title: string;
    description: string;
    value: string;
    duration: string;
};

type CoachingSignal = {
    title: string;
    value: string;
    description: string;
    icon: 'target' | 'timer' | 'message';
};

type SessionPlanItem = {
    title: string;
    description: string;
};

type CoachNote = {
    title: string;
    description: string;
    value: string;
};

type AiCoachProps = {
    coachDrills: CoachDrill[];
    coachingSignals: CoachingSignal[];
    sessionPlan: SessionPlanItem[];
    coachNote: CoachNote | null;
};

const signalIcons = {
    target: Target,
    timer: Timer,
    message: MessageSquareText,
};

const starterCoachDrills: CoachDrill[] = [
    {
        title: 'Clarity warm-up',
        description: 'Slow down and make each sentence easier to follow.',
        value: 'Explain your last project in 60 seconds. Pause briefly after each main point before continuing.',
        duration: '5 min',
    },
    {
        title: 'Filler reset',
        description: 'Replace filler words with short, controlled pauses.',
        value: 'Answer a common interview question and take one silent breath whenever you feel a filler word coming.',
        duration: '4 min',
    },
    {
        title: 'Stronger closing',
        description: 'End your answer with a confident summary sentence.',
        value: 'Describe a challenge you solved, then finish with one sentence that states the result and impact.',
        duration: '6 min',
    },
];

const starterCoachingSignals: CoachingSignal[] = [
    {
        title: 'Primary focus',
        value: 'Speak in shorter thought groups',
        description:
            'Aim for one clear idea per sentence so the recording is easier to score and improve.',
        icon: 'target',
    },
    {
        title: 'Pace target',
        value: 'Steady, not rushed',
        description:
            'Use a brief pause after important words instead of speeding through the answer.',
        icon: 'timer',
    },
    {
        title: 'Delivery cue',
        value: 'Finish with intent',
        description:
            'Let your final sentence sound complete, even if the answer is short.',
        icon: 'message',
    },
];

const starterSessionPlan: SessionPlanItem[] = [
    {
        title: 'Step 1',
        description: 'Pick one drill and read the prompt once.',
    },
    {
        title: 'Step 2',
        description: 'Record one focused take without stopping early.',
    },
    {
        title: 'Step 3',
        description: 'Listen back and note one thing to improve.',
    },
    {
        title: 'Step 4',
        description: 'Upload the best take for feedback.',
    },
];

const starterCoachNote: CoachNote = {
    title: 'Starter coach note',
    description:
        'Coach recommendations become more personal after your first analyzed recording.',
    value: 'For now, focus on clear pacing and a complete final sentence.',
};

export default function AiCoach({
    coachDrills,
    coachingSignals,
    sessionPlan,
    coachNote,
}: AiCoachProps) {
    const hasPersonalizedCoachContent =
        coachDrills.length > 0 ||
        coachingSignals.length > 0 ||
        sessionPlan.length > 0 ||
        coachNote !== null;
    const availableDrills =
        coachDrills.length > 0 ? coachDrills : starterCoachDrills;
    const availableSignals =
        coachingSignals.length > 0 ? coachingSignals : starterCoachingSignals;
    const availableSessionPlan =
        sessionPlan.length > 0 ? sessionPlan : starterSessionPlan;
    const activeCoachNote = coachNote ?? starterCoachNote;
    const [selectedDrill, setSelectedDrill] = useState<CoachDrill | null>(
        availableDrills[0] ?? null,
    );
    const activeDrill = selectedDrill ?? availableDrills[0] ?? null;
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);
    const [audioError, setAudioError] = useState<string | null>(null);
    const performanceHacks = [
        availableSignals[0]?.value
            ? `Lead with ${availableSignals[0].value.toLowerCase()} before you try to improve everything else.`
            : 'Pick one speaking behavior to improve before you record.',
        'Use a one-beat pause after important words so your delivery sounds deliberate.',
        activeDrill?.title
            ? `Run the ${activeDrill.title.toLowerCase()} drill once before recording a full take.`
            : 'Warm up with one short drill before recording a full take.',
    ];
    const signalSummary = availableSignals
        .map(
            (signal) =>
                `${signal.title}: ${signal.value}. ${signal.description}`,
        )
        .join(' ');
    const audioBriefing = [
        'Here is your AI coach briefing.',
        activeCoachNote.title,
        activeCoachNote.description,
        activeCoachNote.value,
        activeDrill
            ? `Your selected drill is ${activeDrill.title}. ${activeDrill.value}`
            : null,
        'Your coaching cues are:',
        signalSummary,
        'Performance hacks:',
        ...performanceHacks,
    ]
        .filter(Boolean)
        .join(' ');

    useEffect(() => {
        return () => {
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    function playAudioBriefing(): void {
        if (!('speechSynthesis' in window)) {
            setAudioError(
                'Voice playback is not supported in this browser. You can still read the coach briefing below.',
            );

            return;
        }

        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(audioBriefing);
        utterance.rate = 0.95;
        utterance.pitch = 1;
        utterance.onend = () => setIsAudioPlaying(false);
        utterance.onerror = () => {
            setIsAudioPlaying(false);
            setAudioError(
                'Voice playback stopped unexpectedly. Try again or read the coach briefing below.',
            );
        };

        setAudioError(null);
        setIsAudioPlaying(true);
        window.speechSynthesis.speak(utterance);
    }

    function stopAudioBriefing(): void {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }

        setIsAudioPlaying(false);
    }

    return (
        <>
            <Head title="AI Coach" />

            <div className="min-h-full bg-background px-4 py-5 text-foreground sm:px-6 sm:py-6 lg:px-8">
                <div className="mx-auto flex max-w-7xl min-w-0 flex-col gap-5 sm:gap-6">
                    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                        <div className="bg-linear-to-br from-cyan-500/10 via-violet-500/10 to-background p-5 sm:p-8">
                            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                                <div className="min-w-0">
                                    <p className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-700 dark:text-cyan-200">
                                        <BrainCircuit className="size-4 shrink-0" />
                                        AI Coach
                                    </p>
                                    <h1 className="mt-3 text-2xl font-semibold tracking-normal break-words sm:text-4xl">
                                        Your next speaking rep, planned
                                    </h1>
                                    <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
                                        Use focused drills, coaching cues, and
                                        practice prompts to prepare before
                                        recording a full session.
                                    </p>
                                </div>

                                <Button
                                    asChild
                                    size="lg"
                                    className="w-full sm:w-auto"
                                >
                                    <Link href={create()}>
                                        <Mic2 className="size-4" />
                                        Start practice
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </section>

                    {!hasPersonalizedCoachContent && (
                        <section className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-950 shadow-sm dark:text-amber-100">
                            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                                <div className="flex gap-3">
                                    <Lightbulb className="mt-0.5 size-5 shrink-0" />
                                    <div className="min-w-0">
                                        <p className="font-semibold">
                                            Coach content is warming up
                                        </p>
                                        <p className="mt-1 text-sm leading-6">
                                            These starter drills are ready now.
                                            Personalized coaching appears after
                                            your analyzed sessions.
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    asChild
                                    variant="outline"
                                    className="w-full bg-background sm:w-auto"
                                >
                                    <Link href={create()}>
                                        <Mic2 className="size-4" />
                                        Start practice
                                    </Link>
                                </Button>
                            </div>
                        </section>
                    )}

                    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                        <div className="grid gap-0 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                            <div className="relative overflow-hidden bg-linear-to-br from-cyan-500/10 via-violet-500/10 to-background p-5 sm:p-6">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.20),transparent_28%),radial-gradient(circle_at_78%_18%,rgba(139,92,246,0.18),transparent_24%)]" />
                                <div className="relative">
                                    <p className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-700 dark:text-cyan-200">
                                        <AudioLines className="size-4" />
                                        Voice feedback
                                    </p>
                                    <h2 className="mt-3 text-xl font-semibold tracking-normal">
                                        Listen to your coach briefing
                                    </h2>
                                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                        Hear your improvement focus, the active
                                        drill, and quick performance hacks
                                        before you record.
                                    </p>

                                    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                                        <Button
                                            type="button"
                                            className="w-full sm:w-auto"
                                            onClick={playAudioBriefing}
                                            disabled={isAudioPlaying}
                                        >
                                            <Play className="size-4" />
                                            {isAudioPlaying
                                                ? 'Playing briefing'
                                                : 'Play briefing'}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full bg-background sm:w-auto"
                                            onClick={stopAudioBriefing}
                                            disabled={!isAudioPlaying}
                                        >
                                            <Square className="size-4" />
                                            Stop
                                        </Button>
                                    </div>

                                    {audioError && (
                                        <p className="mt-3 text-sm leading-6 text-amber-700 dark:text-amber-200">
                                            {audioError}
                                        </p>
                                    )}

                                    <div className="mt-5 flex h-16 items-end gap-1 overflow-hidden rounded-xl border border-border bg-background/70 px-3 py-3">
                                        {Array.from({ length: 32 }).map(
                                            (_, index) => (
                                                <span
                                                    key={index}
                                                    className={`w-1 rounded-full bg-cyan-500/70 dark:bg-cyan-200/80 ${
                                                        isAudioPlaying
                                                            ? 'waveform-bar'
                                                            : ''
                                                    }`}
                                                    style={{
                                                        height: `${12 + ((index * 17) % 44)}px`,
                                                        animationDelay: `${(index % 10) * 75}ms`,
                                                    }}
                                                />
                                            ),
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 sm:p-6">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-emerald-700 dark:text-emerald-200">
                                        <CheckCircle2 className="size-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold">
                                            Performance hacks
                                        </h2>
                                        <p className="text-sm text-muted-foreground">
                                            Fast cues to apply in your next
                                            take.
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-5 grid gap-3">
                                    {performanceHacks.map((hack, index) => (
                                        <div
                                            key={hack}
                                            className="rounded-xl border border-border bg-background p-4"
                                        >
                                            <span className="text-xs font-semibold text-cyan-700 dark:text-cyan-200">
                                                Hack {index + 1}
                                            </span>
                                            <p className="mt-2 text-sm leading-6">
                                                {hack}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)]">
                        <aside className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-3 text-cyan-700 dark:text-cyan-200">
                                    <Sparkles className="size-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold">
                                        Drill library
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        Choose a focused warm-up.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5 flex flex-col gap-3">
                                {availableDrills.map((drill) => {
                                    const selected =
                                        activeDrill?.title === drill.title;

                                    return (
                                        <button
                                            key={drill.title}
                                            type="button"
                                            onClick={() =>
                                                setSelectedDrill(drill)
                                            }
                                            className={`rounded-xl border p-4 text-left transition ${
                                                selected
                                                    ? 'border-cyan-500/40 bg-cyan-500/10'
                                                    : 'border-border bg-background hover:border-cyan-400/50 hover:bg-accent'
                                            }`}
                                        >
                                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                                <div className="min-w-0">
                                                    <p className="font-medium">
                                                        {drill.title}
                                                    </p>
                                                    <p className="mt-1 text-sm text-muted-foreground">
                                                        {drill.description}
                                                    </p>
                                                </div>
                                                <span className="w-fit rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">
                                                    {drill.duration}
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </aside>

                        <section className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-cyan-700 dark:text-cyan-200">
                                            Selected drill
                                        </p>
                                        <h2 className="mt-2 text-xl font-semibold break-words">
                                            {activeDrill?.title ??
                                                'No drill selected'}
                                        </h2>
                                    </div>
                                    {activeDrill && (
                                        <span className="w-fit rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-700 dark:text-cyan-200">
                                            {activeDrill.duration}
                                        </span>
                                    )}
                                </div>

                                <div className="mt-5 rounded-2xl border border-border bg-background p-5">
                                    <p className="text-sm text-muted-foreground">
                                        Prompt
                                    </p>
                                    <p className="mt-3 text-lg leading-8 font-medium">
                                        {activeDrill?.value ??
                                            starterCoachDrills[0].value}
                                    </p>
                                </div>

                                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                    <Button asChild>
                                        <Link href={create()}>
                                            Record this drill
                                            <ArrowRight className="size-4" />
                                        </Link>
                                    </Button>
                                    <Button variant="outline" asChild>
                                        <Link href={dashboard()}>
                                            View dashboard
                                        </Link>
                                    </Button>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 p-3 text-violet-700 dark:text-violet-200">
                                        <WandSparkles className="size-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold">
                                            Coach guidance
                                        </h2>
                                        <p className="text-sm text-muted-foreground">
                                            Use these cues while speaking.
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-5 flex flex-col gap-3">
                                    {availableSignals.map((signal) => {
                                        const SignalIcon =
                                            signalIcons[signal.icon] ??
                                            MessageSquareText;

                                        return (
                                            <div
                                                key={signal.title}
                                                className="rounded-xl border border-border bg-background p-4"
                                            >
                                                <div className="flex gap-3">
                                                    <SignalIcon className="mt-0.5 size-5 shrink-0 text-cyan-700 dark:text-cyan-200" />
                                                    <div className="min-w-0">
                                                        <p className="text-sm text-muted-foreground">
                                                            {signal.title}
                                                        </p>
                                                        <p className="mt-1 font-semibold break-words">
                                                            {signal.value}
                                                        </p>
                                                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                                            {signal.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </section>
                    </section>

                    <section className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                            <div className="flex items-center gap-3">
                                <CalendarCheck2 className="size-5 text-cyan-700 dark:text-cyan-200" />
                                <h2 className="text-lg font-semibold">
                                    Four-step practice plan
                                </h2>
                            </div>

                            <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                {availableSessionPlan.map((step, index) => (
                                    <div
                                        key={step.title}
                                        className="rounded-xl border border-border bg-background p-4"
                                    >
                                        <span className="text-sm font-semibold text-cyan-700 dark:text-cyan-200">
                                            {step.title || `Step ${index + 1}`}
                                        </span>
                                        <p className="mt-2 text-sm leading-6">
                                            {step.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                            <div className="flex items-center gap-3">
                                <Lightbulb className="size-5 text-cyan-700 dark:text-cyan-200" />
                                <h2 className="text-lg font-semibold">
                                    {activeCoachNote.title}
                                </h2>
                            </div>
                            <p className="mt-4 text-sm leading-7 text-muted-foreground">
                                {activeCoachNote.description}
                            </p>
                            <div className="mt-5 rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4 text-sm text-emerald-800 dark:text-emerald-100">
                                <div className="flex gap-3">
                                    <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                                    <p>{activeCoachNote.value}</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}

AiCoach.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'AI Coach',
            href: aiCoach(),
        },
    ],
};
