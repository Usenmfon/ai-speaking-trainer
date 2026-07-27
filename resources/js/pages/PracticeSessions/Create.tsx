import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowRight,
    ArrowLeft,
    Briefcase,
    ClipboardList,
    Gift,
    Lightbulb,
    Mic2,
} from 'lucide-react';
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
import type {
    InterviewQuestionType,
    PracticeSessionType,
    PublicSpeakingTemplate,
} from '@/types';

type DurationOption = {
    label: string;
    value: number;
};

type CreateProps = {
    sessionTypes: PracticeSessionType[];
    interviewQuestionTypes: InterviewQuestionType[];
    publicSpeakingTemplates: PublicSpeakingTemplate[];
    topicSuggestions: string[];
    durations: DurationOption[];
    practiceSessionsRemaining: number;
};

type PracticeSessionForm = {
    title: string;
    topic: string;
    session_type: PracticeSessionType | '';
    target_duration_seconds: number;
    objective: string;
    interview_role_title: string;
    interview_company: string;
    interview_stage: string;
    interview_question_type: InterviewQuestionType | '';
    interview_job_description: string;
    public_speaking_template_key: string;
    public_speaking_template_title: string;
    public_speaking_script: string;
    practice_sessions_remaining?: string;
};

function formatOption(value: string): string {
    return value
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

export default function Create({
    sessionTypes,
    interviewQuestionTypes,
    publicSpeakingTemplates,
    topicSuggestions,
    durations,
    practiceSessionsRemaining,
}: CreateProps) {
    const defaultPublicSpeakingTemplate = publicSpeakingTemplates[0] ?? null;

    const form = useForm<PracticeSessionForm>({
        title: '',
        topic: '',
        session_type: 'public_speaking',
        target_duration_seconds: durations[2]?.value ?? 300,
        objective: '',
        interview_role_title: '',
        interview_company: '',
        interview_stage: '',
        interview_question_type: 'behavioral',
        interview_job_description: '',
        public_speaking_template_key: defaultPublicSpeakingTemplate?.key ?? '',
        public_speaking_template_title:
            defaultPublicSpeakingTemplate?.title ?? '',
        public_speaking_script: defaultPublicSpeakingTemplate?.script ?? '',
    });
    const isInterview = form.data.session_type === 'interview';
    const isPublicSpeaking = form.data.session_type === 'public_speaking';

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.submit(store());
    }

    function selectPublicSpeakingTemplate(
        template: PublicSpeakingTemplate,
    ): void {
        form.setData((data) => ({
            ...data,
            public_speaking_template_key: template.key,
            public_speaking_template_title: template.title,
            public_speaking_script: template.script,
        }));
    }

    function selectSessionType(type: PracticeSessionType): void {
        const template = defaultPublicSpeakingTemplate;

        form.setData((data) => ({
            ...data,
            session_type: type,
            interview_role_title:
                type === 'interview' ? data.interview_role_title : '',
            interview_company:
                type === 'interview' ? data.interview_company : '',
            interview_stage: type === 'interview' ? data.interview_stage : '',
            interview_question_type:
                type === 'interview' ? data.interview_question_type : '',
            interview_job_description:
                type === 'interview' ? data.interview_job_description : '',
            public_speaking_template_key:
                type === 'public_speaking'
                    ? data.public_speaking_template_key || template?.key || ''
                    : '',
            public_speaking_template_title:
                type === 'public_speaking'
                    ? data.public_speaking_template_title ||
                      template?.title ||
                      ''
                    : '',
            public_speaking_script:
                type === 'public_speaking'
                    ? data.public_speaking_script || template?.script || ''
                    : '',
        }));
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
                                Define what you want to practice, then continue
                                straight to the recorder.
                            </p>
                            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-sm font-semibold text-cyan-700 dark:text-cyan-200">
                                <Gift className="size-4" />
                                {practiceSessionsRemaining}{' '}
                                {practiceSessionsRemaining === 1
                                    ? 'free session'
                                    : 'free sessions'}{' '}
                                remaining
                            </div>

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
                                        placeholder="Open a five-minute talk with a strong hook and clear promise"
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
                                                selectSessionType(
                                                    event.target
                                                        .value as PracticeSessionType,
                                                )
                                            }
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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

                                {isPublicSpeaking && (
                                    <div className="grid gap-5 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-4 sm:p-5">
                                        <div>
                                            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-200">
                                                <ClipboardList className="size-4" />
                                                Phase 1: choose a speech
                                                template
                                            </div>
                                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                                Pick a sample script to read
                                                from first. You can edit it
                                                before saving the session.
                                            </p>
                                        </div>

                                        <div className="grid gap-3 md:grid-cols-2">
                                            {publicSpeakingTemplates.map(
                                                (template) => {
                                                    const isSelected =
                                                        form.data
                                                            .public_speaking_template_key ===
                                                        template.key;

                                                    return (
                                                        <button
                                                            key={template.key}
                                                            type="button"
                                                            onClick={() =>
                                                                selectPublicSpeakingTemplate(
                                                                    template,
                                                                )
                                                            }
                                                            className={cn(
                                                                'rounded-xl border p-4 text-left transition hover:border-emerald-500/50 hover:bg-emerald-500/10 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none',
                                                                isSelected
                                                                    ? 'border-emerald-500/60 bg-emerald-500/15'
                                                                    : 'border-border bg-background',
                                                            )}
                                                        >
                                                            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-200">
                                                                {
                                                                    template.category
                                                                }
                                                            </span>
                                                            <span className="mt-2 block font-semibold">
                                                                {template.title}
                                                            </span>
                                                            <span className="mt-2 block text-sm leading-6 text-muted-foreground">
                                                                {
                                                                    template.description
                                                                }
                                                            </span>
                                                        </button>
                                                    );
                                                },
                                            )}
                                        </div>
                                        <InputError
                                            message={
                                                form.errors
                                                    .public_speaking_template_key
                                            }
                                        />

                                        <div className="grid gap-2">
                                            <Label htmlFor="public_speaking_script">
                                                Editable practice script
                                            </Label>
                                            <textarea
                                                id="public_speaking_script"
                                                value={
                                                    form.data
                                                        .public_speaking_script
                                                }
                                                onChange={(event) =>
                                                    form.setData(
                                                        'public_speaking_script',
                                                        event.target.value,
                                                    )
                                                }
                                                rows={12}
                                                maxLength={6000}
                                                placeholder="Choose a template or write the script you want to practice."
                                                className="min-h-72 w-full rounded-md border border-input bg-background px-3 py-2 text-sm leading-6 ring-offset-background transition outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                                aria-invalid={Boolean(
                                                    form.errors
                                                        .public_speaking_script,
                                                )}
                                            />
                                            <div className="flex items-center justify-between gap-4">
                                                <InputError
                                                    message={
                                                        form.errors
                                                            .public_speaking_script
                                                    }
                                                />
                                                <p className="ml-auto text-xs text-muted-foreground">
                                                    {
                                                        form.data
                                                            .public_speaking_script
                                                            .length
                                                    }
                                                    /6000
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {isInterview && (
                                    <div className="grid gap-5 rounded-2xl border border-cyan-500/25 bg-cyan-500/10 p-4 sm:p-5">
                                        <div className="flex items-center gap-2 text-sm font-semibold text-cyan-700 dark:text-cyan-200">
                                            <Briefcase className="size-4" />
                                            Interview context
                                        </div>

                                        <div className="grid gap-5 sm:grid-cols-2">
                                            <div className="grid gap-2">
                                                <Label htmlFor="interview_role_title">
                                                    Target role
                                                </Label>
                                                <Input
                                                    id="interview_role_title"
                                                    value={
                                                        form.data
                                                            .interview_role_title
                                                    }
                                                    onChange={(event) =>
                                                        form.setData(
                                                            'interview_role_title',
                                                            event.target.value,
                                                        )
                                                    }
                                                    placeholder="Senior product manager"
                                                    aria-invalid={Boolean(
                                                        form.errors
                                                            .interview_role_title,
                                                    )}
                                                />
                                                <InputError
                                                    message={
                                                        form.errors
                                                            .interview_role_title
                                                    }
                                                />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="interview_company">
                                                    Company
                                                </Label>
                                                <Input
                                                    id="interview_company"
                                                    value={
                                                        form.data
                                                            .interview_company
                                                    }
                                                    onChange={(event) =>
                                                        form.setData(
                                                            'interview_company',
                                                            event.target.value,
                                                        )
                                                    }
                                                    placeholder="Acme AI"
                                                    aria-invalid={Boolean(
                                                        form.errors
                                                            .interview_company,
                                                    )}
                                                />
                                                <InputError
                                                    message={
                                                        form.errors
                                                            .interview_company
                                                    }
                                                />
                                            </div>
                                        </div>

                                        <div className="grid gap-5 sm:grid-cols-2">
                                            <div className="grid gap-2">
                                                <Label htmlFor="interview_stage">
                                                    Interview stage
                                                </Label>
                                                <Input
                                                    id="interview_stage"
                                                    value={
                                                        form.data
                                                            .interview_stage
                                                    }
                                                    onChange={(event) =>
                                                        form.setData(
                                                            'interview_stage',
                                                            event.target.value,
                                                        )
                                                    }
                                                    placeholder="Recruiter screen"
                                                    aria-invalid={Boolean(
                                                        form.errors
                                                            .interview_stage,
                                                    )}
                                                />
                                                <InputError
                                                    message={
                                                        form.errors
                                                            .interview_stage
                                                    }
                                                />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="interview_question_type">
                                                    Question type
                                                </Label>
                                                <select
                                                    id="interview_question_type"
                                                    value={
                                                        form.data
                                                            .interview_question_type
                                                    }
                                                    onChange={(event) =>
                                                        form.setData(
                                                            'interview_question_type',
                                                            event.target
                                                                .value as InterviewQuestionType,
                                                        )
                                                    }
                                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                                    aria-invalid={Boolean(
                                                        form.errors
                                                            .interview_question_type,
                                                    )}
                                                >
                                                    {interviewQuestionTypes.map(
                                                        (type) => (
                                                            <option
                                                                key={type}
                                                                value={type}
                                                            >
                                                                {formatOption(
                                                                    type,
                                                                )}
                                                            </option>
                                                        ),
                                                    )}
                                                </select>
                                                <InputError
                                                    message={
                                                        form.errors
                                                            .interview_question_type
                                                    }
                                                />
                                            </div>
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="interview_job_description">
                                                Job description
                                            </Label>
                                            <textarea
                                                id="interview_job_description"
                                                value={
                                                    form.data
                                                        .interview_job_description
                                                }
                                                onChange={(event) =>
                                                    form.setData(
                                                        'interview_job_description',
                                                        event.target.value,
                                                    )
                                                }
                                                rows={5}
                                                maxLength={5000}
                                                placeholder="Paste the role description or key requirements."
                                                className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                                aria-invalid={Boolean(
                                                    form.errors
                                                        .interview_job_description,
                                                )}
                                            />
                                            <div className="flex items-center justify-between gap-4">
                                                <InputError
                                                    message={
                                                        form.errors
                                                            .interview_job_description
                                                    }
                                                />
                                                <p className="ml-auto text-xs text-muted-foreground">
                                                    {
                                                        form.data
                                                            .interview_job_description
                                                            .length
                                                    }
                                                    /5000
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

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
                                        placeholder={
                                            isInterview
                                                ? 'What should the AI coach pay attention to in your answer?'
                                                : 'What should the AI coach pay attention to?'
                                        }
                                        className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
                                    disabled={
                                        form.processing ||
                                        practiceSessionsRemaining < 1
                                    }
                                    className="min-w-40"
                                >
                                    {form.processing
                                        ? 'Creating...'
                                        : 'Continue to recording'}
                                    {!form.processing && (
                                        <ArrowRight className="size-4" />
                                    )}
                                </Button>
                                <Button asChild variant="outline">
                                    <Link href={index()}>Cancel</Link>
                                </Button>
                            </div>
                            <InputError
                                message={
                                    form.errors.practice_sessions_remaining
                                }
                                className="mt-3"
                            />
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
                                            <span className="flex items-start gap-2">
                                                {suggestion.startsWith(
                                                    'Answer:',
                                                ) && (
                                                    <ClipboardList className="mt-0.5 size-4 shrink-0 text-cyan-700 dark:text-cyan-200" />
                                                )}
                                                <span>{suggestion}</span>
                                            </span>
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
