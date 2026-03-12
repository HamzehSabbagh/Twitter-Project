<?php

namespace App\Support;

use App\Models\Comment;
use App\Models\Mention;
use App\Models\Post;
use App\Models\User;
use App\Notifications\SocialNotification;

class MentionManager
{
    public function syncPostMentions(Post $post, int $mentionerId, ?string $content): void
    {
        $existingMentionedUserIds = Mention::query()
            ->where('post_id', $post->id)
            ->pluck('mentioned_user_id')
            ->all();

        Mention::query()->where('post_id', $post->id)->delete();

        $mentionedUserIds = $this->resolveMentionedUserIds($content, $mentionerId);

        foreach ($mentionedUserIds as $mentionedUserId) {
            Mention::create([
                'mentioned_user_id' => $mentionedUserId,
                'mentioner_id' => $mentionerId,
                'post_id' => $post->id,
            ]);
        }

        $newMentionedUserIds = array_values(array_diff($mentionedUserIds, $existingMentionedUserIds));
        $mentioner = User::query()->find($mentionerId);

        if ($mentioner) {
            $this->notifyMentionedUsers(
                $newMentionedUserIds,
                $mentioner,
                'Mentioned in a post',
                sprintf('@%s mentioned you in a post.', $mentioner->username),
                "/post/{$post->id}",
            );
        }
    }

    public function syncCommentMentions(Comment $comment, int $mentionerId, ?string $content): void
    {
        $existingMentionedUserIds = Mention::query()
            ->where('comment_id', $comment->id)
            ->pluck('mentioned_user_id')
            ->all();

        Mention::query()->where('comment_id', $comment->id)->delete();

        $mentionedUserIds = $this->resolveMentionedUserIds($content, $mentionerId);

        foreach ($mentionedUserIds as $mentionedUserId) {
            Mention::create([
                'mentioned_user_id' => $mentionedUserId,
                'mentioner_id' => $mentionerId,
                'comment_id' => $comment->id,
            ]);
        }

        $newMentionedUserIds = array_values(array_diff($mentionedUserIds, $existingMentionedUserIds));
        $mentioner = User::query()->find($mentionerId);

        if ($mentioner) {
            $this->notifyMentionedUsers(
                $newMentionedUserIds,
                $mentioner,
                'Mentioned in a comment',
                sprintf('@%s mentioned you in a comment.', $mentioner->username),
                "/post/{$comment->post_id}",
            );
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

    /**
     * @param  array<int, int>  $mentionedUserIds
     */
    private function notifyMentionedUsers(array $mentionedUserIds, User $mentioner, string $title, string $message, string $url): void
    {
        if ($mentionedUserIds === []) {
            return;
        }

        User::query()
            ->whereIn('id', $mentionedUserIds)
            ->get()
            ->each(fn ($user) => $user->notify(new SocialNotification([
                'type' => 'mention',
                'title' => $title,
                'message' => $message,
                'url' => $url,
                'actor_username' => $mentioner->username,
            ])));
    }
}
