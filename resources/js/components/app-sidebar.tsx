import { Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    BrainCircuit,
    ChartNoAxesCombined,
    LayoutDashboard,
    MessageSquareText,
    Mic2,
    Settings,
    ShieldCheck,
    Trophy,
    Users,
} from 'lucide-react';
import { index as adminDashboard } from '@/actions/App/Http/Controllers/AdminDashboardController';
import {
    create as createPracticeSession,
    index as practiceSessionsIndex,
} from '@/actions/App/Http/Controllers/PracticeSessionController';
import { index as feedbackReportsIndex } from '@/actions/App/Http/Controllers/SpeakingFeedbackReportController';
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
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutDashboard,
    },
    {
        title: 'Practice',
        href: createPracticeSession(),
        icon: Mic2,
    },
    {
        title: 'Sessions',
        href: practiceSessionsIndex(),
        icon: MessageSquareText,
    },
    {
        title: 'Analytics',
        href: feedbackReportsIndex(),
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
    const { auth } = usePage().props;
    const navItems = auth.user?.is_admin
        ? [
              ...mainNavItems,
              {
                  title: 'Admin',
                  href: adminDashboard(),
                  icon: ShieldCheck,
              },
          ]
        : mainNavItems;

    return (
        <Sidebar
            collapsible="icon"
            variant="inset"
            className="border-sidebar-border bg-sidebar text-sidebar-foreground"
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
                <NavMain items={navItems} />
            </SidebarContent>

            <SidebarFooter>
                <div className="mx-2 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-3 text-cyan-700 group-data-[collapsible=icon]:hidden dark:text-cyan-100">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                        <Trophy className="size-4" />
                        Fluency Pro
                    </div>
                    <p className="mt-2 text-xs leading-5 text-cyan-800/75 dark:text-cyan-100/75">
                        Two more sessions to unlock your next badge.
                    </p>
                </div>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
