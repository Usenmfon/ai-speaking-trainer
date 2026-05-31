import { Link, usePage } from '@inertiajs/react';
import {
    Activity,
    BarChart3,
    Bell,
    Bot,
    BrainCircuit,
    ChartNoAxesCombined,
    FileCog,
    FileText,
    LayoutDashboard,
    MessageSquareText,
    Mic2,
    Settings,
    ShieldCheck,
    Trophy,
    Users,
} from 'lucide-react';
import {
    auditLogs as adminAuditLogs,
    content as adminContent,
    index as adminDashboard,
    notifications as adminNotifications,
    processing as adminProcessing,
    sessions as adminSessions,
    settings as adminSettings,
    users as adminUsers,
} from '@/actions/App/Http/Controllers/AdminDashboardController';
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
import { useCurrentUrl } from '@/hooks/use-current-url';
import { aiCoach, dashboard, progress } from '@/routes';
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
        activeHref: '/practice-sessions',
        icon: MessageSquareText,
    },
    {
        title: 'Analytics',
        href: feedbackReportsIndex(),
        activeHref: '/feedback-reports',
        icon: BarChart3,
    },
    {
        title: 'AI Coach',
        href: aiCoach(),
        activeHref: '/ai-coach',
        icon: BrainCircuit,
    },
    {
        title: 'Progress',
        href: progress(),
        activeHref: '/progress',
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
        activeHref: '/settings',
        icon: Settings,
    },
];

const adminNavItems: NavItem[] = [
    {
        title: 'Overview',
        href: adminDashboard(),
        icon: LayoutDashboard,
    },
    {
        title: 'Users',
        href: adminUsers(),
        activeHref: '/admin/users',
        icon: Users,
    },
    {
        title: 'Sessions',
        href: adminSessions(),
        activeHref: '/admin/sessions',
        icon: FileText,
    },
    {
        title: 'Content',
        href: adminContent(),
        activeHref: '/admin/content',
        icon: FileCog,
    },
    {
        title: 'Processing',
        href: adminProcessing(),
        activeHref: '/admin/processing',
        icon: Bot,
    },
    {
        title: 'Notifications',
        href: adminNotifications(),
        activeHref: '/admin/notifications',
        icon: Bell,
    },
    {
        title: 'System Settings',
        href: adminSettings(),
        activeHref: '/admin/settings',
        icon: Settings,
    },
    {
        title: 'Audit Logs',
        href: adminAuditLogs(),
        activeHref: '/admin/audit-logs',
        icon: Activity,
    },
];

export function AppSidebar() {
    const { auth } = usePage().props;
    const { currentUrl } = useCurrentUrl();
    const isAdminWorkspace =
        auth.user?.is_admin === true && currentUrl.startsWith('/admin');
    const homeHref = isAdminWorkspace ? adminDashboard() : dashboard();
    const navItems = isAdminWorkspace
        ? adminNavItems
        : auth.user?.is_admin
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
                            <Link href={homeHref} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain
                    items={navItems}
                    label={
                        isAdminWorkspace
                            ? 'System management'
                            : 'Coach workspace'
                    }
                />
            </SidebarContent>

            <SidebarFooter>
                <div className="mx-2 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-3 text-cyan-700 group-data-[collapsible=icon]:hidden dark:text-cyan-100">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                        {isAdminWorkspace ? (
                            <ShieldCheck className="size-4" />
                        ) : (
                            <Trophy className="size-4" />
                        )}
                        {isAdminWorkspace ? 'Admin mode' : 'Fluency Pro'}
                    </div>
                    <p className="mt-2 text-xs leading-5 text-cyan-800/75 dark:text-cyan-100/75">
                        {isAdminWorkspace
                            ? 'Manage content, users, processing, and system controls.'
                            : 'Two more sessions to unlock your next badge.'}
                    </p>
                </div>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
