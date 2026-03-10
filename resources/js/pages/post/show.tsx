import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { MentionTextarea } from '@/components/mention-textarea';
import { TextWithMentions } from '@/components/text-with-mentions';

type UserSummary = {
    first_name: string | null;
    last_name: string | null;
    username: string | null;
};

type MediaItem = {
    id: number;
    type: string;
    path: string;
    url: string;
    mime_type: string;
    duration_seconds: number | null;
    size_bytes: number;
};

type ReplyItem = {
    id: number;
    content: string;
    created_at: string | null;
    likes_count: number;
    liked_by_user: boolean;
    can_edit: boolean;
    can_delete: boolean;
    hashtags: {
        id: number;
        name: string;
    }[];
    user: UserSummary;
};

type CommentItem = {
    id: number;
    content: string;
    created_at: string | null;
    likes_count: number;
    liked_by_user: boolean;
    can_edit: boolean;
    can_delete: boolean;
    hashtags: {
        id: number;
        name: string;
    }[];
    user: UserSummary;
    replies: ReplyItem[];
};

type ShowPostProps = {
    post: {
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
        user: UserSummary;
        hashtags: {
            id: number;
            name: string;
        }[];
        media: MediaItem[];
        comments: CommentItem[];
    };
};

type CommentFormData = {
    post_id: string;
    content: string;
    parent_id: string;
};

type EditCommentFormData = {
    content: string;
};

function displayName(user: UserSummary) {
    const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
    return fullName || user.username || 'Unknown user';
}

function formatKind(type: string) {
    return type.charAt(0).toUpperCase() + type.slice(1);
}

