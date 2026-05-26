import { usePage } from '@inertiajs/react';
import { Search, Sparkles } from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { auth } = usePage().props;

    return (
        <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border/70 bg-background/90 px-4 backdrop-blur-xl transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-6">
            <div className="flex min-w-0 items-center gap-2">
                <SidebarTrigger className="-ml-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            <div className="flex items-center gap-3">
                <div className="hidden items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground sm:flex">
                    <Search className="size-4" />
                    <span>Search sessions</span>
                </div>
                <div className="hidden items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-sm text-cyan-700 md:flex dark:text-cyan-100">
                    <Sparkles className="size-4" />
                    <span>{auth.user?.name ?? 'Speaker'}</span>
                </div>
            </div>
        </header>
    );
}
