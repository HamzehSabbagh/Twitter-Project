<?php

namespace App\Http\Controllers;

use App\Models\Hashtag;
use App\Models\Post;
use App\Models\PostMedia;
use App\Models\Repost;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class PostController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $userId = request()->user()?->id;
        $isAdmin = strtolower((string) request()->user()?->role?->name) === 'admin';

        $posts = Post::query()
            ->with([
                'user:id,first_name,last_name,username',
                'media:id,post_id,type,path,mime_type,duration_seconds,size_bytes',
                'hashtags:id,name',
                'likes' => fn ($query) => $query
                    ->where('user_id', $userId)
                    ->select('id', 'user_id', 'post_id'),
                'reposts' => fn ($query) => $query
                    ->where('user_id', $userId)
                    ->select('id', 'user_id', 'post_id'),
            ])
            ->withCount(['likes', 'comments', 'reposts'])
            ->latest()
            ->get();

        $trendingHashtags = Hashtag::query()
            ->whereNotNull('name')
            ->where('name', '!=', '')
            ->has('posts')
            ->withCount('posts')
            ->orderByDesc('posts_count')
            ->limit(5)
            ->get();

        return Inertia::render('home', [
            'posts' => $posts->map(fn ($post) => [
                'id' => $post->id,
                'content' => $post->content,
                'parent_id' => $post->parent_id,
                'created_at' => $post->created_at?->toDateTimeString(),
                'likes_count' => $post->likes_count,
                'comments_count' => $post->comments_count,
                'reposts_count' => $post->reposts_count,
                'liked_by_user' => $post->likes->isNotEmpty(),
                'reposted_by_user' => $post->reposts->isNotEmpty(),
                'can_edit' => $post->user_id === $userId,
                'can_delete' => $post->user_id === $userId || $isAdmin,
                'user' => [
                    'id' => $post->user?->id,
                    'first_name' => $post->user?->first_name,
                    'last_name' => $post->user?->last_name,
                    'username' => $post->user?->username,
                ],
                'hashtags' => $post->hashtags->map(fn ($hashtag) => [
                    'id' => $hashtag->id,
                    'name' => $hashtag->name,
                ])->values(),
                'media' => $post->media->map(fn ($media) => [
                    'id' => $media->id,
                    'type' => $media->type,
                    'path' => $media->path,
                    'url' => Storage::disk('public')->url($media->path),
                    'mime_type' => $media->mime_type,
                ])->values(),
            ])->values(),
            'trendingHashtags' => $trendingHashtags->map(fn ($hashtag) => [
                'id' => $hashtag->id,
                'name' => $hashtag->name,
                'posts_count' => $hashtag->posts_count,
            ])->values(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('post/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validatePostPayload($request);

        DB::transaction(function () use ($request, $validated) {
            $post = Post::create([
                'user_id' => $request->user()->id,
                'content' => $validated['content'] ?? null,
                'parent_id' => $validated['parent_id'] ?? null,
            ]);

            $this->storeMediaFiles($request->file('media', []), $post);
            $post->hashtags()->sync($this->resolveHashtagIds($validated['content'] ?? null));
        });

        return redirect()->route('home')->with('status', 'Post created.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Post $post): Response
    {
        $userId = request()->user()?->id;
        $isAdmin = strtolower((string) request()->user()?->role?->name) === 'admin';

        $post->load([
            'user:id,first_name,last_name,username',
            'media:id,post_id,type,path,mime_type,duration_seconds,size_bytes',
            'hashtags:id,name',
            'likes' => fn ($query) => $query
                ->where('user_id', $userId)
                ->select('id', 'user_id', 'post_id'),
            'reposts' => fn ($query) => $query
                ->where('user_id', $userId)
                ->select('id', 'user_id', 'post_id'),
            'comments' => fn ($query) => $query
                ->whereNull('parent_id')
                ->with([
                    'user:id,first_name,last_name,username',
                    'hashtags:id,name',
                    'likes' => fn ($likeQuery) => $likeQuery
                        ->where('user_id', $userId)
                        ->select('id', 'user_id', 'comment_id'),
                    'replies' => fn ($replyQuery) => $replyQuery
                        ->with([
                            'user:id,first_name,last_name,username',
                            'hashtags:id,name',
                            'likes' => fn ($replyLikeQuery) => $replyLikeQuery
                                ->where('user_id', $userId)
                                ->select('id', 'user_id', 'comment_id'),
                        ])
                        ->withCount('likes')
                        ->latest(),
                ])
                ->withCount('likes')
                ->latest(),
        ])->loadCount(['likes', 'comments', 'reposts']);

        return Inertia::render('post/show', [
            'post' => [
                'id' => $post->id,
                'content' => $post->content,
                'parent_id' => $post->parent_id,
                'created_at' => $post->created_at?->toDateTimeString(),
                'likes_count' => $post->likes_count,
                'comments_count' => $post->comments_count,
                'reposts_count' => $post->reposts_count,
                'liked_by_user' => $post->likes->isNotEmpty(),
                'reposted_by_user' => $post->reposts->isNotEmpty(),
                'can_edit' => $post->user_id === $userId,
                'can_delete' => $post->user_id === $userId || $isAdmin,
                'user' => [
                    'id' => $post->user?->id,
                    'first_name' => $post->user?->first_name,
                    'last_name' => $post->user?->last_name,
                    'username' => $post->user?->username,
                ],
                'hashtags' => $post->hashtags->map(fn ($hashtag) => [
                    'id' => $hashtag->id,
                    'name' => $hashtag->name,
                ])->values(),
                'media' => $post->media->map(fn ($media) => [
                    'id' => $media->id,
                    'type' => $media->type,
                    'path' => $media->path,
                    'url' => Storage::disk('public')->url($media->path),
                    'mime_type' => $media->mime_type,
                    'duration_seconds' => $media->duration_seconds,
                    'size_bytes' => $media->size_bytes,
                ])->values(),
                'comments' => $post->comments->map(fn ($comment) => [
                    'id' => $comment->id,
                    'content' => $comment->content,
                    'created_at' => $comment->created_at?->toDateTimeString(),
                    'likes_count' => $comment->likes_count,
                    'liked_by_user' => $comment->likes->isNotEmpty(),
                    'user' => [
                        'first_name' => $comment->user?->first_name,
                        'last_name' => $comment->user?->last_name,
                        'username' => $comment->user?->username,
                    ],
                    'hashtags' => $comment->hashtags->map(fn ($hashtag) => [
                        'id' => $hashtag->id,
                        'name' => $hashtag->name,
                    ])->values(),
                    'replies' => $comment->replies->map(fn ($reply) => [
                        'id' => $reply->id,
                        'content' => $reply->content,
                        'created_at' => $reply->created_at?->toDateTimeString(),
                        'likes_count' => $reply->likes_count,
                        'liked_by_user' => $reply->likes->isNotEmpty(),
                        'user' => [
                            'first_name' => $reply->user?->first_name,
                            'last_name' => $reply->user?->last_name,
                            'username' => $reply->user?->username,
                        ],
                        'hashtags' => $reply->hashtags->map(fn ($hashtag) => [
                            'id' => $hashtag->id,
                            'name' => $hashtag->name,
                        ])->values(),
                    ])->values(),
                ])->values(),
            ],
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Post $post): Response
    {
        abort_unless(request()->user()?->id === $post->user_id, 403);

        $post->load('media:id,post_id,type,path,mime_type,duration_seconds,size_bytes');

        return Inertia::render('post/edit', [
            'post' => [
                'id' => $post->id,
                'content' => $post->content,
                'parent_id' => $post->parent_id,
                'media' => $post->media->map(fn ($media) => [
                    'id' => $media->id,
                    'type' => $media->type,
                    'path' => $media->path,
                    'url' => Storage::disk('public')->url($media->path),
                    'mime_type' => $media->mime_type,
                ])->values(),
            ],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Post $post): RedirectResponse
    {
        abort_unless($request->user()?->id === $post->user_id, 403);

        $validated = $this->validatePostPayload($request);

        DB::transaction(function () use ($request, $validated, $post) {
            $post->update([
                'content' => $validated['content'] ?? null,
                'parent_id' => $validated['parent_id'] ?? null,
            ]);

            $this->storeMediaFiles($request->file('media', []), $post);
            $post->hashtags()->sync($this->resolveHashtagIds($validated['content'] ?? null));
        });

        return redirect()->route('home')->with('status', 'Post updated.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Post $post): RedirectResponse
    {
        $user = request()->user();
        $isAdmin = strtolower((string) $user?->role?->name) === 'admin';

        abort_unless($user?->id === $post->user_id || $isAdmin, 403);

        foreach ($post->media as $media) {
            Storage::disk('public')->delete($media->path);
        }

        $post->delete();

        return redirect()->route('home')->with('status', 'Post deleted.');
    }

    /**
     * @param  array<int, UploadedFile>|UploadedFile|null  $files
     */
    private function storeMediaFiles(array|UploadedFile|null $files, Post $post): void
    {
        if ($files instanceof UploadedFile) {
            $files = [$files];
        }

        foreach ($files ?? [] as $file) {
            $mimeType = $file->getMimeType() ?? 'application/octet-stream';
            $category = explode('/', $mimeType)[0] ?? 'file';
            $type = in_array($category, ['image', 'video', 'audio'], true) ? $category : 'file';
            $path = $file->store("posts/{$post->id}", 'public');

            PostMedia::create([
                'post_id' => $post->id,
                'type' => $type,
                'path' => $path,
                'mime_type' => $mimeType,
                'duration_seconds' => null,
                'size_bytes' => $file->getSize(),
            ]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function validatePostPayload(Request $request): array
    {
        return $request->validate(
            [
                'content' => ['nullable', 'string', 'required_without:media'],
                'parent_id' => ['nullable', 'exists:posts,id'],
                'media' => ['nullable', 'array', 'max:4'],
                'media.*' => ['file', 'max:51200', 'mimetypes:image/jpeg,image/png,image/webp,video/mp4,video/webm,audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/webm'],
            ],
            [
                'media.max' => 'You can upload up to 4 files per post.',
                'media.*.max' => 'The selected file is too big. Maximum size is 50 MB.',
                'media.*.mimetypes' => 'Only images, videos, and audio files are allowed.',
                'content.required_without' => 'Write something or attach at least one file.',
            ],
            [
                'media.*' => 'file',
            ],
        );
    }

    /**
     * @return array<int, int>
     */
    private function resolveHashtagIds(?string $content): array
    {
        if (! $content) {
            return [];
        }

        preg_match_all('/#([A-Za-z0-9_]+)/', $content, $matches);

        return collect($matches[1] ?? [])
            ->map(fn ($tag) => strtolower($tag))
            ->unique()
            ->values()
            ->map(fn ($tag) => Hashtag::query()->firstOrCreate(['name' => $tag])->id)
            ->all();
    }
}
