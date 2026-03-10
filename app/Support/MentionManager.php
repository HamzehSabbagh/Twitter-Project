<?php

namespace App\Support;

use App\Models\Comment;
use App\Models\Mention;
use App\Models\Post;
use App\Models\User;

class MentionManager
{
    public function syncPostMentions(Post $post, int $mentionerId, ?string $content): void
    {
        Mention::query()->where('post_id', $post->id)->delete();

        $mentionedUserIds = $this->resolveMentionedUserIds($content, $mentionerId);

        foreach ($mentionedUserIds as $mentionedUserId) {
            Mention::create([
                'mentioned_user_id' => $mentionedUserId,
                'mentioner_id' => $mentionerId,
                'post_id' => $post->id,
            ]);
        }
    }

    public function syncCommentMentions(Comment $comment, int $mentionerId, ?string $content): void
    {
        Mention::query()->where('comment_id', $comment->id)->delete();

        $mentionedUserIds = $this->resolveMentionedUserIds($content, $mentionerId);

        foreach ($mentionedUserIds as $mentionedUserId) {
            Mention::create([
                'mentioned_user_id' => $mentionedUserId,
                'mentioner_id' => $mentionerId,
                'comment_id' => $comment->id,
            ]);
        }
    }

    /**
     * @return array<int, int>
     */
    public function resolveMentionedUserIds(?string $content, int $mentionerId): array
    {
        if (! $content) {
            return [];
        }

        preg_match_all('/@([A-Za-z0-9_]+)/', $content, $matches);

        $usernames = collect($matches[1] ?? [])
            ->map(fn ($username) => trim((string) $username))
            ->filter()
            ->unique()
            ->values();

        if ($usernames->isEmpty()) {
            return [];
        }

        return User::query()
            ->whereIn('username', $usernames)
            ->where('id', '!=', $mentionerId)
            ->pluck('id')
            ->all();
    }
}
