import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    CalendarDays,
    FilePlus2,
    Filter,
    Mic2,
    Search,
    SlidersHorizontal,
    Timer,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { create, index, show } from '@/actions/App/Http/Controllers/PracticeSessionController';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type {
    Paginated,
    PracticeSession,
    PracticeSessionStatus,
    PracticeSessionType,
} from '@/types';

type IndexProps = {
    sessions: Paginated<PracticeSession>;
    filters: PracticeSessionFilters;
    filterOptions: {
        sessionTypes: PracticeSessionType[];
        statuses: PracticeSessionStatus[];
        sortOptions: Array<{ label: string; value: PracticeSessionSort }>;
    };
};

type PracticeSessionSort = 'newest' | 'oldest' | 'highest_score' | 'lowest_score';

type PracticeSessionFilters = {
    search: string | null;
    session_type: PracticeSessionType | null;
    status: PracticeSessionStatus | null;
    date_from: string | null;
    date_to: string | null;
    sort: PracticeSessionSort;
};

function formatOption(value: string): string {
    return value
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

function formatDuration(seconds: number): string {
    const minutes = Math.round(seconds / 60);

    return `${minutes} min`;
}

function paginationLabel(label: string): string {
    return label
        .replace('&laquo; Previous', 'Previous')
        .replace('Next &raquo;', 'Next');
}

function scoreTone(score: number | null | undefined): string {
    if (score === null || score === undefined) {
        return 'border-border bg-muted text-muted-foreground';
    }

    if (score >= 80) {
        return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200';
    }

    if (score >= 60) {
        return 'border-cyan-500/30 bg-cyan-500/10 text-cyan-700 dark:text-cyan-200';
    }

    if (score >= 40) {
        return 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-200';
    }

    return 'border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-200';
}

function statusTone(status: PracticeSessionStatus): string {
    if (status === 'failed') {
        return 'border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-200';
    }

    if (status === 'analyzed') {
        return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200';
    }

    if (status === 'transcribing' || status === 'analyzing') {
        return 'border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-200';
    }

    if (status === 'recorded' || status === 'transcribed') {
        return 'border-cyan-500/30 bg-cyan-500/10 text-cyan-700 dark:text-cyan-200';
    }

    return 'border-border bg-muted text-muted-foreground';
}

function compactFilters(filters: PracticeSessionFilters): Record<string, string> {
    return Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value !== null && value !== ''),
    ) as Record<string, string>;
}

