import { Head, Link, usePage } from '@inertiajs/react';
import {
    BrainCircuit,
    BriefcaseBusiness,
    CheckCircle2,
    ChevronRight,
    Gauge,
    LineChart,
    MessageSquareText,
    Mic2,
    Presentation,
    Radio,
    Sparkles,
    Speech,
    Target,
    Volume2,
    WandSparkles,
} from 'lucide-react';
import { FeatureCard } from '@/components/ai/feature-card';
import { GlassCard } from '@/components/ai/glass-card';
import { GradientButton } from '@/components/ai/gradient-button';
import { PracticeModeCard } from '@/components/ai/practice-mode-card';
import { PricingCard } from '@/components/ai/pricing-card';
import { ProgressChartMock } from '@/components/ai/progress-chart-mock';
import { SectionHeading } from '@/components/ai/section-heading';
import { WaveformMock } from '@/components/ai/waveform-mock';
import { dashboard, login, register } from '@/routes';

const features = [
    {
        title: 'Real-time speech analysis',
        description:
            'Track clarity, confidence, energy, and delivery patterns while you rehearse.',
        icon: Radio,
    },
    {
        title: 'AI pronunciation feedback',
        description:
            'Spot difficult sounds and receive focused practice prompts for cleaner articulation.',
        icon: Volume2,
    },
    {
        title: 'Filler word detection',
        description:
            'See every um, ah, and like so you can replace hesitation with intentional pauses.',
        icon: MessageSquareText,
    },
    {
        title: 'Tone and pacing analysis',
        description:
            'Balance warmth, authority, speed, and pauses for presentations that feel natural.',
        icon: Gauge,
    },
    {
        title: 'Presentation practice mode',
        description:
            'Rehearse structured talks with slide-like checkpoints and timing feedback.',
        icon: Presentation,
    },
    {
        title: 'Interview simulator',
        description:
            'Practice high-pressure answers with adaptive follow-up questions from your AI coach.',
        icon: BriefcaseBusiness,
    },
    {
        title: 'Progress tracking',
        description:
            'Watch scores improve across confidence, fluency, pronunciation, and pacing.',
        icon: LineChart,
    },
    {
        title: 'AI recommendations',
        description:
            'Get prioritized coaching notes after every session so the next rep is sharper.',
        icon: WandSparkles,
    },
];

const practiceModes = [
    {
        title: 'Public speaking',
        description: 'Build stage presence with timed talks and audience-style prompts.',
        icon: Speech,
        metric: '92% clarity',
    },
    {
        title: 'Presentation rehearsal',
        description: 'Polish executive updates, demos, and classroom presentations.',
        icon: Presentation,
        metric: '18 min',
    },
    {
        title: 'Interview practice',
        description: 'Train concise stories for behavioral and role-specific questions.',
        icon: BriefcaseBusiness,
        metric: '12 prompts',
    },
    {
        title: 'Debate mode',
        description: 'Practice rebuttals, structure, and confident real-time thinking.',
        icon: BrainCircuit,
        metric: 'Live drills',
    },
    {
        title: 'Conversation simulator',
        description: 'Improve fluency, active listening, and everyday confidence.',
        icon: MessageSquareText,
        metric: 'AI partner',
    },
    {
        title: 'Sales pitch training',
        description: 'Sharpen discovery, objection handling, and close-ready delivery.',
        icon: Target,
        metric: '3 scripts',
    },
];

const testimonials = [
    {
        quote: 'The feedback is direct without being harsh. I finally know what to practice between team presentations.',
        name: 'Maya Chen',
        role: 'Product Manager',
    },
    {
        quote: 'I cut filler words in half before a fellowship interview and felt much calmer walking in.',
        name: 'Andre Lawson',
        role: 'Graduate Student',
    },
    {
        quote: 'The pacing and tone insights made our sales demos sound more confident and less rushed.',
        name: 'Priya Nair',
        role: 'Revenue Lead',
    },
];

