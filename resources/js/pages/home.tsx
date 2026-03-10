import { Head, Link, router, useForm } from '@inertiajs/react';
import { TextWithMentions } from '@/components/text-with-mentions';

type HomeProps = {
    auth?: {
        user?: {
            first_name: string;
            last_name: string;
            username: string;
            picture?: string;
            email: string;
            role_name?: string | null;
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
};

function getPostDisplayName(user: HomeProps['posts'][number]['user']) {
    const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
    return fullName || user.username || 'Unknown user';
}

function renderMediaPreview(media: HomeProps['posts'][number]['media'][number]) {
    if (media.type === 'image') {
        return <img src={media.url} alt="Post media" className="max-h-80 w-full rounded-2xl object-cover" />;
    }

    if (media.type === 'video') {
        return <video src={media.url} preload="metadata" controls className="max-h-80 w-full rounded-2xl bg-black" />;
    }

    if (media.type === 'audio') {
        return <audio src={media.url} controls className="w-full" />;
    }

    return (
        <a href={media.url} target="_blank" rel="noreferrer" className="text-sm font-medium text-cyan-600 underline">
            Open attachment
        </a>
    );
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

export default function Home({ auth, posts, trendingHashtags }: HomeProps) {
    const logoutForm = useForm({});
    const userDisplayName = auth?.user ? `${auth.user.first_name} ${auth.user.last_name}`.trim() : 'Guest';
    const isAdmin = (auth?.user?.role_name ?? '').toLowerCase() === 'admin';
    const accentTextClass = isAdmin ? 'text-rose-600 dark:text-rose-400' : 'text-cyan-600 dark:text-cyan-400';
    const accentButtonClass = isAdmin
        ? 'bg-rose-600 text-white hover:bg-rose-500'
        : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400';
    const createCardClass = isAdmin
        ? 'border-rose-200 bg-gradient-to-br from-rose-50 via-white to-slate-50 dark:border-rose-900/40 dark:from-slate-950 dark:via-slate-950 dark:to-rose-950/30'
        : 'border-cyan-200 bg-gradient-to-br from-cyan-50 via-white to-slate-50 dark:border-cyan-900/40 dark:from-slate-950 dark:via-slate-950 dark:to-cyan-950/30';
    const tagClass = isAdmin
        ? 'rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 dark:bg-rose-950/30 dark:text-rose-300 dark:hover:bg-rose-950/50'
        : 'rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700 transition hover:bg-cyan-100 dark:bg-cyan-950/30 dark:text-cyan-300 dark:hover:bg-cyan-950/50';
    const pageToneClass = isAdmin ? 'bg-rose-50/30 dark:bg-rose-950/10' : '';

    return (
        <>
            <Head title="Home" />

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
                                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                                        {userDisplayName}
                                    </p>
                                    <p className="truncate text-xs text-slate-500">
                                        @{auth?.user?.username ?? 'guest'}
                                    </p>
                                </div>
                                <span className="text-xs font-semibold text-slate-500">Menu</span>
                            </div>

                            <div className="invisible absolute left-0 top-full z-20 mt-0 w-full translate-y-2 rounded-2xl border border-slate-200 bg-white p-2 opacity-0 shadow-xl transition duration-150 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 dark:border-slate-800 dark:bg-slate-950">
                                <Link
                                    href={`/profile/${auth?.user?.username ?? ''}`}
                                    className="block rounded-xl px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
                                >
                                    Profile
                                </Link>
                                <a
                                    href="#"
                                    className="block rounded-xl px-3 py-2 text-sm text-slate-400"
                                >
                                    Settings
                                </a>
                                <button
                                    type="button"
                                    onClick={() => logoutForm.post('/logout')}
                                    className="block w-full rounded-xl px-3 py-2 text-left text-sm text-rose-600 transition hover:bg-rose-50 dark:hover:bg-rose-950/20"
                                >
                                    Log out
                                </button>
                            </div>
                        </div>
                    </section>

                    <section className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Navigation</h2>
                        <nav className="mt-4 space-y-2 text-sm">
                            <a href="/home" className="block rounded-xl bg-slate-100 px-3 py-2 font-medium dark:bg-slate-900">
                                Home
                            </a>
                            <a href="#" className="block rounded-xl px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-900">
                                Explore
                            </a>
                            <a href="#" className="block rounded-xl px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-900">
                                Notifications
                            </a>
                        </nav>
                    </section>
                </aside>

                <section className="space-y-4">
                    <header className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className={`text-sm uppercase tracking-[0.2em] ${accentTextClass}`}>Timeline</p>
                                <h1 className="mt-2 text-2xl font-semibold">
                                    {auth?.user ? `@${auth.user.username}` : 'Your timeline'}
                                </h1>
                                <p className="mt-1 text-sm text-slate-500">
                                    Share updates, media, and threaded conversations from one place.
                                </p>
                            </div>

                            {auth?.user && (
                                <div className="flex items-center gap-3">
                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
                                        <p className="text-sm font-semibold">{userDisplayName}</p>
                                        <p className="text-xs text-slate-500">{auth.user.email}</p>
                                    </div>
                                    <Link
                                        href="/post/create"
                                        className={`rounded-full px-5 py-3 text-sm font-semibold transition ${accentButtonClass}`}
                                    >
                                        New post
                                    </Link>
                                </div>
                            )}
                        </div>
                    </header>

                    <div className={`rounded-[28px] border p-5 shadow-sm ${createCardClass}`}>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Create a post</p>
                                <p className="mt-1 text-sm text-slate-500">
                                    Open the composer to add text, pictures, videos, and audio.
                                </p>
                            </div>
                            <Link
                                href="/post/create"
                                className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                            >
                                New post
                            </Link>
                        </div>
                    </div>

                    <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                        <p className="text-sm font-medium">Timeline</p>
                        <div className="mt-3 space-y-3">
                            {posts.length === 0 && (
                                <div className="rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-500 dark:border-slate-700">
                                    No posts yet. Create the first one.
                                </div>
                            )}

                            {posts.map((post) => (
                                <article key={post.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <Link
                                                href={`/profile/${post.user.username ?? ''}`}
                                                className="text-sm font-semibold hover:underline"
                                            >
                                                {getPostDisplayName(post.user)}
                                            </Link>
                                            <p className="text-xs text-slate-500">@{post.user.username ?? 'unknown'}</p>
                                        </div>
                                        <span className="text-xs text-slate-400">{post.created_at ?? 'Unknown date'}</span>
                                    </div>

                                    <Link href={`/post/${post.id}`} className="mt-3 block">
                                        <TextWithMentions
                                            text={post.content || 'Media-only post'}
                                            className="whitespace-pre-wrap text-sm leading-6 text-slate-700 transition hover:text-slate-950 dark:text-slate-300 dark:hover:text-slate-100"
                                        />
                                    </Link>

                                    {post.parent_id && (
                                        <p className="mt-2 text-xs text-slate-500">Replying in thread #{post.parent_id}</p>
                                    )}

                                    {post.hashtags.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {post.hashtags.map((hashtag) => (
                                                <Link
                                                    key={hashtag.id}
                                                    href={`/hashtag/${hashtag.id}`}
                                                    className={tagClass}
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
                                            {post.media.length > 2 && (
                                                <p className="text-xs text-slate-500">
                                                    +{post.media.length - 2} more attachment(s)
                                                </p>
                                            )}
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
                                        {post.can_edit && (
                                            <Link href={`/post/${post.id}/edit`} className="font-semibold text-slate-600 hover:underline dark:text-slate-300">
                                                Edit
                                            </Link>
                                        )}
                                        {post.can_delete && (
                                            <button
                                                type="button"
                                                onClick={() => router.delete(`/post/${post.id}`, { preserveScroll: true })}
                                                className="font-semibold text-rose-600 hover:underline"
                                            >
                                                Delete
                                            </button>
                                        )}
                                        <Link href={`/post/${post.id}`} className={`font-semibold hover:underline ${accentTextClass}`}>
                                            Open post
                                        </Link>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <aside className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Discover</h2>
                    <div className="mt-4 space-y-2 text-sm">
                        {trendingHashtags.length === 0 && (
                            <div className="rounded-lg border border-dashed border-slate-200 p-3 text-slate-500 dark:border-slate-800">
                                No hashtags yet.
                            </div>
                        )}
                        {trendingHashtags.map((hashtag) => (
                            <Link
                                key={hashtag.id}
                                href={`/hashtag/${hashtag.id}`}
                                className="block rounded-lg border border-slate-200 p-3 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
                            >
                                <p className="font-semibold">#{hashtag.name}</p>
                                <p className="mt-1 text-xs text-slate-500">{hashtag.posts_count} post(s)</p>
                            </Link>
                        ))}
                    </div>
                </aside>
            </main>
        </>
    );
}

