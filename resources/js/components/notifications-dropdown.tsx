import { Link, router, usePage } from '@inertiajs/react';
import { Bell, Check, Inbox, LoaderCircle } from 'lucide-react';
import { useState } from 'react';

import {
    read,
    readAll,
} from '@/actions/App/Http/Controllers/NotificationController';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { AppNotification } from '@/types';

function formatNotificationTime(value: string | null): string {
    if (!value) {
        return '';
    }

    return new Date(value).toLocaleDateString();
}

export function NotificationsDropdown() {
    const { notifications } = usePage().props;
    const [readingId, setReadingId] = useState<string | null>(null);
    const [markingAll, setMarkingAll] = useState(false);

    function markAsRead(notification: AppNotification): void {
        if (readingId || markingAll) {
            return;
        }

        setReadingId(notification.id);

        router.post(
            read.url(notification.id),
            {},
            {
                preserveScroll: true,
                only: ['notifications'],
                onFinish: () => setReadingId(null),
            },
        );
    }

    function markAllAsRead(): void {
        if (markingAll || readingId) {
            return;
        }

        setMarkingAll(true);

        router.post(
            readAll.url(),
            {},
            {
                preserveScroll: true,
                only: ['notifications'],
                onFinish: () => setMarkingAll(false),
            },
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="relative rounded-full"
                    aria-label="Notifications"
                >
                    <Bell className="size-5" />
                    {notifications.unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 flex min-w-5 items-center justify-center rounded-full bg-cyan-500 px-1.5 text-[11px] font-semibold text-white">
                            {notifications.unreadCount > 9
                                ? '9+'
                                : notifications.unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-80 p-0">
                <div className="flex items-center justify-between gap-3 px-4 py-3">
                    <DropdownMenuLabel className="p-0">
                        Notifications
                    </DropdownMenuLabel>
                    {notifications.unreadCount > 0 && (
                        <button
                            type="button"
                            onClick={markAllAsRead}
                            disabled={markingAll}
                            className="text-xs font-medium text-cyan-700 transition hover:text-cyan-900 dark:text-cyan-200 dark:hover:text-cyan-100"
                        >
                            {markingAll ? 'Marking...' : 'Mark all read'}
                        </button>
                    )}
                </div>
                <DropdownMenuSeparator className="m-0" />

                {notifications.recent.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                        <Inbox className="mx-auto size-8 text-muted-foreground" />
                        <p className="mt-3 text-sm font-medium">
                            No notifications yet
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Recording and feedback updates will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="max-h-96 overflow-y-auto py-1">
                        {notifications.recent.map((notification) => {
                            const content = (
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={cn(
                                                'size-2 rounded-full',
                                                notification.read_at
                                                    ? 'bg-muted'
                                                    : 'bg-cyan-500',
                                            )}
                                        />
                                        <p className="truncate text-sm font-medium">
                                            {notification.title}
                                        </p>
                                    </div>
                                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                                        {notification.message}
                                    </p>
                                    <p className="mt-1 text-[11px] text-muted-foreground">
                                        {formatNotificationTime(
                                            notification.created_at,
                                        )}
                                    </p>
                                </div>
                            );

                            return (
                                <div
                                    key={notification.id}
                                    className="flex items-start gap-2 px-3 py-2 transition hover:bg-accent"
                                >
                                    {notification.url ? (
                                        <Link
                                            href={notification.url}
                                            className="min-w-0 flex-1 rounded-md focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:outline-none"
                                        >
                                            {content}
                                        </Link>
                                    ) : (
                                        content
                                    )}

                                    {!notification.read_at && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                markAsRead(notification)
                                            }
                                            disabled={
                                                markingAll ||
                                                readingId === notification.id
                                            }
                                            className="mt-1 rounded-full p-1 text-muted-foreground transition hover:bg-background hover:text-foreground focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:outline-none"
                                            aria-label="Mark notification as read"
                                        >
                                            {readingId === notification.id ? (
                                                <LoaderCircle className="size-4 animate-spin" />
                                            ) : (
                                                <Check className="size-4" />
                                            )}
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
