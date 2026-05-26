import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    BarChart3,
    CheckCircle2,
    FileText,
    ShieldCheck,
    Users,
} from 'lucide-react';

import {
    index as adminDashboard,
    sessions as adminSessions,
    users as adminUsers,
} from '@/actions/App/Http/Controllers/AdminDashboardController';
import { StatCard } from '@/components/dashboard/stat-card';
import { Button } from '@/components/ui/button';
import type { PracticeSession } from '@/types';

type AdminStats = {
    totalUsers: number;
    totalPracticeSessions: number;
    completedSessions: number;
    failedTranscriptions: number;
    failedAnalyses: number;
};

type DashboardProps = {
    stats: AdminStats;
    recentSessions: PracticeSession[];
};

function formatStatus(value: string | null | undefined): string {
    if (!value) {
        return 'No report';
    }

    return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function Dashboard({ stats, recentSessions }: DashboardProps) {
    return (
        <>
            <Head title="Admin dashboard" />

            <div className="min-h-full bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
                <div className="mx-auto flex max-w-7xl flex-col gap-6">
                    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-8">
                        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                            <div>
                                <p className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-700 dark:text-cyan-200">
                                    <ShieldCheck className="size-4" />
                                    Admin overview
                                </p>
                                <h1 className="mt-3 text-3xl font-semibold tracking-normal sm:text-4xl">
                                    Speaking coach operations
                                </h1>
                                <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
                                    Monitor users, practice volume, and failed AI
                                    processing states without changing customer
                                    data.
                                </p>
                            </div>

                            <div className="flex flex-col gap-2 sm:flex-row">
                                <Button asChild variant="outline">
                                    <Link href={adminUsers()}>
                                        <Users className="size-4" />
                                        Users
                                    </Link>
                                </Button>
                                <Button asChild>
                                    <Link href={adminSessions()}>
                                        <FileText className="size-4" />
                                        Sessions
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </section>

                    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                        <StatCard
                            icon={Users}
                            label="Total users"
                            value={`${stats.totalUsers}`}
                            helper="All registered accounts."
                        />
                        <StatCard
                            icon={FileText}
                            label="Practice sessions"
                            value={`${stats.totalPracticeSessions}`}
                            helper="Draft, recorded, analyzed, and failed sessions."
                        />
                        <StatCard
                            icon={CheckCircle2}
                            label="Completed sessions"
                            value={`${stats.completedSessions}`}
                            helper="Recorded or analyzed sessions."
                        />
                        <StatCard
                            icon={AlertTriangle}
                            label="Failed transcriptions"
                            value={`${stats.failedTranscriptions}`}
                            helper="Failed sessions with audio but no transcript."
                        />
                        <StatCard
                            icon={BarChart3}
                            label="Failed analyses"
                            value={`${stats.failedAnalyses}`}
                            helper="Feedback reports currently marked failed."
                        />
                    </section>

                    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                            <div>
                                <h2 className="text-lg font-semibold">
                                    Recent sessions
                                </h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Latest practice activity across all users.
                                </p>
                            </div>
                            <Button asChild variant="outline">
                                <Link href={adminSessions()}>View all</Link>
                            </Button>
                        </div>

                        <div className="mt-5 overflow-x-auto">
                            <table className="w-full min-w-3xl text-left text-sm">
                                <thead className="text-xs text-muted-foreground">
                                    <tr className="border-b border-border">
                                        <th className="py-3 pr-4 font-medium">User</th>
                                        <th className="py-3 pr-4 font-medium">Session</th>
                                        <th className="py-3 pr-4 font-medium">Status</th>
                                        <th className="py-3 pr-4 font-medium">Report</th>
                                        <th className="py-3 font-medium">Created</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentSessions.map((session) => (
                                        <tr
                                            key={session.id}
                                            className="border-b border-border/70 last:border-0"
                                        >
                                            <td className="py-3 pr-4">
                                                {session.user?.name ?? 'Unknown'}
                                            </td>
                                            <td className="py-3 pr-4 font-medium">
                                                {session.title}
                                            </td>
                                            <td className="py-3 pr-4">
                                                {formatStatus(session.status)}
                                            </td>
                                            <td className="py-3 pr-4">
                                                {formatStatus(
                                                    session.feedback_report?.status,
                                                )}
                                            </td>
                                            <td className="py-3 text-muted-foreground">
                                                {new Date(
                                                    session.created_at,
                                                ).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Admin',
            href: adminDashboard(),
        },
    ],
};
