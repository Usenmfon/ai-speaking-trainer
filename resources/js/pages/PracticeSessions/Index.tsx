import { Head, Link } from '@inertiajs/react';
import { CalendarDays, FilePlus2, Mic2, Timer } from 'lucide-react';
import { create, index, show } from '@/actions/App/Http/Controllers/PracticeSessionController';
import { Button } from '@/components/ui/button';
import type { PracticeSession } from '@/types';

type IndexProps = {
    sessions: PracticeSession[];
};

function formatOption(value: string): string {
    return value
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

function formatDuration(seconds: number): string {
    const minutes = Math.round(seconds / 60);

    return `${minutes} min`;
}

export default function Index({ sessions }: IndexProps) {
    return (
        <>
            <Head title="Practice sessions" />

            <div className="min-h-full bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        <div>
                            <p className="text-sm font-semibold text-cyan-700 dark:text-cyan-200">
                                Practice history
                            </p>
                            <h1 className="mt-3 text-3xl font-semibold tracking-normal sm:text-4xl">
                                Practice sessions
                            </h1>
                            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                                Review your drafts and recorded sessions, then
                                set up the next rep for your AI speaking coach.
                            </p>
                        </div>

                        <Button asChild>
                            <Link href={create()}>
                                <FilePlus2 className="size-4" />
                                New session
                            </Link>
                        </Button>
                    </div>

                    {sessions.length === 0 ? (
                        <div className="mt-10 rounded-2xl border border-dashed border-border bg-card p-10 text-center shadow-sm">
                            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-700 dark:text-cyan-200">
                                <Mic2 className="size-7" />
                            </div>
                            <h2 className="mt-5 text-xl font-semibold">
                                No practice sessions yet
                            </h2>
                            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
                                Create your first draft session with a topic,
                                duration, and objective before recording.
                            </p>
                            <Button asChild className="mt-6">
                                <Link href={create()}>Create first session</Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {sessions.map((session) => (
                                <Link
                                    key={session.id}
                                    href={show(session.id)}
                                    className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-500/40 hover:shadow-md focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:outline-none"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="min-w-0">
                                            <h2 className="truncate text-lg font-semibold">
                                                {session.title}
                                            </h2>
                                            <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                                                {session.topic}
                                            </p>
                                        </div>
                                        <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-700 dark:text-cyan-200">
                                            {formatOption(session.status)}
                                        </span>
                                    </div>

                                    <div className="mt-5 flex flex-wrap gap-3 text-xs text-muted-foreground">
                                        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1">
                                            <Mic2 className="size-3" />
                                            {formatOption(session.session_type)}
                                        </span>
                                        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1">
                                            <Timer className="size-3" />
                                            {formatDuration(
                                                session.target_duration_seconds,
                                            )}
                                        </span>
                                        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1">
                                            <CalendarDays className="size-3" />
                                            {new Date(
                                                session.created_at,
                                            ).toLocaleDateString()}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

Index.layout = {
    breadcrumbs: [
        {
            title: 'Practice sessions',
            href: index(),
        },
    ],
};
