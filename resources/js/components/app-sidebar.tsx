import { Link } from '@inertiajs/react';
import {
    BarChart3,
    BrainCircuit,
    ChartNoAxesCombined,
    LayoutDashboard,
    MessageSquareText,
    Mic2,
    Settings,
    Trophy,
    Users,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard, practice } from '@/routes';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutDashboard,
    },
    {
        title: 'Practice',
        href: practice(),
        icon: Mic2,
    },
    {
        title: 'Sessions',
        href: '#sessions',
        icon: MessageSquareText,
    },
    {
        title: 'Analytics',
        href: '#analytics',
        icon: BarChart3,
    },
    {
        title: 'AI Coach',
        href: '#coach',
        icon: BrainCircuit,
    },
    {
        title: 'Progress',
        href: '#progress',
        icon: ChartNoAxesCombined,
    },
    {
        title: 'Community',
        href: '#community',
        icon: Users,
    },
    {
        title: 'Settings',
        href: '/settings/profile',
        icon: Settings,
    },
];

export function AppSidebar() {
    return (
        <Sidebar
            collapsible="icon"
            variant="inset"
            className="border-white/10 bg-[#070a18]"
        >
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <div className="mx-2 rounded-2xl border border-cyan-300/15 bg-cyan-300/10 p-3 text-cyan-100 group-data-[collapsible=icon]:hidden">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                        <Trophy className="size-4" />
                        Fluency Pro
                    </div>
                    <p className="mt-2 text-xs leading-5 text-cyan-100/75">
                        Two more sessions to unlock your next badge.
                    </p>
                </div>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
