import { Head, Link, setLayoutProps } from '@inertiajs/react';
import { ArrowLeft, CircleDashed, ShieldCheck } from 'lucide-react';

import {
    auditLogs,
    content,
    index as adminDashboard,
    notifications,
    processing,
    settings,
} from '@/actions/App/Http/Controllers/AdminDashboardController';
import type { BreadcrumbItem } from '@/types';

type ManagementItem = {
    title: string;
    description: string;
    status: string;
};

type ManagementSectionProps = {
    section: {
        title: string;
        eyebrow: string;
        description: string;
        items: ManagementItem[];
    };
};

export default function ManagementSection({ section }: ManagementSectionProps) {
    const sectionHref = managementSectionHref(section.title);

    setLayoutProps({
        breadcrumbs: [
            {
                title: 'Admin',
                href: adminDashboard(),
            },
            {
                title: section.title,
                href: sectionHref,
            },
        ],
    });

    return (
        <>
            <Head title={`Admin ${section.title}`} />

            <div className="min-h-full bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
                <div className="mx-auto flex max-w-7xl flex-col gap-6">
                    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-8">
                        <Link
                            href={adminDashboard()}
                            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
                        >
                            <ArrowLeft className="size-4" />
                            Admin dashboard
                        </Link>

                        <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <p className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-700 dark:text-cyan-200">
                                    <ShieldCheck className="size-4" />
                                    {section.eyebrow}
                                </p>
                                <h1 className="mt-3 text-3xl font-semibold tracking-normal sm:text-4xl">
                                    {section.title}
                                </h1>
                                <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
                                    {section.description}
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {section.items.map((item) => (
                            <article
                                key={item.title}
                                className="rounded-2xl border border-border bg-card p-5 shadow-sm"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h2 className="text-base font-semibold">
                                            {item.title}
                                        </h2>
                                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                            {item.description}
                                        </p>
                                    </div>
                                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-200">
                                        <CircleDashed className="size-3" />
                                        {item.status}
                                    </span>
                                </div>
                            </article>
                        ))}
                    </section>
                </div>
            </div>
        </>
    );
}

function managementSectionHref(title: string): BreadcrumbItem['href'] {
    const hrefByTitle: Record<string, BreadcrumbItem['href']> = {
        Content: content(),
        Processing: processing(),
        Notifications: notifications(),
        'System settings': settings(),
        'Audit logs': auditLogs(),
    };

    return hrefByTitle[title] ?? adminDashboard();
}

ManagementSection.layout = {
    breadcrumbs: [
        {
            title: 'Admin',
            href: adminDashboard(),
        },
    ],
};
