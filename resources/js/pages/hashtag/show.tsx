import { Head, Link, router } from '@inertiajs/react';

type HashtagPageProps = {
    hashtag: {
        id: number;
        name: string;
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
    };
};

function displayName(user: HashtagPageProps['hashtag']['posts'][number]['user']) {
    const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
    return fullName || user.username || 'Unknown user';
}

function renderMedia(media: HashtagPageProps['hashtag']['posts'][number]['media'][number]) {
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

export default function ShowHashtag({ hashtag }: HashtagPageProps) {
    return (
        <>
            <Head title={`#${hashtag.name}`} />

            <main className="mx-auto min-h-screen w-full max-w-5xl space-y-5 px-4 py-6">
                <header className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                    <Link
                        href="/home"
                        className="mb-3 inline-block rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
                    >
                        Back to Home
                    </Link>
                    <h1 className="text-3xl font-semibold">#{hashtag.name}</h1>
                    <p className="mt-1 text-sm text-slate-500">{hashtag.posts.length} related post(s)</p>
                </header>

                <section className="space-y-4">
                    {hashtag.posts.length === 0 && (
                        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950">
                            No posts found for this hashtag yet.
                        </div>
                    )}

                    {hashtag.posts.map((post) => (
                        <article key={post.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <Link href={`/profile/${post.user.username ?? ''}`} className="text-sm font-semibold hover:underline">
                                        {displayName(post.user)}
                                    </Link>
                                    <p className="text-xs text-slate-500">@{post.user.username ?? 'unknown'}</p>
                                </div>
                                <span className="text-xs text-slate-400">{post.created_at ?? 'Unknown date'}</span>
                            </div>

                            <Link href={`/post/${post.id}`} className="mt-3 block">
                                <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:text-slate-200">
                                    {post.content || 'Media-only post'}
                                </p>
                            </Link>

                            {post.hashtags.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {post.hashtags.map((tag) => (
                                        <Link
                                            key={tag.id}
                                            href={`/hashtag/${tag.id}`}
                                            className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700 dark:bg-cyan-950/30 dark:text-cyan-300"
                                        >
                                            #{tag.name}
                                        </Link>
                                    ))}
                                </div>
                            )}

                            {post.media.length > 0 && (
                                <div className="mt-4 space-y-3">
                                    {post.media.slice(0, 2).map((media) => (
                                        <div key={media.id} className="overflow-hidden rounded-2xl">
                                            {renderMedia(media)}
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
                                        post.reposted_by_user ? 'text-emerald-600 hover:text-emerald-500' : 'hover:text-slate-700 dark:hover:text-slate-300'
                                    }`}
                                >
                                    {post.reposted_by_user ? 'Undo repost' : 'Repost'} - {post.reposts_count}
                                </button>
                                <span>{post.comments_count} comments</span>
                                <Link href={`/post/${post.id}`} className="font-semibold text-cyan-600 hover:underline">
                                    Open post
                                </Link>
                            </div>
                        </article>
                    ))}
                </section>
            </main>
        </>
    );
}
