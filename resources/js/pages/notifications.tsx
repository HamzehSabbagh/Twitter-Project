import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useAppSettings } from '@/components/app-settings-provider';

type NotificationItem = {
    id: string;
    type: string;
    title: string;
    message: string;
    url: string;
    read_at: string | null;
    created_at: string | null;
};

type NotificationPageProps = {
    notifications: NotificationItem[];
};

type SharedPageProps = {
    auth?: {
        user?: {
            first_name?: string;
            last_name?: string;
            username?: string;
            picture?: string;
            unread_notifications_count?: number;
        } | null;
    };
};

export default function Notifications({ notifications }: NotificationPageProps) {
    const markReadForm = useForm({});
    const { t } = useAppSettings();
    const page = usePage<SharedPageProps>();
    const unreadCount = page.props.auth?.user?.unread_notifications_count ?? 0;
    const user = page.props.auth?.user;
    const userDisplayName = user ? `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() : 'Guest';

    return (
        <>
            <Head title={t('notifications', 'Notifications')} />

            <main className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 gap-5 px-4 py-6 lg:grid-cols-[260px_1fr_320px]">
                <aside className="space-y-5">
                    <section className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                        <div className="group relative pb-3">
                            <div className="flex w-full items-center gap-3 rounded-2xl bg-slate-50 p-3 text-left transition hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800">
                                <img
                                    src={user?.picture}
                                    alt="Profile"
                                    className="h-14 w-14 rounded-full border border-slate-200 object-cover dark:border-slate-700"
                                />
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{userDisplayName}</p>
                                    <p className="truncate text-xs text-slate-500">@{user?.username ?? 'guest'}</p>
                                </div>
                                <span className="text-xs font-semibold text-slate-500">Menu</span>
                            </div>

                            <div className="invisible absolute left-0 top-full z-20 mt-0 w-full translate-y-2 rounded-2xl border border-slate-200 bg-white p-2 opacity-0 shadow-xl transition duration-150 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 dark:border-slate-800 dark:bg-slate-950">
                                <Link
                                    href={`/profile/${user?.username ?? ''}`}
                                    className="block rounded-xl px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
                                >
                                    {t('profile', 'Profile')}
                                </Link>
                                <Link
                                    href="/settings"
                                    className="block rounded-xl px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
                                >
                                    {t('settings', 'Settings')}
                                </Link>
                            </div>
                        </div>
                    </section>

                    <section className="sticky top-6 rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{t('navigation', 'Navigation')}</h2>
                        <nav className="mt-4 space-y-2 text-sm">
                            <Link href="/home" className="block rounded-xl px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-900">
                                {t('home', 'Home')}
                            </Link>
                            <Link href="/explore" className="block rounded-xl px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-900">
                                {t('explore', 'Explore')}
                            </Link>
                            <Link href="/notifications" className="flex items-center justify-between rounded-xl bg-slate-100 px-3 py-2 font-medium dark:bg-slate-900">
                                <span>{t('notifications', 'Notifications')}</span>
                                {unreadCount > 0 && (
                                    <span className="rounded-full bg-cyan-500 px-2 py-0.5 text-xs font-semibold text-slate-950">
                                        {unreadCount}
                                    </span>
                                )}
                            </Link>
                        </nav>
                    </section>
                </aside>

                <section className="space-y-5">
                    <header className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-400">{t('notifications', 'Notifications')}</p>
                                <h1 className="mt-2 text-3xl font-semibold">{t('notifications_title', 'Your activity inbox')}</h1>
                                <p className="mt-2 text-sm text-slate-500">
                                    {t('notifications_description', 'Follow events, likes, replies, reposts, and mentions all land here.')}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                                {unreadCount} {t('unread', 'unread')}
                            </span>
                                <button
                                    type="button"
                                    onClick={() => markReadForm.post('/notifications/read-all')}
                                    className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
                                >
                                    {t('mark_all_read', 'Mark all read')}
                                </button>
                            </div>
                        </div>
                    </header>

                    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                        <div className="space-y-3">
                            {notifications.length === 0 && (
                                <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500 dark:border-slate-700">
                                    No notifications yet.
                                </div>
                            )}

                            {notifications.map((notification) => (
                                <Link
                                    key={notification.id}
                                    href={`/notifications/${notification.id}/open`}
                                    className={`block rounded-2xl border p-4 transition ${
                                        notification.read_at
                                            ? 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900'
                                            : 'border-cyan-200 bg-cyan-50/60 hover:bg-cyan-50 dark:border-cyan-900/40 dark:bg-cyan-950/20 dark:hover:bg-cyan-950/30'
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{notification.title}</p>
                                                {notification.read_at === null && <span className="h-2.5 w-2.5 rounded-full bg-cyan-500" />}
                                            </div>
                                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{notification.message}</p>
                                        </div>
                                        <span className="text-xs text-slate-400">{notification.created_at ?? 'Unknown date'}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                </section>

                <aside className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{t('quick_return', 'Quick return')}</h2>
                    <div className="mt-4 space-y-3 text-sm text-slate-500">
                        <p>Use the left navigation to jump back to your timeline or explore without losing context.</p>
                        <p>Opening a notification marks only that item as read. The inbox keeps older activity until new events push it down.</p>
                    </div>
                </aside>
            </main>
        </>
    );
}
