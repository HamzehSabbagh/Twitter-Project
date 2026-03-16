<?php

namespace App\Http\Controllers;

use App\Models\Hashtag;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class HashtagController extends Controller
{
    public function show(Hashtag $hashtag): Response
    {
        $userId = request()->user()?->id;
        /** @var FilesystemAdapter $publicDisk */
        $publicDisk = Storage::disk('public');
        $isAdmin = strtolower((string) request()->user()?->role?->name) === 'admin';
        $hashtag->load([
            'posts' => fn ($query) => $query
                ->with([
                    'user:id,first_name,last_name,username',
                    'media:id,post_id,type,path,mime_type,duration_seconds,size_bytes',
                    'hashtags:id,name',
                    'likes' => fn ($likeQuery) => $likeQuery
                        ->where('user_id', $userId)
                        ->select('id', 'user_id', 'post_id'),
                    'reposts' => fn ($repostQuery) => $repostQuery
                        ->where('user_id', $userId)
                        ->select('id', 'user_id', 'post_id'),
                ])
                ->withCount(['likes', 'comments', 'reposts'])
                ->latest(),
        ]);

        return Inertia::render('hashtag/show', [
            'hashtag' => [
                'id' => $hashtag->id,
                'name' => $hashtag->name,
                'posts' => $hashtag->posts->map(fn ($post) => [
                    'id' => $post->id,
                    'content' => $post->content,
                    'parent_id' => $post->parent_id,
                    'created_at' => $post->created_at?->toDateTimeString(),
                    'likes_count' => $post->likes_count,
                    'comments_count' => $post->comments_count,
                    'reposts_count' => $post->reposts_count,
                    'liked_by_user' => $post->likes->isNotEmpty(),
                    'reposted_by_user' => $post->reposts->isNotEmpty(),
                    'can_delete' => $post->user_id === $userId || $isAdmin,
                    'user' => [
                        'first_name' => $post->user?->first_name,
                        'last_name' => $post->user?->last_name,
                        'username' => $post->user?->username,
                    ],
                    'hashtags' => $post->hashtags->map(fn ($tag) => [
                        'id' => $tag->id,
                        'name' => $tag->name,
                    ])->values(),
                    'media' => $post->media->map(fn ($media) => [
                        'id' => $media->id,
                        'type' => $media->type,
                        'path' => $media->path,
                        'url' => $publicDisk->url($media->path),
                        'mime_type' => $media->mime_type,
                    ])->values(),
                ])->values(),
            ],
        ]);
    }
}
