import { Head, useForm } from '@inertiajs/react';

const MAX_MEDIA_SIZE_BYTES = 50 * 1024 * 1024;

type EditPostProps = {
    post: {
        id: number;
        content: string;
        parent_id: number | null;
        media: {
            id: number;
            type: string;
            path: string;
            url: string;
            mime_type: string;
        }[];
    };
};

type PostFormData = {
    content: string;
    parent_id: string;
    media: File[];
};

export default function EditPost({ post }: EditPostProps) {
    const form = useForm<PostFormData>({
        content: post.content ?? '',
        parent_id: post.parent_id ? String(post.parent_id) : '',
        media: [],
    });

    function appendFiles(files: FileList | null) {
        const selectedFiles = Array.from(files ?? []);
        const oversizedFile = selectedFiles.find((file) => file.size > MAX_MEDIA_SIZE_BYTES);

        if (oversizedFile) {
            form.setError('media', `${oversizedFile.name} is larger than 50 MB.`);
            return;
        }

        form.clearErrors('media');
        form.setData('media', [...form.data.media, ...selectedFiles]);
    }

    return (
        <>
            <Head title="Edit post" />

            <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-6">
                <header className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                    <a
                        href="/home"
                        className="mb-3 inline-block rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
                    >
                        Back to Home
                    </a>
                    <h1 className="text-2xl font-semibold">Edit post</h1>
                    <p className="mt-1 text-sm text-slate-500">Update the content of post #{post.id}.</p>
                </header>

                <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                    <form
                        className="space-y-4"
                        onSubmit={(e) => {
                            e.preventDefault();
                            form.transform((data) => ({
                                content: data.content,
                                parent_id: data.parent_id || null,
                                media: data.media,
                            }));
                            form.patch(`/post/${post.id}`, {
                                forceFormData: true,
                            });
                        }}
                    >
                        <div className="space-y-2">
                            <label htmlFor="content" className="text-sm font-medium">
                                Content
                            </label>
                            <textarea
                                id="content"
                                value={form.data.content}
                                onChange={(e) => form.setData('content', e.target.value)}
                                className="min-h-40 w-full rounded-xl border border-slate-300 p-3 dark:border-slate-700 dark:bg-slate-900"
                                placeholder="Edit your post"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="parent_id" className="text-sm font-medium">
                                Parent post ID
                            </label>
                            <input
                                id="parent_id"
                                value={form.data.parent_id}
                                onChange={(e) => form.setData('parent_id', e.target.value)}
                                className="w-full rounded-xl border border-slate-300 p-3 dark:border-slate-700 dark:bg-slate-900"
                                placeholder="Optional"
                            />
                        </div>

                        {post.media.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-sm font-medium">Current media</p>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {post.media.map((media) => (
                                        <div key={media.id} className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                                            <p className="text-sm font-semibold">{media.type}</p>
                                            <p className="mt-2 break-all text-xs text-slate-500">{media.path}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="space-y-3">
                            <p className="text-sm font-medium">Add more media</p>
                            <div className="flex flex-wrap gap-2">
                                <label
                                    htmlFor="edit-post-media-image"
                                    className="cursor-pointer rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
                                >
                                    Add picture
                                </label>
                                <label
                                    htmlFor="edit-post-media-video"
                                    className="cursor-pointer rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
                                >
                                    Add video
                                </label>
                                <label
                                    htmlFor="edit-post-media-audio"
                                    className="cursor-pointer rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
                                >
                                    Add audio
                                </label>
                            </div>
                            <input
                                id="edit-post-media-image"
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                multiple
                                className="hidden"
                                onChange={(e) => appendFiles(e.target.files)}
                            />
                            <input
                                id="edit-post-media-video"
                                type="file"
                                accept="video/mp4,video/webm"
                                multiple
                                className="hidden"
                                onChange={(e) => appendFiles(e.target.files)}
                            />
                            <input
                                id="edit-post-media-audio"
                                type="file"
                                accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/webm"
                                multiple
                                className="hidden"
                                onChange={(e) => appendFiles(e.target.files)}
                            />

                            {form.data.media.length > 0 && (
                                <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="text-sm font-medium">New files</p>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                form.setData('media', []);
                                                form.clearErrors('media');
                                            }}
                                            className="text-xs font-semibold text-slate-500 transition hover:text-slate-900 dark:hover:text-slate-100"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                    <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                                        {form.data.media.map((file, index) => (
                                            <div key={`${file.name}-${index}`} className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-900">
                                                {file.name}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {Object.values(form.errors).length > 0 && (
                            <p className="text-sm text-rose-500">{Object.values(form.errors)[0]}</p>
                        )}

                        <button
                            type="submit"
                            disabled={form.processing}
                            className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
                        >
                            {form.processing ? 'Saving...' : 'Save changes'}
                        </button>
                    </form>
                </section>
            </main>
        </>
    );
}
