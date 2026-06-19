import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Gift, UserPlus } from 'lucide-react';

import { index as adminDashboard } from '@/actions/App/Http/Controllers/AdminDashboardController';
import { index as adminReferrals } from '@/actions/App/Http/Controllers/AdminReferralController';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Paginated, User } from '@/types';

type AdminReferral = {
    id: number;
    referrer_id: number;
    referred_user_id: number | null;
    referral_code: string;
    status: string;
    registered_at: string | null;
    created_at: string;
    referrer: Pick<User, 'id' | 'name' | 'email' | 'referral_code'>;
    referred_user: Pick<User, 'id' | 'name' | 'email' | 'created_at'> | null;
};

type ReferralsIndexProps = {
    referrals: Paginated<AdminReferral>;
};

function formatStatus(value: string): string {
    return value
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

function statusClass(value: string): string {
    if (value === 'registered') {
        return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200';
    }

    if (value === 'pending') {
        return 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-200';
    }

    return 'border-border bg-muted text-muted-foreground';
}

function formatDate(value: string | null): string {
    if (!value) {
        return 'Not available';
    }

    return new Date(value).toLocaleDateString();
}

function Pagination({ links }: { links: Paginated<AdminReferral>['links'] }) {
    return (
        <nav
            className="mt-6 flex flex-wrap justify-center gap-2"
            aria-label="Referrals pagination"
        >
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

export default function Index({ referrals }: ReferralsIndexProps) {
    return (
        <>
            <Head title="Admin referrals" />

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
                                Referrals
                            </h1>
                            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                                Review who shared TWAC and which users joined
                                from referral links.
                            </p>
                        </div>
                        <Button asChild>
                            <Link href={adminReferrals()}>
                                <Gift className="size-4" />
                                Refresh referrals
                            </Link>
                        </Button>
                    </div>

                    <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                            <p className="text-sm text-muted-foreground">
                                Total tracked referrals
                            </p>
                            <p className="mt-2 text-3xl font-semibold">
                                {referrals.total}
                            </p>
                        </div>
                        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                            <p className="text-sm text-muted-foreground">
                                Showing on this page
                            </p>
                            <p className="mt-2 text-3xl font-semibold">
                                {referrals.data.length}
                            </p>
                        </div>
                        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:col-span-2 xl:col-span-1">
                            <p className="text-sm text-muted-foreground">
                                Referral status
                            </p>
                            <p className="mt-2 text-lg font-semibold">
                                Tracking registered signups
                            </p>
                        </div>
                    </section>

                    <section className="mt-6 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                        {referrals.data.length === 0 ? (
                            <div className="p-8 text-center">
                                <UserPlus className="mx-auto size-10 text-cyan-700 dark:text-cyan-200" />
                                <h2 className="mt-4 text-xl font-semibold">
                                    No referrals yet
                                </h2>
                                <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                                    Referral signups will appear here once users
                                    start sharing their invite links.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-5xl text-left text-sm">
                                    <thead className="bg-muted/50 text-xs text-muted-foreground">
                                        <tr>
                                            <th className="px-5 py-3 font-medium">
                                                Referrer
                                            </th>
                                            <th className="px-5 py-3 font-medium">
                                                Referred user
                                            </th>
                                            <th className="px-5 py-3 font-medium">
                                                Code
                                            </th>
                                            <th className="px-5 py-3 font-medium">
                                                Status
                                            </th>
                                            <th className="px-5 py-3 font-medium">
                                                Registered
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {referrals.data.map((referral) => (
                                            <tr
                                                key={referral.id}
                                                className="border-t border-border"
                                            >
                                                <td className="px-5 py-4">
                                                    <div className="font-medium">
                                                        {referral.referrer.name}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {
                                                            referral.referrer
                                                                .email
                                                        }
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="font-medium">
                                                        {referral.referred_user
                                                            ?.name ?? 'Unknown'}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {referral.referred_user
                                                            ?.email ??
                                                            'No account linked'}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className="rounded-lg border border-border bg-background px-3 py-1 font-mono text-xs">
                                                        {referral.referral_code}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span
                                                        className={cn(
                                                            'rounded-full border px-3 py-1 text-xs font-semibold',
                                                            statusClass(
                                                                referral.status,
                                                            ),
                                                        )}
                                                    >
                                                        {formatStatus(
                                                            referral.status,
                                                        )}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 text-muted-foreground">
                                                    {formatDate(
                                                        referral.registered_at,
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>

                    {referrals.last_page > 1 && (
                        <Pagination links={referrals.links} />
                    )}
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
            title: 'Referrals',
            href: adminReferrals(),
        },
    ],
};
