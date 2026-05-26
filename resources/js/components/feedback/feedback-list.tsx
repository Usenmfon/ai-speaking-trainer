import type { ReactNode } from 'react';

type FeedbackListProps = {
    emptyText?: string;
    icon: ReactNode;
    items: string[] | null;
    title: string;
};

export function FeedbackList({
    emptyText = 'Feedback is not available yet.',
    icon,
    items,
    title,
}: FeedbackListProps) {
    const visibleItems = items?.length ? items : [emptyText];

    return (
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2">
                {icon}
                <h2 className="text-lg font-semibold">{title}</h2>
            </div>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
                {visibleItems.map((item) => (
                    <li key={item} className="rounded-xl bg-background p-3">
                        {item}
                    </li>
                ))}
            </ul>
        </section>
    );
}
