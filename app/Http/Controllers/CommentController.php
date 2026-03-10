<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Hashtag;
use App\Support\MentionManager;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class CommentController extends Controller
{
    public function __construct(private MentionManager $mentionManager)
    {
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return redirect('/home');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return redirect('/home');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'post_id' => ['required', 'exists:posts,id'],
            'content' => ['required', 'string'],
            'parent_id' => ['nullable', 'exists:comments,id'],
        ]);

        $comment = Comment::create([
            'user_id' => $request->user()->id,
            'post_id' => $validated['post_id'],
            'content' => $validated['content'],
            'parent_id' => $validated['parent_id'] ?? null,
        ]);

        $comment->hashtags()->sync($this->resolveHashtagIds($validated['content']));
        $this->mentionManager->syncCommentMentions($comment, $request->user()->id, $validated['content']);

        return redirect()->back()->with('status', 'Comment created.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Comment $comment)
    {
        return redirect('/home');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Comment $comment)
    {
        return redirect('/home');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Comment $comment): RedirectResponse
    {
        $user = $request->user();
        $isAdmin = strtolower((string) $user?->role?->name) === 'admin';

        abort_unless($user?->id === $comment->user_id || $isAdmin, 403);

        $validated = $request->validate([
            'content' => ['required', 'string'],
        ]);

        $comment->update($validated);
        $comment->hashtags()->sync($this->resolveHashtagIds($validated['content']));
        $this->mentionManager->syncCommentMentions($comment, $user->id, $validated['content']);

        return redirect()->back()->with('status', 'Comment updated.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Comment $comment): RedirectResponse
    {
        $user = request()->user();
        $isAdmin = strtolower((string) $user?->role?->name) === 'admin';

        abort_unless($user?->id === $comment->user_id || $isAdmin, 403);

        $comment->delete();

        return redirect()->back()->with('status', 'Comment deleted.');
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
            ->map(function ($tag) {
                return Hashtag::query()->firstOrCreate(['name' => $tag])->id;
            })
            ->all();
    }
}
