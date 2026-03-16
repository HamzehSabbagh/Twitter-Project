<?php

namespace App\Http\Controllers;

use App\Models\Hashtag;
use App\Models\Post;
use App\Models\PostMedia;
use App\Models\Repost;
use App\Models\User;
use App\Support\MentionManager;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PostController extends Controller
{
    public function __construct(private MentionManager $mentionManager)
    {
    }

    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $userId = request()->user()?->id;
        /** @var FilesystemAdapter $publicDisk */
        $publicDisk = Storage::disk('public');
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
                    'url' => $publicDisk->url($media->path),
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

    public function explore(): Response
    {
        $viewer = request()->user();
        $userId = $viewer?->id;
        /** @var FilesystemAdapter $publicDisk */
        $publicDisk = Storage::disk('public');
        $isAdmin = strtolower((string) $viewer?->role?->name) === 'admin';

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
            ->orderByDesc(DB::raw('(likes_count + comments_count + reposts_count)'))
            ->latest()
            ->limit(24)
            ->get();

        $trendingHashtags = Hashtag::query()
            ->whereNotNull('name')
            ->where('name', '!=', '')
            ->has('posts')
            ->withCount('posts')
            ->orderByDesc('posts_count')
            ->limit(8)
            ->get();

        $suggestedUsers = User::query()
            ->select(['id', 'first_name', 'last_name', 'username'])
            ->where('id', '!=', $userId)
            ->whereDoesntHave('followers', fn ($query) => $query->where('follower_id', $userId))
            ->withCount(['followers', 'posts'])
            ->orderByDesc('followers_count')
            ->orderByDesc('posts_count')
            ->limit(6)
            ->get();

        return Inertia::render('explore', [
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
                    'url' => $publicDisk->url($media->path),
                    'mime_type' => $media->mime_type,
                ])->values(),
            ])->values(),
            'trendingHashtags' => $trendingHashtags->map(fn ($hashtag) => [
                'id' => $hashtag->id,
                'name' => $hashtag->name,
                'posts_count' => $hashtag->posts_count,
            ])->values(),
            'suggestedUsers' => $suggestedUsers->map(fn ($user) => [
                'id' => $user->id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'username' => $user->username,
                'followers_count' => $user->followers_count,
                'posts_count' => $user->posts_count,
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
            $this->mentionManager->syncPostMentions($post, $request->user()->id, $validated['content'] ?? null);
        });

        return redirect()->route('home')->with('status', 'Post created.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Post $post): Response
    {
        $userId = request()->user()?->id;
        /** @var FilesystemAdapter $publicDisk */
        $publicDisk = Storage::disk('public');
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
                    'url' => $publicDisk->url($media->path),
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
                    'can_edit' => $comment->user_id === $userId || $isAdmin,
                    'can_delete' => $comment->user_id === $userId || $isAdmin,
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
                        'can_edit' => $reply->user_id === $userId || $isAdmin,
                        'can_delete' => $reply->user_id === $userId || $isAdmin,
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
        /** @var FilesystemAdapter $publicDisk */
        $publicDisk = Storage::disk('public');

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
                    'url' => $publicDisk->url($media->path),
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

        $validated = $this->validatePostPayload($request, $post);

        DB::transaction(function () use ($request, $validated, $post) {
            $post->update([
                'content' => $validated['content'] ?? null,
                'parent_id' => $validated['parent_id'] ?? null,
            ]);

            $this->removeMediaFiles($validated['remove_media'] ?? [], $post);
            $this->storeMediaFiles($request->file('media', []), $post);
            $post->hashtags()->sync($this->resolveHashtagIds($validated['content'] ?? null));
            $this->mentionManager->syncPostMentions($post, $request->user()->id, $validated['content'] ?? null);
        });

        return redirect()->route('home')->with('status', 'Post updated.');
    }

    /**
     * @param  array<int, int|string>  $mediaIds
     */
    private function removeMediaFiles(array $mediaIds, Post $post): void
    {
        if ($mediaIds === []) {
            return;
        }

        $mediaItems = $post->media()->whereIn('id', $mediaIds)->get();

        foreach ($mediaItems as $media) {
            Storage::disk('public')->delete($media->path);
            $media->delete();
        }
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
            $path = $this->storeUploadedFile($file, $post, $type);

            PostMedia::create([
                'post_id' => $post->id,
                'type' => $type,
                'path' => $path,
                'mime_type' => $mimeType,
                'duration_seconds' => null,
                'size_bytes' => Storage::disk('public')->size($path),
            ]);
        }
    }

    private function storeUploadedFile(UploadedFile $file, Post $post, string $type): string
    {
        if ($type === 'video' && $this->shouldOptimizeVideo($file)) {
            $optimizedPath = $this->optimizeVideoForFastStart($file, $post);

            if ($optimizedPath !== null) {
                return $optimizedPath;
            }
        }

        return $file->store("posts/{$post->id}", 'public');
    }

    private function shouldOptimizeVideo(UploadedFile $file): bool
    {
        $extension = strtolower($file->getClientOriginalExtension());

        return $extension === 'mp4' || ($file->getMimeType() ?? '') === 'video/mp4';
    }

    private function optimizeVideoForFastStart(UploadedFile $file, Post $post): ?string
    {
        $disk = Storage::disk('public');
        $directory = "posts/{$post->id}";
        $relativePath = "{$directory}/".Str::uuid().'.mp4';
        $absolutePath = $disk->path($relativePath);

        $disk->makeDirectory($directory);

        $process = Process::timeout(300)->run([
            $this->ffmpegBinary(),
            '-y',
            '-i',
            $file->getRealPath(),
            '-movflags',
            '+faststart',
            '-c',
            'copy',
            $absolutePath,
        ]);

        if ($process->successful()) {
            return $relativePath;
        }

        if (file_exists($absolutePath)) {
            @unlink($absolutePath);
        }

        Log::warning('FFmpeg faststart optimization failed for uploaded video.', [
            'post_id' => $post->id,
            'file_name' => $file->getClientOriginalName(),
            'error' => $process->errorOutput(),
        ]);

        return null;
    }

    private function ffmpegBinary(): string
    {
        return (string) (config('app.ffmpeg_binary') ?: env('FFMPEG_BINARY', 'ffmpeg'));
    }

    /**
     * @return array<string, mixed>
     */
    private function validatePostPayload(Request $request, ?Post $post = null): array
    {
        $rules = [
            'content' => ['nullable', 'string'],
            'parent_id' => ['nullable', 'exists:posts,id'],
            'media' => ['nullable', 'array', 'max:4'],
            'media.*' => ['file', 'max:51200', 'mimetypes:image/jpeg,image/png,image/webp,video/mp4,video/webm,audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/webm'],
            'remove_media' => ['nullable', 'array'],
            'remove_media.*' => ['integer'],
        ];

        if ($post) {
            $rules['remove_media.*'][] = Rule::exists('post_media', 'id')->where(
                fn ($query) => $query->where('post_id', $post->id)
            );
        } else {
            $rules['content'][] = 'required_without:media';
        }

        $validated = $request->validate(
            [
                ...$rules,
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

        if ($post) {
            $uploadedMedia = $request->file('media', []);
            $uploadedMediaCount = $uploadedMedia instanceof UploadedFile ? 1 : count($uploadedMedia ?? []);
            $remainingMediaCount = $post->media()->count() - count($validated['remove_media'] ?? []) + $uploadedMediaCount;

            if (blank($validated['content'] ?? null) && $remainingMediaCount <= 0) {
                throw \Illuminate\Validation\ValidationException::withMessages([
                    'content' => 'Write something or keep at least one file attached.',
                ]);
            }
        }

        return $validated;
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