const pricing = [
    {
        name: 'Free',
        price: '$0',
        description: 'For casual practice and quick confidence checks.',
        features: ['5 practice sessions', 'Basic transcript', 'Starter analytics'],
    },
    {
        name: 'Pro',
        price: '$19',
        description: 'For professionals preparing for talks, interviews, and pitches.',
        features: [
            'Unlimited practice',
            'Advanced AI feedback',
            'Progress history',
            'Interview simulator',
        ],
        highlighted: true,
    },
    {
        name: 'Team',
        price: 'Custom',
        description: 'For groups building stronger communicators together.',
        features: [
            'Team analytics',
            'Shared practice libraries',
            'Admin controls',
            'Priority support',
        ],
    },
];

export default function Welcome() {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="AI Speaking Coach" />
            <main className="dark min-h-screen overflow-hidden bg-[#060817] text-white">
                <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(34,211,238,0.22),transparent_28%),radial-gradient(circle_at_80%_0%,rgba(139,92,246,0.22),transparent_32%),linear-gradient(135deg,rgba(14,165,233,0.06),rgba(124,58,237,0.08),transparent)]" />
                <div className="relative">
                    <header className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
                        <Link href="/" className="flex min-w-0 items-center gap-3">
                            <span className="flex size-10 items-center justify-center rounded-2xl bg-linear-to-br from-cyan-300 to-violet-500 text-slate-950 shadow-[0_0_30px_rgba(34,211,238,0.28)]">
                                <Mic2 className="size-5" />
                            </span>
                            <span className="truncate text-sm font-semibold">
                                SpeakAI Coach
                            </span>
                        </Link>
                        <nav className="hidden items-center gap-7 text-sm text-slate-300 md:flex">
                            <a href="#features" className="hover:text-white">
                                Features
                            </a>
                            <a href="#modes" className="hover:text-white">
                                Modes
                            </a>
                            <a href="#pricing" className="hover:text-white">
                                Pricing
                            </a>
                        </nav>
                        <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:flex-none sm:gap-3">
                            {auth.user ? (
                                <GradientButton href={dashboard()} className="px-4 sm:px-5">
                                    Dashboard
                                </GradientButton>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="hidden rounded-full px-4 py-2 text-sm text-slate-300 transition hover:text-white focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:outline-none sm:inline-flex"
                                    >
                                        Log in
                                    </Link>
                                    <GradientButton
                                        href={register()}
                                        className="min-w-0 px-4 sm:px-5"
                                    >
                                        Start Practicing
                                    </GradientButton>
                                </>
                            )}
                        </div>
                    </header>

                    <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 pt-10 pb-20 sm:px-6 sm:pt-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:px-8 lg:pt-20 lg:pb-24">
                        <div className="min-w-0">
                            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-100">
                                <Sparkles className="size-4" />
                                <span>Real-time coaching for every speaking moment</span>
                            </div>
                            <h1 className="text-balance text-4xl font-semibold tracking-normal text-white sm:text-5xl lg:text-7xl">
                                Master Public Speaking with AI
                            </h1>
                            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
                                Practice speeches, presentations, interviews,
                                and conversations with real-time AI feedback.
                            </p>
                            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                                <GradientButton
                                    href={auth.user ? dashboard() : register()}
                                    className="w-full px-7 sm:w-auto"
                                >
                                    Start Practicing
                                    <ChevronRight className="size-4" />
                                </GradientButton>
                                <GradientButton
                                    variant="secondary"
                                    className="w-full sm:w-auto"
                                >
                                    Watch Demo
                                </GradientButton>
                            </div>
                            <div className="mt-8 grid gap-3 text-sm text-slate-300 sm:max-w-xl sm:grid-cols-3">
                                {['30k sessions analyzed', '4.9 coach rating', 'Private by design'].map(
                                    (item) => (
                                        <div
                                            key={item}
                                            className="flex min-w-0 items-center gap-2"
                                        >
                                            <CheckCircle2 className="size-4 shrink-0 text-cyan-300" />
                                            <span className="min-w-0">{item}</span>
                                        </div>
                                    ),
                                )}
                            </div>
                        </div>

                        <div className="relative min-w-0">
                            <GlassCard className="animate-slow-float p-4 sm:p-5" glow>
                                <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                                    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="min-w-0">
                                            <p className="text-sm text-slate-400">
                                                Live session
                                            </p>
                                            <h2 className="text-lg font-semibold sm:text-xl">
                                                Investor pitch rehearsal
                                            </h2>
                                        </div>
                                        <span className="w-fit rounded-full bg-emerald-300/10 px-3 py-1 text-xs text-emerald-200">
                                            Recording
                                        </span>
                                    </div>
                                    <WaveformMock />
                                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                                        {[
                                            ['Confidence', '91%'],
                                            ['Pace', '142 wpm'],
                                            ['Fillers', '3'],
                                        ].map(([label, value]) => (
                                            <div
                                                key={label}
                                                className="rounded-xl border border-white/10 bg-white/[0.05] p-3"
                                            >
                                                <p className="text-xs text-slate-400">
                                                    {label}
                                                </p>
                                                <p className="mt-1 text-lg font-semibold text-white">
                                                    {value}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </GlassCard>
                            <GlassCard className="mt-4 p-4 sm:absolute sm:-right-4 sm:-bottom-8 sm:mt-0 sm:max-w-xs lg:-right-8" glow>
                                <p className="text-sm font-semibold text-cyan-100">
                                    AI coach note
                                </p>
                                <p className="mt-2 text-sm leading-6 text-slate-300">
                                    Strong opening. Slow down before the pricing
                                    slide and replace two filler words with a
                                    pause.
                                </p>
                            </GlassCard>
                        </div>
                    </section>

                    <section id="features" className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
                        <SectionHeading
                            eyebrow="Coach every signal"
                            title="Everything you need to become a clearer speaker"
                            description="From pronunciation to executive presence, each practice round becomes a focused improvement plan."
                        />
                        <div className="mx-auto mt-12 grid max-w-7xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {features.map((feature) => (
                                <FeatureCard key={feature.title} {...feature} />
                            ))}
                        </div>
                    </section>

                    <section className="mx-auto grid max-w-7xl gap-5 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-3 lg:px-8">
                        {[
                            'Record or upload your speech',
                            'AI analyzes your speaking patterns',
                            'Receive actionable improvement insights',
                        ].map((step, index) => (
                            <GlassCard key={step} className="p-6" glow>
                                <span className="text-sm font-semibold text-cyan-200">
                                    Step {index + 1}
                                </span>
                                <h3 className="mt-4 text-xl font-semibold">
                                    {step}
                                </h3>
                                <p className="mt-3 text-sm leading-6 text-slate-300">
                                    Practice in a guided flow that turns raw
                                    speaking data into next-step coaching.
                                </p>
                            </GlassCard>
                        ))}
                    </section>

                    <section className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:px-8">
                        <SectionHeading
                            align="left"
                            eyebrow="Analytics preview"
                            title="A speaking dashboard that tells you what to fix next"
                            description="Your coaching view brings confidence, speed, filler words, pronunciation, tone, and recommendations into one clean workspace."
                        />
                        <GlassCard className="min-w-0 p-5" glow>
                            <div className="grid gap-4 sm:grid-cols-2">
                                {[
                                    ['Confidence score', '88%'],
                                    ['Speaking speed', '137 wpm'],
                                    ['Filler word count', '6'],
                                    ['Pronunciation score', '93%'],
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
                            <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <p className="font-semibold">Progress chart</p>
                                    <span className="text-sm text-cyan-200">
                                        +18% this month
                                    </span>
                                </div>
                                <ProgressChartMock />
                            </div>
                        </GlassCard>
                    </section>

                    <section id="modes" className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
                        <SectionHeading
                            eyebrow="Practice modes"
                            title="Train for the exact room you need to walk into"
                            description="Choose a scenario, speak naturally, and let the AI coach adapt the feedback to your goal."
                        />
                        <div className="mx-auto mt-12 grid max-w-7xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {practiceModes.map((mode) => (
                                <PracticeModeCard key={mode.title} {...mode} />
                            ))}
                        </div>
                    </section>

                    <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
                        <SectionHeading
                            eyebrow="Loved by practice-first teams"
                            title="Speakers use SpeakAI Coach to show up prepared"
                        />
                        <div className="mx-auto mt-12 grid max-w-7xl gap-4 md:grid-cols-3">
                            {testimonials.map((testimonial) => (
                                <GlassCard key={testimonial.name} className="p-6">
                                    <p className="text-sm leading-7 text-slate-200">
                                        "{testimonial.quote}"
                                    </p>
                                    <div className="mt-6 flex items-center gap-3">
                                        <div className="flex size-10 items-center justify-center rounded-full bg-linear-to-br from-cyan-300 to-violet-500 text-sm font-semibold text-slate-950">
                                            {testimonial.name
                                                .split(' ')
                                                .map((part) => part[0])
                                                .join('')}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold">
                                                {testimonial.name}
                                            </p>
                                            <p className="text-xs text-slate-400">
                                                {testimonial.role}
                                            </p>
                                        </div>
                                    </div>
                                </GlassCard>
                            ))}
                        </div>
                    </section>

                    <section id="pricing" className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
                        <SectionHeading
                            eyebrow="Pricing"
                            title="Start free, scale when practice becomes a habit"
                        />
                        <div className="mx-auto mt-12 grid max-w-6xl gap-4 lg:grid-cols-3">
                            {pricing.map((plan) => (
                                <PricingCard key={plan.name} {...plan} />
                            ))}
                        </div>
                    </section>

                    <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
                        <GlassCard className="p-6 text-center sm:p-12" glow>
                            <h2 className="text-2xl font-semibold sm:text-4xl">
                                Build a voice people remember
                            </h2>
                            <p className="mx-auto mt-4 max-w-2xl text-slate-300">
                                Get a weekly practice plan, AI coaching notes,
                                and confidence-building drills in your inbox.
                            </p>
                            <form className="mx-auto mt-8 flex max-w-xl flex-col gap-3 sm:flex-row">
                                <label htmlFor="cta-email" className="sr-only">
                                    Email address
                                </label>
                                <input
                                    id="cta-email"
                                    type="email"
                                    placeholder="you@example.com"
                                    className="min-h-12 flex-1 rounded-full border border-white/10 bg-white/8 px-5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/30"
                                />
                                <GradientButton
                                    type="submit"
                                    className="w-full sm:w-auto"
                                >
                                    Join waitlist
                                </GradientButton>
                            </form>
                        </GlassCard>
                    </section>

                    <footer className="border-t border-white/10 px-4 py-12 sm:px-6 lg:px-8">
                        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[minmax(0,1.2fr)_minmax(0,2fr)_minmax(0,1fr)]">
                            <div>
                                <div className="flex items-center gap-3">
                                    <span className="flex size-9 items-center justify-center rounded-2xl bg-cyan-300 text-slate-950">
                                        <Mic2 className="size-5" />
                                    </span>
                                    <span className="font-semibold">
                                        SpeakAI Coach
                                    </span>
                                </div>
                                <p className="mt-4 text-sm leading-6 text-slate-400">
                                    AI speaking practice for presentations,
                                    interviews, and confident conversations.
                                </p>
                            </div>
                            <div className="grid gap-6 sm:grid-cols-3">
                                {[
                                    ['Product', 'Features', 'Practice modes', 'Pricing'],
                                    ['Company', 'About', 'Customers', 'Contact'],
                                    ['Legal', 'Privacy', 'Terms', 'Security'],
                                ].map(([heading, ...links]) => (
                                    <div key={heading}>
                                        <h3 className="text-sm font-semibold">
                                            {heading}
                                        </h3>
                                        <ul className="mt-4 flex flex-col gap-3 text-sm text-slate-400">
                                            {links.map((link) => (
                                                <li key={link}>
                                                    <a
                                                        href="#"
                                                        className="hover:text-white"
                                                    >
                                                        {link}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                            <form className="flex flex-col gap-3">
                                <label
                                    htmlFor="footer-email"
                                    className="text-sm font-semibold"
                                >
                                    Newsletter
                                </label>
                                <input
                                    id="footer-email"
                                    type="email"
                                    placeholder="Email address"
                                    className="min-h-11 rounded-full border border-white/10 bg-white/8 px-4 text-sm outline-none placeholder:text-slate-500 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/30"
                                />
                            </form>
                        </div>
                    </footer>
                </div>
            </main>
        </>
    );
}