function renderMedia(item: MediaItem) {
    if (item.type === 'image') {
        return <img src={item.url} alt="Post media" className="max-h-96 w-full rounded-xl object-cover" />;
    }

    if (item.type === 'video') {
        return <video src={item.url} preload="metadata" controls className="max-h-96 w-full rounded-xl bg-black" />;
    }

    if (item.type === 'audio') {
        return <audio src={item.url} controls className="w-full" />;
    }

    return (
        <a href={item.url} target="_blank" rel="noreferrer" className="text-sm font-medium text-cyan-600 underline">
            Open file
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

export default function ShowPost({ post }: ShowPostProps) {
    const [replyTarget, setReplyTarget] = useState<number | null>(null);
    const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
    const commentForm = useForm<CommentFormData>({
        post_id: String(post.id),
        content: '',
        parent_id: '',
    });
    const replyForm = useForm<CommentFormData>({
        post_id: String(post.id),
        content: '',
        parent_id: '',
    });
    const editCommentForm = useForm<EditCommentFormData>({
        content: '',
    });

    return (
        <>
            <Head title="Posts" />

            <main className="mx-auto min-h-screen w-full max-w-4xl space-y-5 px-4 py-6">
                <header className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                    <Link
                        href="/home"
                        className="mb-3 inline-block rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
                    >
                        Back to Home
                    </Link>
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <h1 className="text-2xl font-semibold">Post details</h1>
                            <p className="mt-1 text-sm text-slate-500">
                                Review the full post and its conversation in one place.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            {post.can_edit && (
                                <Link
                                    href={`/post/${post.id}/edit`}
                                    className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
                                >
                                    Edit post
                                </Link>
                            )}
                            {post.can_delete && (
                                <button
                                    type="button"
                                    onClick={() => router.delete(`/post/${post.id}`)}
                                    className="rounded-full bg-rose-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-rose-500"
                                >
                                    Delete post
                                </button>
                            )}
                        </div>
                    </div>
                </header>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <Link href={`/profile/${post.user.username ?? ''}`} className="text-base font-semibold hover:underline">
                                {displayName(post.user)}
                            </Link>
                            <p className="text-sm text-slate-500">@{post.user.username ?? 'unknown'}</p>
                        </div>
                        <span className="text-xs text-slate-400">{post.created_at ?? 'Unknown date'}</span>
                    </div>

                    <div className="mt-4 space-y-4">
                        <TextWithMentions
                            text={post.content || 'This post has no text content.'}
                            className="whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:text-slate-200"
                        />

                        {post.parent_id && (
                            <p className="text-xs text-slate-500">Part of thread started from post #{post.parent_id}.</p>
                        )}

                        {post.hashtags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {post.hashtags.map((hashtag) => (
                                    <Link
                                        key={hashtag.id}
                                        href={`/hashtag/${hashtag.id}`}
                                        className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700 transition hover:bg-cyan-100 dark:bg-cyan-950/30 dark:text-cyan-300 dark:hover:bg-cyan-950/50"
                                    >
                                        #{hashtag.name}
                                    </Link>
                                ))}
                            </div>
                        )}

                        <div className="flex items-center gap-4 text-sm text-slate-500">
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
                        </div>

                        {post.media.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-sm font-medium">Attached media</p>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {post.media.map((item) => (
                                        <div
                                            key={item.id}
                                            className="rounded-xl border border-slate-200 p-3 dark:border-slate-800"
                                        >
                                            <p className="text-sm font-semibold">{formatKind(item.type)}</p>
                                            <div className="mt-3">{renderMedia(item)}</div>
                                            <p className="mt-3 break-all text-xs text-slate-500">{item.path}</p>
                                            <p className="mt-2 text-xs text-slate-400">{item.mime_type}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
                    <h2 className="text-lg font-semibold">Add a comment</h2>
                    <form
                        className="mt-4 space-y-4"
                        onSubmit={(e) => {
                            e.preventDefault();
                            commentForm.post('/comment', {
                                onSuccess: () => commentForm.reset('content', 'parent_id'),
                            });
                        }}
                    >
                        <MentionTextarea
                            value={commentForm.data.content}
                            onChange={(value) => commentForm.setData('content', value)}
                            className="min-h-28 w-full rounded-xl border border-slate-300 p-3 dark:border-slate-700 dark:bg-slate-900"
                            placeholder="Write a reply"
                        />

                        {Object.values(commentForm.errors).length > 0 && (
                            <p className="text-sm text-rose-500">{Object.values(commentForm.errors)[0]}</p>
                        )}

                        <button
                            type="submit"
                            disabled={commentForm.processing}
                            className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
                        >
                            {commentForm.processing ? 'Posting...' : 'Post comment'}
                        </button>
                    </form>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
                    <div className="flex items-center justify-between gap-3">
                        <h2 className="text-lg font-semibold">Comments</h2>
                        <span className="text-sm text-slate-500">{post.comments_count} total</span>
                    </div>

                    <div className="mt-4 space-y-4">
                        {post.comments.length === 0 && (
                            <p className="text-sm text-slate-500">No comments yet. Start the conversation.</p>
                        )}

                        {post.comments.map((comment) => (
                            <article
                                key={comment.id}
                                className="rounded-xl border border-slate-200 p-4 dark:border-slate-800"
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <Link href={`/profile/${comment.user.username ?? ''}`} className="text-sm font-semibold hover:underline">
                                            {displayName(comment.user)}
                                        </Link>
                                        <p className="text-xs text-slate-500">@{comment.user.username ?? 'unknown'}</p>
                                    </div>
                                    <span className="text-xs text-slate-400">{comment.created_at ?? 'Unknown date'}</span>
                                </div>

                                <TextWithMentions
                                    text={comment.content}
                                    className="mt-3 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-200"
                                />

                                {comment.hashtags.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {comment.hashtags.map((hashtag) => (
                                            <Link
                                                key={hashtag.id}
                                                href={`/hashtag/${hashtag.id}`}
                                                className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700 transition hover:bg-cyan-100 dark:bg-cyan-950/30 dark:text-cyan-300 dark:hover:bg-cyan-950/50"
                                            >
                                                #{hashtag.name}
                                            </Link>
                                        ))}
                                    </div>
                                )}

                                <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                                    <LikeButton
                                        liked={comment.liked_by_user}
                                        count={comment.likes_count}
                                        onClick={() =>
                                            comment.liked_by_user
                                                ? router.delete(`/comment/${comment.id}/like`, { preserveScroll: true })
                                                : router.post(`/comment/${comment.id}/like`, {}, { preserveScroll: true })
                                        }
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setReplyTarget(comment.id);
                                            replyForm.setData('parent_id', String(comment.id));
                                            replyForm.setData('content', '');
                                            setEditingCommentId(null);
                                        }}
                                        className="font-semibold text-cyan-600 hover:underline"
                                    >
                                        Reply
                                    </button>
                                    {comment.can_edit && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditingCommentId(comment.id);
                                                editCommentForm.setData('content', comment.content);
                                                editCommentForm.clearErrors();
                                                setReplyTarget(null);
                                            }}
                                            className="font-semibold text-slate-600 hover:underline dark:text-slate-300"
                                        >
                                            Edit
                                        </button>
                                    )}
                                    {comment.can_delete && (
                                        <button
                                            type="button"
                                            onClick={() => router.delete(`/comment/${comment.id}`, { preserveScroll: true })}
                                            className="font-semibold text-rose-600 hover:underline"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>

                                {editingCommentId === comment.id && (
                                    <form
                                        className="mt-4 space-y-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-900"
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            editCommentForm.patch(`/comment/${comment.id}`, {
                                                preserveScroll: true,
                                                onSuccess: () => {
                                                    setEditingCommentId(null);
                                                    editCommentForm.reset();
                                                },
                                            });
                                        }}
                                    >
                                        <MentionTextarea
                                            value={editCommentForm.data.content}
                                            onChange={(value) => editCommentForm.setData('content', value)}
                                            className="min-h-24 w-full rounded-xl border border-slate-300 p-3 dark:border-slate-700 dark:bg-slate-950"
                                            placeholder="Edit comment"
                                        />
                                        {Object.values(editCommentForm.errors).length > 0 && (
                                            <p className="text-sm text-rose-500">{Object.values(editCommentForm.errors)[0]}</p>
                                        )}
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="submit"
                                                disabled={editCommentForm.processing}
                                                className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
                                            >
                                                {editCommentForm.processing ? 'Saving...' : 'Save edit'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setEditingCommentId(null);
                                                    editCommentForm.reset();
                                                }}
                                                className="text-xs font-semibold text-slate-500"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                )}

                                {replyTarget === comment.id && (
                                    <form
                                        className="mt-4 space-y-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-900"
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            replyForm.post('/comment', {
                                                preserveScroll: true,
                                                onSuccess: () => {
                                                    setReplyTarget(null);
                                                    replyForm.reset('content', 'parent_id');
                                                },
                                            });
                                        }}
                                    >
                                        <MentionTextarea
                                            value={replyForm.data.content}
                                            onChange={(value) => replyForm.setData('content', value)}
                                            className="min-h-24 w-full rounded-xl border border-slate-300 p-3 dark:border-slate-700 dark:bg-slate-950"
                                            placeholder="Write a reply"
                                        />
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="submit"
                                                disabled={replyForm.processing}
                                                className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
                                            >
                                                {replyForm.processing ? 'Replying...' : 'Send reply'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setReplyTarget(null);
                                                    replyForm.reset('content', 'parent_id');
                                                }}
                                                className="text-xs font-semibold text-slate-500"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                )}

                                {comment.replies.length > 0 && (
                                    <div className="mt-4 space-y-3 border-l border-slate-200 pl-4 dark:border-slate-800">
                                        {comment.replies.map((reply) => (
                                            <div key={reply.id} className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900">
                                                <div className="flex items-center justify-between gap-3">
                                                    <div>
                                                        <Link href={`/profile/${reply.user.username ?? ''}`} className="text-sm font-semibold hover:underline">
                                                            {displayName(reply.user)}
                                                        </Link>
                                                        <p className="text-xs text-slate-500">
                                                            @{reply.user.username ?? 'unknown'}
                                                        </p>
                                                    </div>
                                                    <span className="text-xs text-slate-400">
                                                        {reply.created_at ?? 'Unknown date'}
                                                    </span>
                                                </div>
                                                <TextWithMentions
                                                    text={reply.content}
                                                    className="mt-2 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-200"
                                                />
                                                {reply.hashtags.length > 0 && (
                                                    <div className="mt-3 flex flex-wrap gap-2">
                                                        {reply.hashtags.map((hashtag) => (
                                                            <Link
                                                                key={hashtag.id}
                                                                href={`/hashtag/${hashtag.id}`}
                                                                className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700 transition hover:bg-cyan-100 dark:bg-cyan-950/30 dark:text-cyan-300 dark:hover:bg-cyan-950/50"
                                                            >
                                                                #{hashtag.name}
                                                            </Link>
                                                        ))}
                                                    </div>
                                                )}
                                                <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                                                    <LikeButton
                                                        liked={reply.liked_by_user}
                                                        count={reply.likes_count}
                                                        onClick={() =>
                                                            reply.liked_by_user
                                                                ? router.delete(`/comment/${reply.id}/like`, { preserveScroll: true })
                                                                : router.post(`/comment/${reply.id}/like`, {}, { preserveScroll: true })
                                                        }
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setReplyTarget(reply.id);
                                                            replyForm.setData('parent_id', String(reply.id));
                                                            replyForm.setData('content', '');
                                                            setEditingCommentId(null);
                                                        }}
                                                        className="font-semibold text-cyan-600 hover:underline"
                                                    >
                                                        Reply
                                                    </button>
                                                    {reply.can_edit && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setEditingCommentId(reply.id);
                                                                editCommentForm.setData('content', reply.content);
                                                                editCommentForm.clearErrors();
                                                                setReplyTarget(null);
                                                            }}
                                                            className="font-semibold text-slate-600 hover:underline dark:text-slate-300"
                                                        >
                                                            Edit
                                                        </button>
                                                    )}
                                                    {reply.can_delete && (
                                                        <button
                                                            type="button"
                                                            onClick={() => router.delete(`/comment/${reply.id}`, { preserveScroll: true })}
                                                            className="font-semibold text-rose-600 hover:underline"
                                                        >
                                                            Delete
                                                        </button>
                                                    )}
                                                </div>

                                                {editingCommentId === reply.id && (
                                                    <form
                                                        className="mt-4 space-y-3 rounded-xl bg-white p-3 dark:bg-slate-950"
                                                        onSubmit={(e) => {
                                                            e.preventDefault();
                                                            editCommentForm.patch(`/comment/${reply.id}`, {
                                                                preserveScroll: true,
                                                                onSuccess: () => {
                                                                    setEditingCommentId(null);
                                                                    editCommentForm.reset();
                                                                },
                                                            });
                                                        }}
                                                    >
                                                        <MentionTextarea
                                                            value={editCommentForm.data.content}
                                                            onChange={(value) => editCommentForm.setData('content', value)}
                                                            className="min-h-24 w-full rounded-xl border border-slate-300 p-3 dark:border-slate-700 dark:bg-slate-900"
                                                            placeholder="Edit reply"
                                                        />
                                                        {Object.values(editCommentForm.errors).length > 0 && (
                                                            <p className="text-sm text-rose-500">{Object.values(editCommentForm.errors)[0]}</p>
                                                        )}
                                                        <div className="flex items-center gap-3">
                                                            <button
                                                                type="submit"
                                                                disabled={editCommentForm.processing}
                                                                className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
                                                            >
                                                                {editCommentForm.processing ? 'Saving...' : 'Save edit'}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setEditingCommentId(null);
                                                                    editCommentForm.reset();
                                                                }}
                                                                className="text-xs font-semibold text-slate-500"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </form>
                                                )}

                                                {replyTarget === reply.id && (
                                                    <form
                                                        className="mt-4 space-y-3 rounded-xl bg-white p-3 dark:bg-slate-950"
                                                        onSubmit={(e) => {
                                                            e.preventDefault();
                                                            replyForm.post('/comment', {
                                                                preserveScroll: true,
                                                                onSuccess: () => {
                                                                    setReplyTarget(null);
                                                                    replyForm.reset('content', 'parent_id');
                                                                },
                                                            });
                                                        }}
                                                    >
                                                        <MentionTextarea
                                                            value={replyForm.data.content}
                                                            onChange={(value) => replyForm.setData('content', value)}
                                                            className="min-h-24 w-full rounded-xl border border-slate-300 p-3 dark:border-slate-700 dark:bg-slate-900"
                                                            placeholder="Write a reply"
                                                        />
                                                        <div className="flex items-center gap-3">
                                                            <button
                                                                type="submit"
                                                                disabled={replyForm.processing}
                                                                className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
                                                            >
                                                                {replyForm.processing ? 'Replying...' : 'Send reply'}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setReplyTarget(null);
                                                                    replyForm.reset('content', 'parent_id');
                                                                }}
                                                                className="text-xs font-semibold text-slate-500"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </form>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </article>
                        ))}
                    </div>
                </section>
            </main>
        </>
    );
}
