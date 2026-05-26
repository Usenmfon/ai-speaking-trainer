import { useForm } from '@inertiajs/react';
import { CheckCircle2, Sparkles } from 'lucide-react';
import type { FormEvent } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { MainGoal, SpeakingLevel, UserProfile } from '@/types';
import type { RouteDefinition } from '@/wayfinder';

type UserProfileFormData = {
    full_name: string;
    speaking_level: SpeakingLevel | '';
    main_goal: MainGoal | '';
    preferred_language: string;
    bio: string;
};

type UserProfileFormProps = {
    profile?: UserProfile | null;
    speakingLevels: SpeakingLevel[];
    mainGoals: MainGoal[];
    submitAction: RouteDefinition<'post' | 'patch'>;
    submitLabel: string;
    intro: string;
};

const goalDescriptions: Record<MainGoal, string> = {
    public_speaking: 'Confident talks, panels, and stage delivery.',
    interviews: 'Sharper answers for career and academic interviews.',
    presentations: 'Clearer updates, demos, and slide-based rehearsals.',
    storytelling: 'More memorable narratives and stronger structure.',
    confidence: 'Calmer delivery with more presence and control.',
    pronunciation: 'Cleaner articulation, fluency, and word clarity.',
};

function formatOption(value: string): string {
    return value
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

export function UserProfileForm({
    profile,
    speakingLevels,
    mainGoals,
    submitAction,
    submitLabel,
    intro,
}: UserProfileFormProps) {
    const form = useForm<UserProfileFormData>({
        full_name: profile?.full_name ?? '',
        speaking_level: profile?.speaking_level ?? '',
        main_goal: profile?.main_goal ?? '',
        preferred_language: profile?.preferred_language ?? 'English',
        bio: profile?.bio ?? '',
    });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        form.submit(submitAction, {
            preserveScroll: true,
        });
    }

    return (
        <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_0.72fr]">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
                <div className="mb-6">
                    <p className="flex items-center gap-2 text-sm font-semibold text-cyan-700 dark:text-cyan-200">
                        <Sparkles className="size-4" />
                        Speaking profile
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {intro}
                    </p>
                </div>

                <div className="grid gap-5">
                    <div className="grid gap-2">
                        <Label htmlFor="full_name">Full name</Label>
                        <Input
                            id="full_name"
                            value={form.data.full_name}
                            onChange={(event) =>
                                form.setData('full_name', event.target.value)
                            }
                            autoComplete="name"
                            placeholder="Ada Lovelace"
                            aria-invalid={Boolean(form.errors.full_name)}
                        />
                        <InputError message={form.errors.full_name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="speaking_level">Speaking level</Label>
                        <select
                            id="speaking_level"
                            value={form.data.speaking_level}
                            onChange={(event) =>
                                form.setData(
                                    'speaking_level',
                                    event.target.value as SpeakingLevel,
                                )
                            }
                            className={cn(
                                'border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                                !form.data.speaking_level &&
                                    'text-muted-foreground',
                            )}
                            aria-invalid={Boolean(form.errors.speaking_level)}
                        >
                            <option value="">Choose your current level</option>
                            {speakingLevels.map((level) => (
                                <option key={level} value={level}>
                                    {formatOption(level)}
                                </option>
                            ))}
                        </select>
                        <InputError message={form.errors.speaking_level} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="main_goal">Main goal</Label>
                        <select
                            id="main_goal"
                            value={form.data.main_goal}
                            onChange={(event) =>
                                form.setData(
                                    'main_goal',
                                    event.target.value as MainGoal,
                                )
                            }
                            className={cn(
                                'border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                                !form.data.main_goal &&
                                    'text-muted-foreground',
                            )}
                            aria-invalid={Boolean(form.errors.main_goal)}
                        >
                            <option value="">Pick your primary focus</option>
                            {mainGoals.map((goal) => (
                                <option key={goal} value={goal}>
                                    {formatOption(goal)}
                                </option>
                            ))}
                        </select>
                        <InputError message={form.errors.main_goal} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="preferred_language">
                            Preferred language
                        </Label>
                        <Input
                            id="preferred_language"
                            value={form.data.preferred_language}
                            onChange={(event) =>
                                form.setData(
                                    'preferred_language',
                                    event.target.value,
                                )
                            }
                            placeholder="English"
                            aria-invalid={Boolean(
                                form.errors.preferred_language,
                            )}
                        />
                        <InputError message={form.errors.preferred_language} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="bio">Short bio</Label>
                        <textarea
                            id="bio"
                            value={form.data.bio}
                            onChange={(event) =>
                                form.setData('bio', event.target.value)
                            }
                            rows={5}
                            maxLength={1000}
                            placeholder="Tell your AI coach what you are preparing for."
                            className="border-input bg-background ring-offset-background focus-visible:ring-ring min-h-28 w-full rounded-md border px-3 py-2 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            aria-invalid={Boolean(form.errors.bio)}
                        />
                        <div className="flex items-center justify-between gap-4">
                            <InputError message={form.errors.bio} />
                            <p className="ml-auto text-xs text-muted-foreground">
                                {form.data.bio.length}/1000
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Button
                        type="submit"
                        disabled={form.processing}
                        className="min-w-40"
                    >
                        {form.processing ? 'Saving...' : submitLabel}
                    </Button>
                    {form.recentlySuccessful && (
                        <p className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-300">
                            <CheckCircle2 className="size-4" />
                            Saved successfully
                        </p>
                    )}
                </div>
            </div>

            <aside className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
                <h2 className="text-lg font-semibold">Your coaching plan</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    These answers personalize practice prompts, session scoring,
                    and AI feedback priorities.
                </p>

                <div className="mt-6 grid gap-3">
                    {mainGoals.map((goal) => {
                        const isSelected = form.data.main_goal === goal;

                        return (
                            <button
                                key={goal}
                                type="button"
                                onClick={() => form.setData('main_goal', goal)}
                                className={cn(
                                    'rounded-xl border p-4 text-left transition hover:border-cyan-500/40 hover:bg-cyan-500/5 focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:outline-none',
                                    isSelected
                                        ? 'border-cyan-500/50 bg-cyan-500/10'
                                        : 'border-border bg-background',
                                )}
                            >
                                <p className="text-sm font-semibold">
                                    {formatOption(goal)}
                                </p>
                                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                    {goalDescriptions[goal]}
                                </p>
                            </button>
                        );
                    })}
                </div>
            </aside>
        </form>
    );
}
