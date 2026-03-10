<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\Repost;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class RepostController extends Controller
{
    public function storePost(Request $request, Post $post): RedirectResponse
    {
        Repost::query()->firstOrCreate(
            [
                'user_id' => $request->user()->id,
                'post_id' => $post->id,
            ],
            [
                'comment' => null,
            ]
        );

        return redirect()->back()->with('status', 'Post reposted.');
    }

    public function destroyPost(Request $request, Post $post): RedirectResponse
    {
        Repost::query()
            ->where('user_id', $request->user()->id)
            ->where('post_id', $post->id)
            ->delete();

        return redirect()->back()->with('status', 'Repost removed.');
    }
}