export default function Index({ sessions, filters, filterOptions }: IndexProps) {
    const { data, setData } = useForm<PracticeSessionFilters>({
        search: filters.search ?? '',
        session_type: filters.session_type ?? null,
        status: filters.status ?? null,
        date_from: filters.date_from ?? '',
        date_to: filters.date_to ?? '',
        sort: filters.sort ?? 'newest',
    });

    const hasActiveFilters = Boolean(
        filters.search ||
            filters.session_type ||
            filters.status ||
            filters.date_from ||
            filters.date_to,
    );

    function applyFilters(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();

        router.get(index.url({ query: compactFilters(data) }), {}, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    }

    return (
        <>
            <Head title="Practice sessions" />

            <div className="min-h-full bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        <div>
                            <p className="text-sm font-semibold text-cyan-700 dark:text-cyan-200">
                                Practice history
                            </p>
                            <h1 className="mt-3 text-3xl font-semibold tracking-normal sm:text-4xl">
                                Practice sessions
                            </h1>
                            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                                Review your drafts and recorded sessions, then
                                set up the next rep for your AI speaking coach.
                            </p>
                        </div>

                        <Button asChild>
                            <Link href={create()}>
                                <FilePlus2 className="size-4" />
                                New session
                            </Link>
                        </Button>
                    </div>

                    <form
                        onSubmit={applyFilters}
                        className="mt-8 rounded-2xl border border-border bg-card p-4 shadow-sm"
                    >
                        <div className="flex items-center gap-2 text-sm font-semibold">
                            <SlidersHorizontal className="size-4 text-cyan-700 dark:text-cyan-200" />
                            Filter history
                        </div>

                        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
                            <div className="xl:col-span-2">
                                <Label htmlFor="session-search">Search</Label>
                                <div className="relative mt-2">
                                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="session-search"
                                        value={data.search ?? ''}
                                        onChange={(event) =>
                                            setData('search', event.target.value)
                                        }
                                        placeholder="Search title or topic"
                                        className="pl-9"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label>Type</Label>
                                <Select
                                    value={data.session_type ?? 'all'}
                                    onValueChange={(value) =>
                                        setData(
                                            'session_type',
                                            value === 'all'
                                                ? null
                                                : (value as PracticeSessionType),
                                        )
                                    }
                                >
                                    <SelectTrigger className="mt-2 w-full">
                                        <SelectValue placeholder="All types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All types</SelectItem>
                                        {filterOptions.sessionTypes.map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {formatOption(type)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Status</Label>
                                <Select
                                    value={data.status ?? 'all'}
                                    onValueChange={(value) =>
                                        setData(
                                            'status',
                                            value === 'all'
                                                ? null
                                                : (value as PracticeSessionStatus),
                                        )
                                    }
                                >
                                    <SelectTrigger className="mt-2 w-full">
                                        <SelectValue placeholder="All statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All statuses</SelectItem>
                                        {filterOptions.statuses.map((status) => (
                                            <SelectItem key={status} value={status}>
                                                {formatOption(status)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="date-from">From</Label>
                                <Input
                                    id="date-from"
                                    type="date"
                                    value={data.date_from ?? ''}
                                    onChange={(event) =>
                                        setData('date_from', event.target.value)
                                    }
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <Label htmlFor="date-to">To</Label>
                                <Input
                                    id="date-to"
                                    type="date"
                                    value={data.date_to ?? ''}
                                    onChange={(event) =>
                                        setData('date_to', event.target.value)
                                    }
                                    className="mt-2"
                                />
                            </div>
                        </div>

                        <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-end sm:justify-between">
                            <div className="w-full sm:max-w-xs">
                                <Label>Sort</Label>
                                <Select
                                    value={data.sort}
                                    onValueChange={(value) =>
                                        setData('sort', value as PracticeSessionSort)
                                    }
                                >
                                    <SelectTrigger className="mt-2 w-full">
                                        <SelectValue placeholder="Sort sessions" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filterOptions.sortOptions.map((option) => (
                                            <SelectItem
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex flex-col gap-2 sm:flex-row">
                                <Button type="submit">
                                    <Filter className="size-4" />
                                    Apply filters
                                </Button>
                                <Button type="button" variant="outline" asChild>
                                    <Link href={index()}>Reset</Link>
                                </Button>
                            </div>
                        </div>
                    </form>

                    {sessions.data.length === 0 ? (
                        <div className="mt-10 rounded-2xl border border-dashed border-border bg-card p-10 text-center shadow-sm">
                            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-700 dark:text-cyan-200">
                                <Mic2 className="size-7" />
                            </div>
                            <h2 className="mt-5 text-xl font-semibold">
                                {hasActiveFilters
                                    ? 'No matching sessions'
                                    : 'No practice sessions yet'}
                            </h2>
                            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
                                {hasActiveFilters
                                    ? 'Try a broader search, clear a date range, or reset the filters to view your full practice history.'
                                    : 'Create your first draft session with a topic, duration, and objective before recording.'}
                            </p>
                            {hasActiveFilters ? (
                                <Button asChild className="mt-6" variant="outline">
                                    <Link href={index()}>Reset filters</Link>
                                </Button>
                            ) : (
                                <Button asChild className="mt-6">
                                    <Link href={create()}>Create first session</Link>
                                </Button>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="mt-6 flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                                <p>
                                    Showing {sessions.from}-{sessions.to} of{' '}
                                    {sessions.total} sessions
                                </p>
                                <p>Page {sessions.current_page} of {sessions.last_page}</p>
                            </div>

                            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                {sessions.data.map((session) => {
                                    const score = session.feedback_report?.overall_score;

                                    return (
                                        <Link
                                            key={session.id}
                                            href={show(session.id)}
                                            className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-500/40 hover:shadow-md focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:outline-none"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="min-w-0">
                                                    <h2 className="truncate text-lg font-semibold">
                                                        {session.title}
                                                    </h2>
                                                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                                                        {session.topic}
                                                    </p>
                                                </div>
                                                <span
                                                    className={cn(
                                                        'rounded-full border px-3 py-1 text-xs font-medium',
                                                        statusTone(session.status),
                                                    )}
                                                >
                                                    {formatOption(session.status)}
                                                </span>
                                            </div>

                                            <div className="mt-5 flex flex-wrap gap-3 text-xs text-muted-foreground">
                                                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1">
                                                    <Mic2 className="size-3" />
                                                    {formatOption(session.session_type)}
                                                </span>
                                                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1">
                                                    <Timer className="size-3" />
                                                    {formatDuration(
                                                        session.target_duration_seconds,
                                                    )}
                                                </span>
                                                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1">
                                                    <CalendarDays className="size-3" />
                                                    {new Date(
                                                        session.created_at,
                                                    ).toLocaleDateString()}
                                                </span>
                                            </div>

                                            <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4">
                                                <span
                                                    className={cn(
                                                        'rounded-full border px-3 py-1 text-xs font-semibold',
                                                        scoreTone(score),
                                                    )}
                                                >
                                                    {score === null ||
                                                    score === undefined
                                                        ? 'No score yet'
                                                        : `${score}/100`}
                                                </span>
                                                <span className="text-sm font-medium text-cyan-700 transition group-hover:translate-x-0.5 dark:text-cyan-200">
                                                    Open session
                                                </span>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>

                            {sessions.last_page > 1 && (
                                <nav
                                    className="mt-8 flex flex-wrap items-center justify-center gap-2"
                                    aria-label="Practice sessions pagination"
                                >
                                    {sessions.links.map((link) => (
                                        <Link
                                            key={`${link.label}-${link.url}`}
                                            href={link.url ?? '#'}
                                            preserveScroll
                                            preserveState
                                            aria-disabled={!link.url}
                                            className={cn(
                                                'rounded-lg border px-3 py-2 text-sm font-medium transition focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:outline-none',
                                                link.active
                                                    ? 'border-cyan-500 bg-cyan-500 text-white'
                                                    : 'border-border bg-card text-muted-foreground hover:border-cyan-500/50 hover:text-foreground',
                                                !link.url &&
                                                    'pointer-events-none opacity-40',
                                            )}
                                        >
                                            {paginationLabel(link.label)}
                                        </Link>
                                    ))}
                                </nav>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
}

Index.layout = {
    breadcrumbs: [
        {
            title: 'Practice sessions',
            href: index(),
        },
    ],
};
