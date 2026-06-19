import { Link } from '@inertiajs/react';
import { Clock3, Mic2 } from 'lucide-react';

import {
    index,
    show,
} from '@/actions/App/Http/Controllers/PracticeSessionController';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { PracticeSession } from '@/types';

type RecentSessionListProps = {
    sessions: PracticeSession[];
};

function formatDate(value: string): string {
    return new Date(value).toLocaleDateString();
}

function formatStatus(status: string): string {
    return status
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

function statusClass(status: PracticeSession['status']): string {
    if (status === 'failed') {
        return 'border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-200';
    }

    if (status === 'analyzed') {
        return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200';
    }

    if (status === 'transcribing' || status === 'analyzing') {
        return 'border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-200';
    }

    if (status === 'recorded' || status === 'transcribed') {
        return 'border-cyan-500/30 bg-cyan-500/10 text-cyan-700 dark:text-cyan-200';
    }

    return 'border-border text-muted-foreground';
}

export function RecentSessionList({ sessions }: RecentSessionListProps) {
    return (
        <section className="min-w-0 rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                    <h2 className="text-lg font-semibold">Recent sessions</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Your latest practice work.
                    </p>
                </div>
                <Button asChild size="sm" variant="outline">
                    <Link href={index()}>
                        <Mic2 className="size-4" />
                        View all
                    </Link>
                </Button>
            </div>

            <div className="mt-5 flex flex-col gap-3">
                {sessions.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-border bg-background p-4 text-sm text-muted-foreground">
                        No sessions yet. Start a short practice to begin
                        building your history.
                    </p>
                ) : (
                    sessions.map((session) => (
                        <Link
                            key={session.id}
                            href={show(session.id)}
                            className="rounded-xl border border-border bg-background p-4 transition hover:border-cyan-400/50 hover:bg-accent"
                        >
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div className="min-w-0">
                                    <p className="font-medium break-words">
                                        {session.title}
                                    </p>
                                    <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                                        {session.topic}
                                    </p>
                                </div>
                                <span
                                    className={cn(
                                        'w-fit rounded-full border px-2.5 py-1 text-xs',
                                        statusClass(session.status),
                                    )}
                                >
                                    {formatStatus(session.status)}
                                </span>
                            </div>
                            <p className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock3 className="size-4" />
                                {formatDate(session.created_at)}
                            </p>
                        </Link>
                    ))
                )}
            </div>
        </section>
    );
}
