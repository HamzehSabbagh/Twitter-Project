import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { useAppSettings } from '@/components/app-settings-provider';
import { TextWithMentions } from '@/components/text-with-mentions';

type ExploreProps = {
    auth?: {
        user?: {
            first_name: string;
            last_name: string;
            username: string;
            picture?: string;
            email: string;
            role_name?: string | null;
            unread_notifications_count?: number;
        } | null;
    };
    posts: {
        id: number;
        content: string | null;
        parent_id: number | null;
        created_at: string | null;
        likes_count: number;
        comments_count: number;
        reposts_count: number;
        liked_by_user: boolean;
        reposted_by_user: boolean;
        can_edit: boolean;
        can_delete: boolean;
        user: {
            id: number | null;
            first_name: string | null;
            last_name: string | null;
            username: string | null;
        };
        hashtags: {
            id: number;
            name: string;
        }[];
        media: {
            id: number;
            type: string;
            path: string;
            url: string;
            mime_type: string;
        }[];
    }[];
    trendingHashtags: {
        id: number;
        name: string;
        posts_count: number;
    }[];
    suggestedUsers: {
        id: number;
        first_name: string;
        last_name: string;
        username: string;
        followers_count: number;
        posts_count: number;
    }[];
};

function renderMediaPreview(media: ExploreProps['posts'][number]['media'][number]) {
    if (media.type === 'image') {
        return <img src={media.url} alt="Post media" className="max-h-80 w-full rounded-2xl object-cover" />;
    }

    if (media.type === 'video') {
        return <video src={media.url} preload="metadata" controls className="max-h-80 w-full rounded-2xl bg-black" />;
    }

    if (media.type === 'audio') {
        return <audio src={media.url} controls className="w-full" />;
    }

    return null;
}

function getDisplayName(user: ExploreProps['posts'][number]['user']) {
    const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
    return fullName || user.username || 'Unknown user';
}

