import { Link } from '@inertiajs/react';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn } from '@/lib/utils';
import type { NavItem } from '@/types';

type NavMainProps = {
    items?: NavItem[];
    label?: string;
};

export function NavMain({
    items = [],
    label = 'Coach workspace',
}: NavMainProps) {
    const { isCurrentUrl, isCurrentOrParentUrl } = useCurrentUrl();

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel className="text-sidebar-foreground/60">
                {label}
            </SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => {
                    const isActive =
                        item.isActive ??
                        (item.activeHref
                            ? isCurrentOrParentUrl(item.activeHref)
                            : isCurrentUrl(item.href));

                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                isActive={isActive}
                                tooltip={{ children: item.title }}
                                className={cn(
                                    'text-sidebar-foreground/75 transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                                    isActive &&
                                        'bg-cyan-500/10 text-cyan-700 dark:text-cyan-100',
                                )}
                            >
                                <Link
                                    href={item.href}
                                    prefetch
                                    aria-current={isActive ? 'page' : undefined}
                                >
                                    {item.icon && <item.icon />}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
