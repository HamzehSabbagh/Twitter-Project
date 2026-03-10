import { Head, Link, router } from '@inertiajs/react';
import { TextWithMentions } from '@/components/text-with-mentions';

type ProfilePageProps = {
    profile: {
        first_name: string;
        last_name: string;
        username: string;
        bio: string | null;
        location: string | null;
        role_name: string | null;
        picture_url: string;
        cover_url: string;
        is_owner: boolean;
        is_following: boolean;
        followers_count: number;
        following_count: number;
        posts: {
            id: number;
            content: string | null;
            created_at: string | null;
            likes_count: number;
            comments_count: number;
            reposts_count: number;
            can_delete: boolean;
            hashtags: {
                id: number;
                name: string;
            }[];
            media: {
                id: number;
                type: string;
                url: string;
            }[];
        }[];
    };
};

function renderMedia(type: string, url: string) {
    if (type === 'image') {
        return <img src={url} alt="Post media" className="max-h-80 w-full rounded-2xl object-cover" />;
    }

    if (type === 'video') {
        return <video src={url} preload="metadata" controls className="max-h-80 w-full rounded-2xl bg-black" />;
    }

    if (type === 'audio') {
        return <audio src={url} controls className="w-full" />;
    }

    return null;
}

export default function ShowProfile({ profile }: ProfilePageProps) {
    const isAdmin = (profile.role_name ?? '').toLowerCase() === 'admin';
    const pageToneClass = isAdmin ? 'bg-rose-50/30 dark:bg-rose-950/10' : '';
    const shellClass = isAdmin
        ? 'border-rose-200 bg-rose-50 dark:border-rose-900/50 dark:bg-rose-950/20'
        : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950';
    const neutralButtonClass = isAdmin
        ? 'border-rose-300 text-rose-700 hover:bg-rose-100 dark:border-rose-800 dark:text-rose-200 dark:hover:bg-rose-950/30'
        : 'border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900';
    const primaryButtonClass = isAdmin
        ? 'bg-rose-600 text-white hover:bg-rose-500'
        : 'bg-slate-900 text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300';
    const tagClass = isAdmin
        ? 'rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-950/30 dark:text-rose-300'
        : 'rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700 dark:bg-cyan-950/30 dark:text-cyan-300';

    return (
        <>
            <Head title={`@${profile.username}`} />

            <main className={`mx-auto min-h-screen w-full max-w-5xl space-y-5 px-4 py-6 ${pageToneClass}`}>
                <header className={`overflow-hidden rounded-3xl border shadow-sm ${shellClass}`}>
                    <div className="relative">
                        <img src={profile.cover_url} alt="Cover" className="h-48 w-full object-cover sm:h-60" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
                        <img
                            src={profile.picture_url}
                            alt="Profile"
                            className="absolute -bottom-10 left-6 h-24 w-24 rounded-full border-4 border-white object-cover shadow-lg dark:border-slate-950"
                        />
                    </div>
                    <div className="px-6 pb-6 pt-14">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-semibold">
                                    {profile.first_name} {profile.last_name}
                                </h1>
                                <p className="text-sm text-slate-500">@{profile.username}</p>
                                {profile.role_name && (
                                    <p className={`mt-2 text-xs font-semibold uppercase tracking-wide ${isAdmin ? 'text-rose-600 dark:text-rose-400' : 'text-cyan-600'}`}>
                                        {profile.role_name}
                                    </p>
                                )}
                            </div>
                            <div className="flex items-center gap-3">
                                <Link
                                    href="/home"
                                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${neutralButtonClass}`}
                                >
                                    Back
                                </Link>
                                {profile.is_owner && (
                                    <Link
                                        href="/profile/edit"
                                        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${primaryButtonClass}`}
                                    >
                                        Edit profile
                                    </Link>
                                )}
                                {!profile.is_owner && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            profile.is_following
                                                ? router.delete(`/profile/${profile.username}/follow`)
                                                : router.post(`/profile/${profile.username}/follow`)
                                        }
                                        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                                            profile.is_following
                                                ? `border ${neutralButtonClass}`
                                                : primaryButtonClass
                                        }`}
                                    >
                                        {profile.is_following ? 'Unfollow' : 'Follow'}
                                    </button>
                                )}
                            </div>
                        </div>

                        {(profile.bio || profile.location) && (
                            <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                                {profile.bio && <p>{profile.bio}</p>}
                                {profile.location && <p>{profile.location}</p>}
                            </div>
                        )}

                        <div className="mt-4 flex items-center gap-6 text-sm text-slate-500">
                            <span>
                                <strong className="text-slate-900 dark:text-slate-100">{profile.following_count}</strong> Following
                            </span>
                            <span>
                                <strong className="text-slate-900 dark:text-slate-100">{profile.followers_count}</strong> Followers
                            </span>
                        </div>
                    </div>
                </header>

                <section className={`rounded-3xl border p-5 shadow-sm ${shellClass}`}>
                    <div className="flex items-center justify-between gap-3">
                        <h2 className="text-lg font-semibold">Posts</h2>
                        <span className="text-sm text-slate-500">{profile.posts.length} total</span>
                    </div>

                    <div className="mt-4 space-y-4">
                        {profile.posts.length === 0 && (
                            <p className="text-sm text-slate-500">This user has not posted yet.</p>
                        )}

                        {profile.posts.map((post) => (
                            <article key={post.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                                <Link href={`/post/${post.id}`} className="block">
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
                                                {renderMedia(media.type, media.url)}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
                                    <span>{post.likes_count} likes</span>
                                    <span>{post.comments_count} comments</span>
                                    <span>{post.reposts_count} reposts</span>
                                    {post.can_delete && (
                                        <button
                                            type="button"
                                            onClick={() => router.delete(`/post/${post.id}`)}
                                            className="font-semibold text-rose-600 hover:underline"
                                        >
                                            Delete
                                        </button>
                                    )}
                                    <span>{post.created_at ?? 'Unknown date'}</span>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            </main>
        </>
    );
}
