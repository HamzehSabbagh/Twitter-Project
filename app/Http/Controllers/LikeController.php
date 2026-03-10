<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Like;
use App\Models\Post;
use App\Models\CommentLike;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class LikeController extends Controller
{
    public function storePost(Request $request, Post $post): RedirectResponse
    {
        Like::query()->firstOrCreate([
            'user_id' => $request->user()->id,
            'post_id' => $post->id,
        ]);

        return redirect()->back()->with('status', 'Post liked.');
    }

    public function destroyPost(Request $request, Post $post): RedirectResponse
    {
        Like::query()
            ->where('user_id', $request->user()->id)
            ->where('post_id', $post->id)
            ->delete();

        return redirect()->back()->with('status', 'Post like removed.');
    }

    public function storeComment(Request $request, Comment $comment): RedirectResponse
    {
        CommentLike::query()->firstOrCreate([
            'user_id' => $request->user()->id,
            'comment_id' => $comment->id,
        ]);

        return redirect()->back()->with('status', 'Comment liked.');
    }

    public function destroyComment(Request $request, Comment $comment): RedirectResponse
    {
        CommentLike::query()
            ->where('user_id', $request->user()->id)
            ->where('comment_id', $comment->id)
            ->delete();

        return redirect()->back()->with('status', 'Comment like removed.');
    }
}