function LikeButton({
    liked,
    count,
    onClick,
}: {
    liked: boolean;
    count: number;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-semibold transition ${
                liked
                    ? 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200'
                    : 'bg-slate-100 text-slate-500 hover:text-white dark:bg-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
        >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8">
                <path d="M12 20.5 4.9 13.9A4.7 4.7 0 0 1 11.8 7l.2.3.2-.3a4.7 4.7 0 0 1 6.9 6.4L12 20.5Z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>{count}</span>
        </button>
    );
}

export default function Explore({ auth, posts, trendingHashtags, suggestedUsers }: ExploreProps) {
    const logoutForm = useForm({});
    const { t } = useAppSettings();
    const [query, setQuery] = useState('');
    const isAdmin = (auth?.user?.role_name ?? '').toLowerCase() === 'admin';
    const userDisplayName = auth?.user ? `${auth.user.first_name} ${auth.user.last_name}`.trim() : 'Guest';

    const filteredPosts = posts.filter((post) => {
        const haystack = [
            post.content ?? '',
            post.user.first_name ?? '',
            post.user.last_name ?? '',
            post.user.username ?? '',
            ...post.hashtags.map((hashtag) => hashtag.name),
        ]
            .join(' ')
            .toLowerCase();

        return haystack.includes(query.toLowerCase());
    });

    const filteredHashtags = trendingHashtags.filter((hashtag) => hashtag.name.toLowerCase().includes(query.toLowerCase()));
    const filteredUsers = suggestedUsers.filter((user) =>
        [user.first_name, user.last_name, user.username].join(' ').toLowerCase().includes(query.toLowerCase()),
    );

    const accentTextClass = isAdmin ? 'text-rose-600 dark:text-rose-400' : 'text-cyan-600 dark:text-cyan-400';
    const pageToneClass = isAdmin ? 'bg-rose-50/30 dark:bg-rose-950/10' : '';

    return (
        <>
            <Head title={t('explore', 'Explore')} />

            <main className={`mx-auto grid min-h-screen max-w-7xl grid-cols-1 gap-5 px-4 py-6 lg:grid-cols-[260px_1fr_320px] ${pageToneClass}`}>
                <aside className="space-y-5">
                    <section className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                        <div className="group relative pb-3">
                            <div className="flex w-full items-center gap-3 rounded-2xl bg-slate-50 p-3 text-left transition hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800">
                                <img
                                    src={auth?.user?.picture}
                                    alt="Profile"
                                    className="h-14 w-14 rounded-full border border-slate-200 object-cover dark:border-slate-700"
                                />
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{userDisplayName}</p>
                                    <p className="truncate text-xs text-slate-500">@{auth?.user?.username ?? 'guest'}</p>
                                </div>
                                <span className="text-xs font-semibold text-slate-500">Menu</span>
                            </div>

                            <div className="invisible absolute left-0 top-full z-20 mt-0 w-full translate-y-2 rounded-2xl border border-slate-200 bg-white p-2 opacity-0 shadow-xl transition duration-150 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 dark:border-slate-800 dark:bg-slate-950">
                                <Link
                                    href={`/profile/${auth?.user?.username ?? ''}`}
                                    className="block rounded-xl px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
                                >
                                    {t('profile', 'Profile')}
                                </Link>
                                <a
                                    href="/settings"
                                    className="block rounded-xl px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
                                >
                                    {t('settings', 'Settings')}
                                </a>
                                <button
                                    type="button"
                                    onClick={() => logoutForm.post('/logout')}
                                    className="block w-full rounded-xl px-3 py-2 text-left text-sm text-rose-600 transition hover:bg-rose-50 dark:hover:bg-rose-950/20"
                                >
                                    {t('logout', 'Log out')}
                                </button>
                            </div>
                        </div>
                    </section>

                    <section className="sticky top-6 rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{t('navigation', 'Navigation')}</h2>
                        <nav className="mt-4 space-y-2 text-sm">
                            <Link href="/home" className="block rounded-xl px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-900">
                                {t('home', 'Home')}
                            </Link>
                            <Link href="/explore" className="block rounded-xl bg-slate-100 px-3 py-2 font-medium dark:bg-slate-900">
                                {t('explore', 'Explore')}
                            </Link>
                            <a href="/notifications" className="flex items-center justify-between rounded-xl px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-900">
                                <span>{t('notifications', 'Notifications')}</span>
                                {(auth?.user?.unread_notifications_count ?? 0) > 0 && (
                                    <span className="rounded-full bg-cyan-500 px-2 py-0.5 text-xs font-semibold text-slate-950">
                                        {auth?.user?.unread_notifications_count}
                                    </span>
                                )}
                            </a>
                        </nav>
                    </section>
                </aside>

                <section className="space-y-4">
                    <header className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                        <p className={`text-sm uppercase tracking-[0.2em] ${accentTextClass}`}>{t('explore', 'Explore')}</p>
                        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <h1 className="text-3xl font-semibold">Discover what is moving</h1>
                                <p className="mt-2 max-w-2xl text-sm text-slate-500">
                                    Browse trending hashtags, suggested accounts, and the most active posts across the app.
                                </p>
                            </div>
                            <div className="w-full max-w-sm">
                                <label htmlFor="explore-search" className="sr-only">
                                    Search explore
                                </label>
                                <input
                                    id="explore-search"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search users, posts, hashtags"
                                    className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-300/40 dark:border-slate-700 dark:bg-slate-900"
                                />
                            </div>
                        </div>
                    </header>

                    <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                            <div className="flex items-center justify-between gap-3">
                                <h2 className="text-lg font-semibold">Popular posts</h2>
                                <span className="text-sm text-slate-500">{filteredPosts.length} result(s)</span>
                            </div>

                            <div className="mt-4 space-y-4">
                                {filteredPosts.length === 0 && (
                                    <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500 dark:border-slate-700">
                                        No posts match your search yet.
                                    </div>
                                )}

                                {filteredPosts.map((post) => (
                                    <article key={post.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <Link href={`/profile/${post.user.username ?? ''}`} className="text-sm font-semibold hover:underline">
                                                    {getDisplayName(post.user)}
                                                </Link>
                                                <p className="text-xs text-slate-500">@{post.user.username ?? 'unknown'}</p>
                                            </div>
                                            <span className="text-xs text-slate-400">{post.created_at ?? 'Unknown date'}</span>
                                        </div>

                                        <Link href={`/post/${post.id}`} className="mt-3 block">
                                            <TextWithMentions
                                                text={post.content || 'Media-only post'}
                                                className="whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:text-slate-200"
                                            />
                                        </Link>

                                        {post.hashtags.length > 0 && (
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {post.hashtags.map((hashtag) => (
                                                    <Link
                                                        key={hashtag.id}
                                                        href={`/hashtag/${hashtag.id}`}
                                                        className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700 dark:bg-cyan-950/30 dark:text-cyan-300"
                                                    >
                                                        #{hashtag.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        )}

                                        {post.media.length > 0 && (
                                            <div className="mt-4 space-y-3">
                                                {post.media.slice(0, 2).map((media) => (
                                                    <div key={media.id} className="overflow-hidden rounded-2xl">
                                                        {renderMediaPreview(media)}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
                                            <LikeButton
                                                liked={post.liked_by_user}
                                                count={post.likes_count}
                                                onClick={() =>
                                                    post.liked_by_user
                                                        ? router.delete(`/post/${post.id}/like`, { preserveScroll: true })
                                                        : router.post(`/post/${post.id}/like`, {}, { preserveScroll: true })
                                                }
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    post.reposted_by_user
                                                        ? router.delete(`/post/${post.id}/repost`, { preserveScroll: true })
                                                        : router.post(`/post/${post.id}/repost`, {}, { preserveScroll: true })
                                                }
                                                className={`font-semibold transition ${
                                                    post.reposted_by_user
                                                        ? 'text-emerald-600 hover:text-emerald-500'
                                                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                                }`}
                                            >
                                                {post.reposted_by_user ? 'Undo repost' : 'Repost'} - {post.reposts_count}
                                            </button>
                                            <span>{post.comments_count} comments</span>
                                            <Link href={`/post/${post.id}`} className={`font-semibold hover:underline ${accentTextClass}`}>
                                                Open post
                                            </Link>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                                <div className="flex items-center justify-between gap-3">
                                    <h2 className="text-lg font-semibold">Suggested users</h2>
                                    <span className="text-sm text-slate-500">{filteredUsers.length}</span>
                                </div>

                                <div className="mt-4 space-y-3">
                                    {filteredUsers.length === 0 && (
                                        <p className="text-sm text-slate-500">No suggested users match your search.</p>
                                    )}

                                    {filteredUsers.map((user) => (
                                        <div key={user.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <Link href={`/profile/${user.username}`} className="font-semibold hover:underline">
                                                        {[user.first_name, user.last_name].filter(Boolean).join(' ') || user.username}
                                                    </Link>
                                                    <p className="text-sm text-slate-500">@{user.username}</p>
                                                    <p className="mt-2 text-xs text-slate-500">
                                                        {user.followers_count} followers • {user.posts_count} posts
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => router.post(`/profile/${user.username}/follow`, {}, { preserveScroll: true })}
                                                    className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
                                                >
                                                    Follow
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                                <div className="flex items-center justify-between gap-3">
                                    <h2 className="text-lg font-semibold">Trending hashtags</h2>
                                    <span className="text-sm text-slate-500">{filteredHashtags.length}</span>
                                </div>

                                <div className="mt-4 space-y-3">
                                    {filteredHashtags.length === 0 && (
                                        <p className="text-sm text-slate-500">No hashtags match your search.</p>
                                    )}

                                    {filteredHashtags.map((hashtag) => (
                                        <Link
                                            key={hashtag.id}
                                            href={`/hashtag/${hashtag.id}`}
                                            className="block rounded-2xl border border-slate-200 p-4 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
                                        >
                                            <p className="font-semibold">#{hashtag.name}</p>
                                            <p className="mt-1 text-sm text-slate-500">{hashtag.posts_count} post(s)</p>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        </div>
                    </section>
                </section>

                <aside className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Search tips</h2>
                    <div className="mt-4 space-y-3 text-sm text-slate-500">
                        <p>Search by username, full name, hashtag text, or words inside a post.</p>
                        <p>Explore ranks posts by combined likes, comments, and reposts so active conversations rise first.</p>
                        <p>Suggested users prioritize accounts with real activity and existing audience.</p>
                    </div>
                </aside>
            </main>
        </>
    );
}
