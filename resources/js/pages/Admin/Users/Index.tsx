import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCircle2,
    CircleDashed,
    Gift,
    Plus,
    ShieldCheck,
    Trash2,
    Users,
} from 'lucide-react';
import { useState } from 'react';

import {
    destroy as destroyAdminUser,
    index as adminDashboard,
    users as adminUsers,
} from '@/actions/App/Http/Controllers/AdminDashboardController';
import { store as storePracticeSessionCredit } from '@/actions/App/Http/Controllers/AdminPracticeSessionCreditController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
        <nav
            className="mt-6 flex flex-wrap justify-center gap-2"
            aria-label="Users pagination"
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

export default function Index({ users }: UsersIndexProps) {
    const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
    const [userToGrantCredits, setUserToGrantCredits] =
        useState<AdminUser | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const creditForm = useForm({
        amount: 1,
        note: '',
    });

    function deleteUser() {
        if (!userToDelete) {
            return;
        }

        setIsDeleting(true);

        router.delete(destroyAdminUser.url(userToDelete.id), {
            preserveScroll: true,
            onSuccess: () => setUserToDelete(null),
            onFinish: () => setIsDeleting(false),
        });
    }

    function openCreditDialog(user: AdminUser): void {
        creditForm.clearErrors();
        creditForm.setData({
            amount: 1,
            note: '',
        });
        setUserToGrantCredits(user);
    }

    function grantCredits(): void {
        if (!userToGrantCredits) {
            return;
        }

        creditForm.post(storePracticeSessionCredit.url(userToGrantCredits.id), {
            preserveScroll: true,
            onSuccess: () => setUserToGrantCredits(null),
        });
    }

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
                            <table className="w-full min-w-5xl text-left text-sm">
                                <thead className="bg-muted/50 text-xs text-muted-foreground">
                                    <tr>
                                        <th className="px-5 py-3 font-medium">
                                            Name
                                        </th>
                                        <th className="px-5 py-3 font-medium">
                                            Email
                                        </th>
                                        <th className="px-5 py-3 font-medium">
                                            Profile
                                        </th>
                                        <th className="px-5 py-3 font-medium">
                                            Sessions
                                        </th>
                                        <th className="px-5 py-3 font-medium">
                                            Remaining
                                        </th>
                                        <th className="px-5 py-3 font-medium">
                                            Joined
                                        </th>
                                        <th className="px-5 py-3 font-medium">
                                            Role
                                        </th>
                                        <th className="px-5 py-3 text-right font-medium">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.data.map((user) => {
                                        const completed =
                                            user.profile
                                                ?.onboarding_completed === true;

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
                                                        {completed
                                                            ? 'Complete'
                                                            : 'Incomplete'}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4">
                                                    {
                                                        user.practice_sessions_count
                                                    }
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className="inline-flex min-w-10 justify-center rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-700 dark:text-cyan-200">
                                                        {
                                                            user.practice_sessions_remaining
                                                        }
                                                    </span>
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
                                                <td className="px-5 py-4">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            className="cursor-pointer"
                                                            onClick={() =>
                                                                openCreditDialog(
                                                                    user,
                                                                )
                                                            }
                                                        >
                                                            <Plus className="size-4" />
                                                            Add sessions
                                                        </Button>
                                                        {user.is_admin ? (
                                                            <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted-foreground">
                                                                <ShieldCheck className="size-3" />
                                                                Protected
                                                            </span>
                                                        ) : (
                                                            <Button
                                                                type="button"
                                                                variant="destructive"
                                                                size="sm"
                                                                className="cursor-pointer"
                                                                onClick={() =>
                                                                    setUserToDelete(
                                                                        user,
                                                                    )
                                                                }
                                                            >
                                                                <Trash2 className="size-4" />
                                                                Delete
                                                            </Button>
                                                        )}
                                                    </div>
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

            <Dialog
                open={userToDelete !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setUserToDelete(null);
                    }
                }}
            >
                <DialogContent>
                    <DialogTitle>Delete user account?</DialogTitle>
                    <DialogDescription>
                        This will permanently delete{' '}
                        <span className="font-medium text-foreground">
                            {userToDelete?.name}
                        </span>
                        {userToDelete?.email ? ` (${userToDelete.email})` : ''},
                        including their related practice data. This action
                        cannot be undone.
                    </DialogDescription>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button
                                type="button"
                                variant="secondary"
                                className="cursor-pointer"
                                disabled={isDeleting}
                            >
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button
                            type="button"
                            variant="destructive"
                            className="cursor-pointer"
                            disabled={isDeleting}
                            onClick={deleteUser}
                        >
                            <Trash2 className="size-4" />
                            Delete user
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog
                open={userToGrantCredits !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setUserToGrantCredits(null);
                    }
                }}
            >
                <DialogContent>
                    <DialogTitle>Add practice sessions</DialogTitle>
                    <DialogDescription>
                        Grant extra practice session credits to{' '}
                        <span className="font-medium text-foreground">
                            {userToGrantCredits?.name}
                        </span>
                        . This creates an audit entry in their credit ledger.
                    </DialogDescription>

                    <div className="grid gap-4">
                        <div className="rounded-xl border border-cyan-500/25 bg-cyan-500/10 p-4 text-sm text-cyan-900 dark:text-cyan-100">
                            <div className="flex gap-3">
                                <Gift className="mt-0.5 size-4 shrink-0" />
                                <p>
                                    Current balance:{' '}
                                    <span className="font-semibold">
                                        {
                                            userToGrantCredits?.practice_sessions_remaining
                                        }
                                    </span>
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="credit-amount">
                                Sessions to add
                            </Label>
                            <Input
                                id="credit-amount"
                                type="number"
                                min={1}
                                max={500}
                                value={creditForm.data.amount}
                                onChange={(event) =>
                                    creditForm.setData(
                                        'amount',
                                        Number(event.target.value),
                                    )
                                }
                                aria-invalid={Boolean(creditForm.errors.amount)}
                            />
                            <InputError message={creditForm.errors.amount} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="credit-note">Note</Label>
                            <Input
                                id="credit-note"
                                value={creditForm.data.note}
                                onChange={(event) =>
                                    creditForm.setData(
                                        'note',
                                        event.target.value,
                                    )
                                }
                                placeholder="Support adjustment, campaign bonus..."
                                aria-invalid={Boolean(creditForm.errors.note)}
                            />
                            <InputError message={creditForm.errors.note} />
                        </div>
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button
                                type="button"
                                variant="secondary"
                                className="cursor-pointer"
                                disabled={creditForm.processing}
                            >
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button
                            type="button"
                            className="cursor-pointer"
                            disabled={creditForm.processing}
                            onClick={grantCredits}
                        >
                            <Plus className="size-4" />
                            {creditForm.processing
                                ? 'Adding...'
                                : 'Add sessions'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
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
