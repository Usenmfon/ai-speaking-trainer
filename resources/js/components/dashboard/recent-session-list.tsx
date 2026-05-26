import { Link } from '@inertiajs/react';
import { Clock3, Mic2 } from 'lucide-react';

import { show } from '@/actions/App/Http/Controllers/PracticeSessionController';
import type { PracticeSession } from '@/types';

type RecentSessionListProps = {
    sessions: PracticeSession[];
};

function formatDate(value: string): string {
    return new Date(value).toLocaleDateString();
}

function formatStatus(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
}

export function RecentSessionList({ sessions }: RecentSessionListProps) {
    return (
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h2 className="text-lg font-semibold">Recent sessions</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Your latest practice work.
                    </p>
                </div>
                <Mic2 className="size-5 text-cyan-700 dark:text-cyan-200" />
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
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="font-medium">
                                        {session.title}
                                    </p>
                                    <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                                        {session.topic}
                                    </p>
                                </div>
                                <span className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">
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
