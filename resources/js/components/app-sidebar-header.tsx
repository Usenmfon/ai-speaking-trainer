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
        <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-white/10 bg-[#070a18]/90 px-4 backdrop-blur-xl transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-6">
            <div className="flex min-w-0 items-center gap-2">
                <SidebarTrigger className="-ml-1 text-slate-300 hover:bg-white/8 hover:text-white" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            <div className="flex items-center gap-3">
                <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-400 sm:flex">
                    <Search className="size-4" />
                    <span>Search sessions</span>
                </div>
                <div className="hidden items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-sm text-cyan-100 md:flex">
                    <Sparkles className="size-4" />
                    <span>{auth.user?.name ?? 'Speaker'}</span>
                </div>
            </div>
        </header>
    );
}
