import { Head, Link, usePage } from '@inertiajs/react';
import { useAppSettings } from '@/components/app-settings-provider';

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

export default function Settings() {
    const { theme, language, setTheme, setLanguage, t } = useAppSettings();
    const page = usePage<SharedPageProps>();
    const user = page.props.auth?.user;
    const userDisplayName = user ? `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() : 'Guest';
    const unreadCount = user?.unread_notifications_count ?? 0;

    return (
        <>
            <Head title={t('settings_title', 'App settings')} />

            <main className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 gap-5 px-4 py-6 lg:grid-cols-[260px_1fr_320px]">
                <aside className="space-y-5">
                    <section className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                        <div className="flex w-full items-center gap-3 rounded-2xl bg-slate-50 p-3 dark:bg-slate-900">
                            <img
                                src={user?.picture}
                                alt="Profile"
                                className="h-14 w-14 rounded-full border border-slate-200 object-cover dark:border-slate-700"
                            />
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{userDisplayName}</p>
                                <p className="truncate text-xs text-slate-500">@{user?.username ?? 'guest'}</p>
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
                            <Link href="/notifications" className="flex items-center justify-between rounded-xl px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-900">
                                <span>{t('notifications', 'Notifications')}</span>
                                {unreadCount > 0 && (
                                    <span className="rounded-full bg-cyan-500 px-2 py-0.5 text-xs font-semibold text-slate-950">
                                        {unreadCount}
                                    </span>
                                )}
                            </Link>
                            <Link href="/settings" className="block rounded-xl bg-slate-100 px-3 py-2 font-medium dark:bg-slate-900">
                                {t('settings', 'Settings')}
                            </Link>
                        </nav>
                    </section>
                </aside>

                <section className="space-y-5">
                    <header className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                        <p className="text-sm uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-400">{t('settings', 'Settings')}</p>
                        <h1 className="mt-2 text-3xl font-semibold">{t('settings_title', 'App settings')}</h1>
                        <p className="mt-2 max-w-2xl text-sm text-slate-500">
                            {t('settings_description', 'Choose how the interface looks and which language to use for the app shell.')}
                        </p>
                    </header>

                    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                        <h2 className="text-lg font-semibold">{t('theme', 'Theme')}</h2>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            <button
                                type="button"
                                onClick={() => setTheme('light')}
                                className={`rounded-2xl border p-4 text-left transition ${
                                    theme === 'light'
                                        ? 'border-cyan-400 bg-cyan-50 dark:border-cyan-500 dark:bg-cyan-950/20'
                                        : 'border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900'
                                }`}
                            >
                                <p className="font-semibold">{t('light', 'Light')}</p>
                            </button>
                            <button
                                type="button"
                                onClick={() => setTheme('dark')}
                                className={`rounded-2xl border p-4 text-left transition ${
                                    theme === 'dark'
                                        ? 'border-cyan-400 bg-cyan-50 dark:border-cyan-500 dark:bg-cyan-950/20'
                                        : 'border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900'
                                }`}
                            >
                                <p className="font-semibold">{t('dark', 'Dark')}</p>
                            </button>
                        </div>
                    </section>

                    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                        <h2 className="text-lg font-semibold">{t('language', 'Language')}</h2>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            <button
                                type="button"
                                onClick={() => setLanguage('en')}
                                className={`rounded-2xl border p-4 text-left transition ${
                                    language === 'en'
                                        ? 'border-cyan-400 bg-cyan-50 dark:border-cyan-500 dark:bg-cyan-950/20'
                                        : 'border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900'
                                }`}
                            >
                                <p className="font-semibold">{t('english', 'English')}</p>
                            </button>
                            <button
                                type="button"
                                onClick={() => setLanguage('ar')}
                                className={`rounded-2xl border p-4 text-left transition ${
                                    language === 'ar'
                                        ? 'border-cyan-400 bg-cyan-50 dark:border-cyan-500 dark:bg-cyan-950/20'
                                        : 'border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900'
                                }`}
                            >
                                <p className="font-semibold">{t('arabic', 'Arabic')}</p>
                            </button>
                        </div>
                    </section>

                    <section className="rounded-[28px] border border-dashed border-slate-300 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-950">
                        <h2 className="text-lg font-semibold">{t('preview', 'Preview')}</h2>
                        <p className="mt-2 text-sm text-slate-500">{t('settings_saved_local', 'These settings are stored locally in this browser for now.')}</p>
                        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                            <p className="text-sm uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-400">{t('timeline', 'Timeline')}</p>
                            <p className="mt-2 text-sm text-slate-500">{t('timeline_description', 'Share updates, media, and threaded conversations from one place.')}</p>
                        </div>
                    </section>
                </section>

                <aside className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{t('quick_return', 'Quick return')}</h2>
                    <div className="mt-4 space-y-3 text-sm text-slate-500">
                        <p>{t('settings_saved_local', 'These settings are stored locally in this browser for now.')}</p>
                    </div>
                </aside>
            </main>
        </>
    );
}
