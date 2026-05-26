import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, CircleDashed, ShieldCheck, Users } from 'lucide-react';

import {
    index as adminDashboard,
    users as adminUsers,
} from '@/actions/App/Http/Controllers/AdminDashboardController';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Paginated, User, UserProfile } from '@/types';

type AdminUser = User & {
    profile: Pick<UserProfile, 'onboarding_completed'> | null;
    practice_sessions_count: number;
};

type UsersIndexProps = {
    users: Paginated<AdminUser>;
};

function Pagination({ links }: { links: Paginated<AdminUser>['links'] }) {
    return (
        <nav className="mt-6 flex flex-wrap justify-center gap-2" aria-label="Users pagination">
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

export default function Index({ users }: UsersIndexProps) {
    return (
        <>
            <Head title="Admin users" />

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
                                Users
                            </h1>
                            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                                Basic account, onboarding, and session activity
                                visibility.
                            </p>
                        </div>
                        <Button asChild>
                            <Link href={adminUsers()}>
                                <Users className="size-4" />
                                Refresh users
                            </Link>
                        </Button>
                    </div>

                    <section className="mt-8 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-4xl text-left text-sm">
                                <thead className="bg-muted/50 text-xs text-muted-foreground">
                                    <tr>
                                        <th className="px-5 py-3 font-medium">Name</th>
                                        <th className="px-5 py-3 font-medium">Email</th>
                                        <th className="px-5 py-3 font-medium">Profile</th>
                                        <th className="px-5 py-3 font-medium">Sessions</th>
                                        <th className="px-5 py-3 font-medium">Joined</th>
                                        <th className="px-5 py-3 font-medium">Role</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.data.map((user) => {
                                        const completed =
                                            user.profile?.onboarding_completed === true;

                                        return (
                                            <tr
                                                key={user.id}
                                                className="border-t border-border"
                                            >
                                                <td className="px-5 py-4 font-medium">
                                                    {user.name}
                                                </td>
                                                <td className="px-5 py-4 text-muted-foreground">
                                                    {user.email}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span
                                                        className={cn(
                                                            'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold',
                                                            completed
                                                                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200'
                                                                : 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-200',
                                                        )}
                                                    >
                                                        {completed ? (
                                                            <CheckCircle2 className="size-3" />
                                                        ) : (
                                                            <CircleDashed className="size-3" />
                                                        )}
                                                        {completed ? 'Complete' : 'Incomplete'}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4">
                                                    {user.practice_sessions_count}
                                                </td>
                                                <td className="px-5 py-4 text-muted-foreground">
                                                    {new Date(
                                                        user.created_at,
                                                    ).toLocaleDateString()}
                                                </td>
                                                <td className="px-5 py-4">
                                                    {user.is_admin ? (
                                                        <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-700 dark:text-cyan-200">
                                                            <ShieldCheck className="size-3" />
                                                            Admin
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground">
                                                            User
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {users.last_page > 1 && <Pagination links={users.links} />}
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
            title: 'Users',
            href: adminUsers(),
        },
    ],
};
