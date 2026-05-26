import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Lightbulb, Mic2 } from 'lucide-react';
import type { FormEvent } from 'react';
import {
    create,
    index,
    store,
} from '@/actions/App/Http/Controllers/PracticeSessionController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { PracticeSessionType } from '@/types';

type DurationOption = {
    label: string;
    value: number;
};

type CreateProps = {
    sessionTypes: PracticeSessionType[];
    topicSuggestions: string[];
    durations: DurationOption[];
};

type PracticeSessionForm = {
    title: string;
    topic: string;
    session_type: PracticeSessionType | '';
    target_duration_seconds: number;
    objective: string;
};

function formatOption(value: string): string {
    return value
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

export default function Create({
    sessionTypes,
    topicSuggestions,
    durations,
}: CreateProps) {
    const form = useForm<PracticeSessionForm>({
        title: '',
        topic: '',
        session_type: 'presentation',
        target_duration_seconds: durations[2]?.value ?? 300,
        objective: '',
    });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.submit(store());
    }

    return (
        <>
            <Head title="Create practice session" />

            <div className="min-h-full bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
                <div className="mx-auto max-w-6xl">
                    <Link
                        href={index()}
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
                    >
                        <ArrowLeft className="size-4" />
                        Back to sessions
                    </Link>

                    <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.7fr]">
                        <form
                            onSubmit={submit}
                            className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6"
                        >
                            <p className="flex items-center gap-2 text-sm font-semibold text-cyan-700 dark:text-cyan-200">
                                <Mic2 className="size-4" />
                                Session setup
                            </p>
                            <h1 className="mt-3 text-3xl font-semibold tracking-normal">
                                Create a practice session
                            </h1>
                            <p className="mt-3 text-sm leading-6 text-muted-foreground">
                                Define what you want to practice. The session is
                                saved as a draft until recording and analysis
                                are added.
                            </p>

                            <div className="mt-8 grid gap-5">
                                <div className="grid gap-2">
                                    <Label htmlFor="title">Title</Label>
                                    <Input
                                        id="title"
                                        value={form.data.title}
                                        onChange={(event) =>
                                            form.setData(
                                                'title',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Investor pitch rehearsal"
                                        aria-invalid={Boolean(
                                            form.errors.title,
                                        )}
                                    />
                                    <InputError message={form.errors.title} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="topic">Topic</Label>
                                    <Input
                                        id="topic"
                                        value={form.data.topic}
                                        onChange={(event) =>
                                            form.setData(
                                                'topic',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Pitch an AI tool to a skeptical executive team"
                                        aria-invalid={Boolean(
                                            form.errors.topic,
                                        )}
                                    />
                                    <InputError message={form.errors.topic} />
                                </div>

                                <div className="grid gap-5 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="session_type">
                                            Session type
                                        </Label>
                                        <select
                                            id="session_type"
                                            value={form.data.session_type}
                                            onChange={(event) =>
                                                form.setData(
                                                    'session_type',
                                                    event.target
                                                        .value as PracticeSessionType,
                                                )
                                            }
                                            className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                                            aria-invalid={Boolean(
                                                form.errors.session_type,
                                            )}
                                        >
                                            {sessionTypes.map((type) => (
                                                <option key={type} value={type}>
                                                    {formatOption(type)}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError
                                            message={form.errors.session_type}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="target_duration_seconds">
                                            Target duration
                                        </Label>
                                        <select
                                            id="target_duration_seconds"
                                            value={
                                                form.data
                                                    .target_duration_seconds
                                            }
                                            onChange={(event) =>
                                                form.setData(
                                                    'target_duration_seconds',
                                                    Number(event.target.value),
                                                )
                                            }
                                            className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                                            aria-invalid={Boolean(
                                                form.errors
                                                    .target_duration_seconds,
                                            )}
                                        >
                                            {durations.map((duration) => (
                                                <option
                                                    key={duration.value}
                                                    value={duration.value}
                                                >
                                                    {duration.label}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError
                                            message={
                                                form.errors
                                                    .target_duration_seconds
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="objective">Objective</Label>
                                    <textarea
                                        id="objective"
                                        value={form.data.objective}
                                        onChange={(event) =>
                                            form.setData(
                                                'objective',
                                                event.target.value,
                                            )
                                        }
                                        rows={5}
                                        maxLength={2000}
                                        placeholder="What should the AI coach pay attention to?"
                                        className="border-input bg-background ring-offset-background focus-visible:ring-ring min-h-28 w-full rounded-md border px-3 py-2 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-offset-2"
                                        aria-invalid={Boolean(
                                            form.errors.objective,
                                        )}
                                    />
                                    <div className="flex items-center justify-between gap-4">
                                        <InputError
                                            message={form.errors.objective}
                                        />
                                        <p className="ml-auto text-xs text-muted-foreground">
                                            {form.data.objective.length}/2000
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
                                    {form.processing
                                        ? 'Saving...'
                                        : 'Save draft'}
                                </Button>
                                <Button asChild variant="outline">
                                    <Link href={index()}>Cancel</Link>
                                </Button>
                            </div>
                        </form>

                        <aside className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
                            <p className="flex items-center gap-2 text-sm font-semibold text-cyan-700 dark:text-cyan-200">
                                <Lightbulb className="size-4" />
                                Topic suggestions
                            </p>
                            <p className="mt-3 text-sm leading-6 text-muted-foreground">
                                Choose one to quickly fill your topic field, or
                                write your own.
                            </p>

                            <div className="mt-6 grid gap-3">
                                {topicSuggestions.map((suggestion) => {
                                    const isSelected =
                                        form.data.topic === suggestion;

                                    return (
                                        <button
                                            key={suggestion}
                                            type="button"
                                            onClick={() =>
                                                form.setData(
                                                    'topic',
                                                    suggestion,
                                                )
                                            }
                                            className={cn(
                                                'rounded-xl border p-4 text-left text-sm leading-6 transition hover:border-cyan-500/40 hover:bg-cyan-500/5 focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:outline-none',
                                                isSelected
                                                    ? 'border-cyan-500/50 bg-cyan-500/10'
                                                    : 'border-border bg-background',
                                            )}
                                        >
                                            {suggestion}
                                        </button>
                                    );
                                })}
                            </div>
                        </aside>
                    </div>
                </div>
            </div>
        </>
    );
}

Create.layout = {
    breadcrumbs: [
        {
            title: 'Practice sessions',
            href: index(),
        },
        {
            title: 'Create',
            href: create(),
        },
    ],
};
