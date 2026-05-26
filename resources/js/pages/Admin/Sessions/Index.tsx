import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, FileText } from 'lucide-react';

import {
    index as adminDashboard,
    sessions as adminSessions,
} from '@/actions/App/Http/Controllers/AdminDashboardController';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Paginated, PracticeSession } from '@/types';

type AdminSession = PracticeSession;

type SessionsIndexProps = {
    sessions: Paginated<AdminSession>;
};

function formatStatus(value: string | null | undefined): string {
    if (!value) {
        return 'No report';
    }

    return value
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

function statusClass(value: string | null | undefined): string {
    if (value === 'failed') {
        return 'border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-200';
    }

    if (value === 'analyzed' || value === 'completed') {
        return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200';
    }

    if (value === 'transcribing' || value === 'analyzing' || value === 'processing') {
        return 'border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-200';
    }

    if (value === 'recorded' || value === 'transcribed') {
        return 'border-cyan-500/30 bg-cyan-500/10 text-cyan-700 dark:text-cyan-200';
    }

    return 'border-border bg-muted text-muted-foreground';
}

function Pagination({ links }: { links: Paginated<AdminSession>['links'] }) {
    return (
        <nav className="mt-6 flex flex-wrap justify-center gap-2" aria-label="Sessions pagination">
            {links.map((link) => (
                <Link
                    key={`${link.label}-${link.url}`}
                    href={link.url ?? '#'}
                    preserveScroll
                    className={cn(
                        'rounded-lg border px-3 py-2 text-sm font-medium transition',
                        link.active
                            ? 'border-cyan-500 bg-cyan-500 text-white'
                            : 'border-border bg-card text-muted-foreground hover:text-foreground',
                        !link.url && 'pointer-events-none opacity-40',
                    )}
                >
                    {link.label
                        .replace('&laquo; Previous', 'Previous')
                        .replace('Next &raquo;', 'Next')}
                </Link>
            ))}
        </nav>
    );
}

export default function Index({ sessions }: SessionsIndexProps) {
    return (
        <>
            <Head title="Admin sessions" />

            <div className="min-h-full bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        <div>
                            <Link
                                href={adminDashboard()}
                                className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
                            >
                                <ArrowLeft className="size-4" />
                                Admin dashboard
                            </Link>
                            <h1 className="mt-4 text-3xl font-semibold tracking-normal sm:text-4xl">
                                Practice sessions
                            </h1>
                            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                                Review session processing status and feedback
                                report state across the product.
                            </p>
                        </div>
                        <Button asChild>
                            <Link href={adminSessions()}>
                                <FileText className="size-4" />
                                Refresh sessions
                            </Link>
                        </Button>
                    </div>

                    <section className="mt-8 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-4xl text-left text-sm">
                                <thead className="bg-muted/50 text-xs text-muted-foreground">
                                    <tr>
                                        <th className="px-5 py-3 font-medium">User</th>
                                        <th className="px-5 py-3 font-medium">Session</th>
                                        <th className="px-5 py-3 font-medium">Status</th>
                                        <th className="px-5 py-3 font-medium">Created</th>
                                        <th className="px-5 py-3 font-medium">Report status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sessions.data.map((session) => (
                                        <tr
                                            key={session.id}
                                            className="border-t border-border"
                                        >
                                            <td className="px-5 py-4">
                                                <div className="font-medium">
                                                    {session.user?.name ?? 'Unknown'}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {session.user?.email ?? 'No email'}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 font-medium">
                                                {session.title}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span
                                                    className={cn(
                                                        'rounded-full border px-3 py-1 text-xs font-semibold',
                                                        statusClass(session.status),
                                                    )}
                                                >
                                                    {formatStatus(session.status)}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-muted-foreground">
                                                {new Date(
                                                    session.created_at,
                                                ).toLocaleDateString()}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span
                                                    className={cn(
                                                        'rounded-full border px-3 py-1 text-xs font-semibold',
                                                        statusClass(
                                                            session.feedback_report
                                                                ?.status,
                                                        ),
                                                    )}
                                                >
                                                    {formatStatus(
                                                        session.feedback_report?.status,
                                                    )}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {sessions.last_page > 1 && <Pagination links={sessions.links} />}
                </div>
            </div>
        </>
    );
}

Index.layout = {
    breadcrumbs: [
        {
            title: 'Admin',
            href: adminDashboard(),
        },
        {
            title: 'Sessions',
            href: adminSessions(),
        },
    ],
};
