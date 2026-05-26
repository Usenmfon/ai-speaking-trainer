import { Form, Head, Link, usePage } from '@inertiajs/react';
import { LockKeyhole, ShieldAlert, UserRound } from 'lucide-react';
import type { ReactNode } from 'react';
import { useRef } from 'react';

import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import SecurityController from '@/actions/App/Http/Controllers/Settings/SecurityController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { edit } from '@/routes/profile';
import { send } from '@/routes/verification';
import type { Auth, MainGoal, SpeakingLevel, UserProfile } from '@/types';

type PageProps = {
    auth: Auth;
};

type ProfileProps = {
    mustVerifyEmail: boolean;
    status?: string;
    profile: UserProfile | null;
    speakingLevels: SpeakingLevel[];
    mainGoals: MainGoal[];
    passwordRules: string;
};

function formatOption(value: string): string {
    return value
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

function NativeSelect({
    id,
    name,
    defaultValue,
    children,
}: {
    id: string;
    name: string;
    defaultValue?: string;
    children: ReactNode;
}) {
    return (
        <select
            id={id}
            name={name}
            defaultValue={defaultValue}
            className={cn(
                'border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                !defaultValue && 'text-muted-foreground',
            )}
        >
            {children}
        </select>
    );
}

export default function Profile({
    mustVerifyEmail,
    status,
    profile,
    speakingLevels,
    mainGoals,
    passwordRules,
}: ProfileProps) {
    const { auth } = usePage<PageProps>().props;
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    return (
        <>
            <Head title="Account settings" />

            <h1 className="sr-only">Account settings</h1>

            <div className="space-y-8">
                <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
                    <div className="flex items-start gap-3">
                        <div className="rounded-xl bg-cyan-500/10 p-2 text-cyan-700 dark:text-cyan-200">
                            <UserRound className="size-5" />
                        </div>
                        <Heading
                            variant="small"
                            title="Profile and speaking goals"
                            description="Update your account identity and the coaching preferences used by AI feedback."
                        />
                    </div>

                    <Form
                        {...ProfileController.update.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        className="mt-6 space-y-6"
                    >
                        {({ processing, errors, recentlySuccessful }) => (
                            <>
                                <div className="grid gap-5 md:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Name</Label>
                                        <Input
                                            id="name"
                                            defaultValue={auth.user.name}
                                            name="name"
                                            required
                                            autoComplete="name"
                                            placeholder="Full name"
                                            aria-invalid={Boolean(errors.name)}
                                        />
                                        <InputError message={errors.name} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Email address</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            defaultValue={auth.user.email}
                                            name="email"
                                            required
                                            autoComplete="username"
                                            placeholder="Email address"
                                            aria-invalid={Boolean(errors.email)}
                                        />
                                        <InputError message={errors.email} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="speaking_level">
                                            Speaking level
                                        </Label>
                                        <NativeSelect
                                            id="speaking_level"
                                            name="speaking_level"
                                            defaultValue={
                                                profile?.speaking_level ?? ''
                                            }
                                        >
                                            <option value="">
                                                Choose your current level
                                            </option>
                                            {speakingLevels.map((level) => (
                                                <option key={level} value={level}>
                                                    {formatOption(level)}
                                                </option>
                                            ))}
                                        </NativeSelect>
                                        <InputError
                                            message={errors.speaking_level}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="main_goal">
                                            Main speaking goal
                                        </Label>
                                        <NativeSelect
                                            id="main_goal"
                                            name="main_goal"
                                            defaultValue={profile?.main_goal ?? ''}
                                        >
                                            <option value="">
                                                Pick your primary focus
                                            </option>
                                            {mainGoals.map((goal) => (
                                                <option key={goal} value={goal}>
                                                    {formatOption(goal)}
                                                </option>
                                            ))}
                                        </NativeSelect>
                                        <InputError message={errors.main_goal} />
                                    </div>

                                    <div className="grid gap-2 md:col-span-2">
                                        <Label htmlFor="preferred_language">
                                            Preferred language
                                        </Label>
                                        <Input
                                            id="preferred_language"
                                            defaultValue={
                                                profile?.preferred_language ??
                                                'English'
                                            }
                                            name="preferred_language"
                                            required
                                            placeholder="English"
                                            aria-invalid={Boolean(
                                                errors.preferred_language,
                                            )}
                                        />
                                        <InputError
                                            message={errors.preferred_language}
                                        />
                                    </div>
                                </div>

                                {mustVerifyEmail &&
                                    auth.user.email_verified_at === null && (
                                        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-100">
                                            Your email address is unverified.{' '}
                                            <Link
                                                href={send()}
                                                as="button"
                                                className="font-medium underline underline-offset-4"
                                            >
                                                Resend verification email.
                                            </Link>
                                            {status ===
                                                'verification-link-sent' && (
                                                <div className="mt-2 font-medium text-emerald-700 dark:text-emerald-300">
                                                    A new verification link has
                                                    been sent.
                                                </div>
                                            )}
                                        </div>
                                    )}

                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                    <Button disabled={processing}>
                                        {processing ? 'Saving...' : 'Save settings'}
                                    </Button>
                                    {recentlySuccessful && (
                                        <p className="text-sm text-emerald-700 dark:text-emerald-300">
                                            Settings saved.
                                        </p>
                                    )}
                                </div>
                            </>
                        )}
                    </Form>
                </section>

                <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
                    <div className="flex items-start gap-3">
                        <div className="rounded-xl bg-violet-500/10 p-2 text-violet-700 dark:text-violet-200">
                            <LockKeyhole className="size-5" />
                        </div>
                        <Heading
                            variant="small"
                            title="Update password"
                            description="Use a strong password to keep your speaking coach account secure."
                        />
                    </div>

                    <Form
                        {...SecurityController.update.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        resetOnError={[
                            'password',
                            'password_confirmation',
                            'current_password',
                        ]}
                        resetOnSuccess
                        onError={(errors) => {
                            if (errors.password) {
                                passwordInput.current?.focus();
                            }

                            if (errors.current_password) {
                                currentPasswordInput.current?.focus();
                            }
                        }}
                        className="mt-6 space-y-6"
                    >
                        {({ errors, processing, recentlySuccessful }) => (
                            <>
                                <div className="grid gap-5 md:grid-cols-3">
                                    <div className="grid gap-2">
                                        <Label htmlFor="current_password">
                                            Current password
                                        </Label>
                                        <PasswordInput
                                            id="current_password"
                                            ref={currentPasswordInput}
                                            name="current_password"
                                            autoComplete="current-password"
                                            placeholder="Current password"
                                        />
                                        <InputError
                                            message={errors.current_password}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="password">
                                            New password
                                        </Label>
                                        <PasswordInput
                                            id="password"
                                            ref={passwordInput}
                                            name="password"
                                            autoComplete="new-password"
                                            placeholder="New password"
                                            passwordrules={passwordRules}
                                        />
                                        <InputError message={errors.password} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="password_confirmation">
                                            Confirm password
                                        </Label>
                                        <PasswordInput
                                            id="password_confirmation"
                                            name="password_confirmation"
                                            autoComplete="new-password"
                                            placeholder="Confirm password"
                                            passwordrules={passwordRules}
                                        />
                                        <InputError
                                            message={
                                                errors.password_confirmation
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                    <Button disabled={processing}>
                                        {processing
                                            ? 'Updating...'
                                            : 'Update password'}
                                    </Button>
                                    {recentlySuccessful && (
                                        <p className="text-sm text-emerald-700 dark:text-emerald-300">
                                            Password updated.
                                        </p>
                                    )}
                                </div>
                            </>
                        )}
                    </Form>
                </section>

                <section className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-5 text-rose-950 shadow-sm sm:p-6 dark:text-rose-100">
                    <div className="flex items-start gap-3">
                        <div className="rounded-xl bg-rose-500/15 p-2">
                            <ShieldAlert className="size-5" />
                        </div>
                        <div>
                            <Heading
                                variant="small"
                                title="Account deletion"
                                description="Permanent deletion is intentionally gated while this MVP is in active development."
                            />
                            <p className="mt-3 text-sm leading-6 text-rose-900/80 dark:text-rose-100/80">
                                This placeholder keeps the account danger zone
                                visible without exposing an accidental data-loss
                                path in the MVP interface.
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}

Profile.layout = {
    breadcrumbs: [
        {
            title: 'Account settings',
            href: edit(),
        },
    ],
};
