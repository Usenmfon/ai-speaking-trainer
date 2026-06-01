import type { Auth, NotificationSummary, SidebarContent } from '@/types/auth';

declare module 'react' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface InputHTMLAttributes<T> {
        passwordrules?: string;
    }
}

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            notifications: NotificationSummary;
            sidebarContent: SidebarContent;
            sidebarOpen: boolean;
            [key: string]: unknown;
        };
    }
}
