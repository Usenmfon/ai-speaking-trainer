import { Head } from '@inertiajs/react';
import {
    AlertTriangle,
    CheckCircle2,
    CircleStop,
    Gauge,
    Mic2,
    Pause,
    Play,
    Sparkles,
    Timer,
    Volume2,
} from 'lucide-react';
import { FeedbackCard } from '@/components/ai/feedback-card';
import { GlassCard } from '@/components/ai/glass-card';
import { GradientButton } from '@/components/ai/gradient-button';
import { ProgressChartMock } from '@/components/ai/progress-chart-mock';
import { WaveformMock } from '@/components/ai/waveform-mock';
import { dashboard, practice } from '@/routes';

const transcript = [
    {
        time: '00:08',
        text: 'Today I want to walk you through the core problem our product solves for busy teams.',
    },
    {
        time: '00:24',
        text: 'Instead of switching between scattered tools, managers can prepare a clear message in one guided flow.',
    },
    {
        time: '00:41',
        text: 'The key result is faster alignment, fewer follow-up meetings, and a stronger sense of ownership.',
    },
];

const pronunciation = [
    { word: 'alignment', score: 'Needs polish' },
    { word: 'ownership', score: 'Clear' },
    { word: 'through', score: 'Clear' },
];

export default function Practice() {
    return (
        <>
            <Head title="Practice Session" />
            <div className="min-h-full bg-[#070a18] px-4 py-6 text-white sm:px-6 lg:px-8">
                <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[1.35fr_0.65fr]">
                    <section className="flex flex-col gap-6">
                        <GlassCard className="p-5 sm:p-7" glow>
                            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                                <div>
                                    <p className="flex items-center gap-2 text-sm font-semibold text-cyan-200">
                                        <Mic2 className="size-4" />
                                        Practice session
                                    </p>
                                    <h1 className="mt-3 text-3xl font-semibold tracking-normal sm:text-4xl">
                                        Presentation rehearsal
                                    </h1>
                                    <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                                        Mock live recording mode. The interface
                                        is ready for real audio events when the
                                        backend recording pipeline is connected.
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-5 py-3 text-center">
                                    <p className="text-xs text-cyan-100">
                                        Recording timer
                                    </p>
                                    <p className="mt-1 font-mono text-3xl font-semibold">
                                        02:48
                                    </p>
                                </div>
                            </div>

                            <WaveformMock className="mt-8 h-64" bars={54} />

                            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                                <GradientButton>
                                    <Play className="size-4" />
                                    Start
                                </GradientButton>
                                <GradientButton variant="secondary">
                                    <Pause className="size-4" />
                                    Pause
                                </GradientButton>
                                <button
                                    type="button"
                                    className="inline-flex items-center justify-center gap-2 rounded-full border border-rose-300/30 bg-rose-400/10 px-5 py-3 text-sm font-semibold text-rose-100 transition hover:-translate-y-0.5 hover:bg-rose-400/15 focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 focus-visible:outline-none"
                                >
                                    <CircleStop className="size-4" />
                                    Stop
                                </button>
                            </div>
                        </GlassCard>

                        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
                            <GlassCard className="p-5">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-semibold">
                                        Real-time transcript
                                    </h2>
                                    <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs text-emerald-200">
                                        Live
                                    </span>
                                </div>
                                <div className="mt-5 flex flex-col gap-4">
                                    {transcript.map((line) => (
                                        <div
                                            key={line.time}
                                            className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                                        >
                                            <p className="text-xs text-cyan-200">
                                                {line.time}
                                            </p>
                                            <p className="mt-2 text-sm leading-6 text-slate-200">
                                                {line.text}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </GlassCard>

                            <GlassCard className="p-5">
                                <h2 className="text-xl font-semibold">
                                    Final session score
                                </h2>
                                <div className="mt-5 grid grid-cols-2 gap-3">
                                    {[
                                        ['Overall', '89%'],
                                        ['Confidence', '91%'],
                                        ['Pronunciation', '93%'],
                                        ['Pacing', '84%'],
                                    ].map(([label, value]) => (
                                        <div
                                            key={label}
                                            className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                                        >
                                            <p className="text-sm text-slate-400">
                                                {label}
                                            </p>
                                            <p className="mt-2 text-2xl font-semibold">
                                                {value}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                                <ProgressChartMock className="mt-6 h-28" />
                            </GlassCard>
                        </div>
                    </section>

                    <aside className="flex flex-col gap-6">
                        <GlassCard className="p-5" glow>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-400">
                                        Confidence meter
                                    </p>
                                    <p className="mt-2 text-4xl font-semibold">
                                        91%
                                    </p>
                                </div>
                                <Gauge className="size-7 text-cyan-200" />
                            </div>
                            <div className="mt-5 h-3 rounded-full bg-white/8">
                                <div className="h-full w-[91%] rounded-full bg-linear-to-r from-cyan-300 to-violet-500 shadow-[0_0_22px_rgba(34,211,238,0.35)]" />
                            </div>
                        </GlassCard>

                        <FeedbackCard
                            icon={AlertTriangle}
                            title="Filler-word alert"
                            body="You used 'actually' twice in 20 seconds. Replace it with a short pause."
                            tone="warning"
                        />
                        <FeedbackCard
                            icon={Timer}
                            title="Pacing coach"
                            body="Slow down through the middle section. Current pace is 154 wpm."
                            tone="info"
                        />
                        <FeedbackCard
                            icon={CheckCircle2}
                            title="Strong delivery"
                            body="Your opening sentence was clear, confident, and easy to follow."
                            tone="success"
                        />

                        <GlassCard className="p-5">
                            <div className="flex items-center gap-3">
                                <Volume2 className="size-5 text-cyan-200" />
                                <h2 className="text-xl font-semibold">
                                    Pronunciation highlights
                                </h2>
                            </div>
                            <div className="mt-5 flex flex-col gap-3">
                                {pronunciation.map((item) => (
                                    <div
                                        key={item.word}
                                        className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-3"
                                    >
                                        <span className="text-sm font-medium">
                                            {item.word}
                                        </span>
                                        <span
                                            className={`rounded-full px-3 py-1 text-xs ${
                                                item.score === 'Clear'
                                                    ? 'bg-emerald-300/10 text-emerald-200'
                                                    : 'bg-amber-300/10 text-amber-200'
                                            }`}
                                        >
                                            {item.score}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </GlassCard>

                        <GlassCard className="p-5" glow>
                            <p className="flex items-center gap-2 text-sm font-semibold text-cyan-200">
                                <Sparkles className="size-4" />
                                AI feedback stream
                            </p>
                            <p className="mt-3 text-sm leading-6 text-slate-300">
                                Keep the structure. Your second point is strong,
                                but it needs a clearer transition into the
                                result.
                            </p>
                        </GlassCard>
                    </aside>
                </div>
            </div>
        </>
    );
}

Practice.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Practice',
            href: practice(),
        },
    ],
};
