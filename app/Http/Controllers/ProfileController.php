<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function show(User $user): Response
    {
        $viewer = request()->user();
        $isAdmin = strtolower((string) $viewer?->role?->name) === 'admin';
        $user->load([
            'role:id,name',
            'posts' => fn ($query) => $query
                ->with([
                    'media:id,post_id,type,path,mime_type,duration_seconds,size_bytes',
                    'hashtags:id,name',
                ])
                ->withCount(['likes', 'comments', 'reposts'])
                ->latest(),
        ]);
        $user->loadCount(['followers', 'following']);

        return Inertia::render('profile/show', [
            'profile' => [
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'username' => $user->username,
                'bio' => $user->bio,
                'location' => $user->location,
                'role_name' => $user->role?->name,
                'picture_url' => route('profile.image', ['user' => $user->username, 'type' => 'picture']),
                'cover_url' => route('profile.image', ['user' => $user->username, 'type' => 'cover']),
                'is_owner' => $viewer?->id === $user->id,
                'is_following' => $viewer ? $viewer->following()->where('users.id', $user->id)->exists() : false,
                'followers_count' => $user->followers_count,
                'following_count' => $user->following_count,
                'posts' => $user->posts->map(fn ($post) => [
                    'id' => $post->id,
                    'content' => $post->content,
                    'created_at' => $post->created_at?->toDateTimeString(),
                    'likes_count' => $post->likes_count,
                    'comments_count' => $post->comments_count,
                    'reposts_count' => $post->reposts_count,
                    'can_delete' => $post->user_id === $viewer?->id || $isAdmin,
                    'hashtags' => $post->hashtags->map(fn ($tag) => [
                        'id' => $tag->id,
                        'name' => $tag->name,
                    ])->values(),
                    'media' => $post->media->map(fn ($media) => [
                        'id' => $media->id,
                        'type' => $media->type,
                        'url' => Storage::disk('public')->url($media->path),
                    ])->values(),
                ])->values(),
            ],
        ]);
    }

    public function follow(Request $request, User $user): RedirectResponse
    {
        $viewer = $request->user();
        abort_if($viewer->id === $user->id, 422);

        $viewer->following()->syncWithoutDetaching([$user->id]);

        return redirect()->back()->with('status', 'User followed.');
    }

    public function unfollow(Request $request, User $user): RedirectResponse
    {
        $viewer = $request->user();
        abort_if($viewer->id === $user->id, 422);

        $viewer->following()->detach($user->id);

        return redirect()->back()->with('status', 'User unfollowed.');
    }

    public function suggest(Request $request): JsonResponse
    {
        $viewer = $request->user();
        $query = trim((string) $request->query('q', ''));

        $users = User::query()
            ->select(['id', 'first_name', 'last_name', 'username'])
            ->where('id', '!=', $viewer->id)
            ->withExists([
                'followers as followed_by_viewer' => fn ($builder) => $builder->where('follower_id', $viewer->id),
            ])
            ->when($query !== '', function ($builder) use ($query) {
                $builder->where(function ($search) use ($query) {
                    $search
                        ->where('username', 'like', $query.'%')
                        ->orWhere('username', 'like', '%'.$query.'%')
                        ->orWhere('first_name', 'like', '%'.$query.'%')
                        ->orWhere('last_name', 'like', '%'.$query.'%')
                        ->orWhere(DB::raw("TRIM(CONCAT(first_name, ' ', last_name))"), 'like', '%'.$query.'%');
                });
            })
            ->orderByDesc('followed_by_viewer');

        if ($query !== '') {
            $users
                ->orderByRaw('CASE WHEN username LIKE ? THEN 0 ELSE 1 END', [$query.'%'])
                ->orderByRaw('CASE WHEN username = ? THEN 0 ELSE 1 END', [$query]);
        }

        $users = $users
            ->orderBy('username')
            ->limit(8)
            ->get();

        return response()->json(
            $users->map(fn ($user) => [
                'id' => $user->id,
                'username' => $user->username,
                'name' => trim($user->first_name.' '.$user->last_name) ?: $user->username,
                'followed_by_viewer' => (bool) $user->followed_by_viewer,
            ])->values()
        );
    }

    public function edit(): Response
    {
        $user = request()->user();

        return Inertia::render('profile/edit', [
            'user' => [
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'username' => $user->username,
                'email' => $user->email,
                'birth_date' => $user->birth_date?->toDateString(),
                'location' => $user->location,
                'bio' => $user->bio,
                'role_name' => $user->role?->name,
                'picture_url' => route('home.image', ['type' => 'picture']),
                'cover_url' => route('home.image', ['type' => 'cover']),
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validateWithBag('profileUpdate', [
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'username' => [
                'required',
                'string',
                'max:30',
                Rule::unique('users', 'username')->ignore($user->id),
            ],
            'picture' => ['nullable', 'image', 'mimes:webp,jpeg,jpg,png', 'max:2048'],
            'cover' => ['nullable', 'image', 'mimes:webp,jpeg,jpg,png', 'max:4096'],
            'email' => [
                'required',
                'email',
                'max:255',
                'string',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
            'birth_date' => ['required', 'date', 'before_or_equal:' . now()->subYears(18)->toDateString()],
            'location' => ['nullable', 'string', 'max:100'],
            'bio' => ['nullable', 'string', 'max:160'],
        ]);

        $updateData = $validated;
        unset($updateData['picture'], $updateData['cover']);

        if ($request->hasFile('picture')) {
            $file = $request->file('picture');
            $updateData['picture'] = file_get_contents($file->getRealPath());
            $updateData['picture_mime'] = $file->getMimeType();
        }

        if ($request->hasFile('cover')) {
            $file = $request->file('cover');
            $updateData['cover'] = file_get_contents($file->getRealPath());
            $updateData['cover_mime'] = $file->getMimeType();
        }

        if ($validated['email'] !== $user->email){
            $updateData['email_verified_at'] = null;
        }

        $user->update($updateData);
        
        return redirect()->route('profile.edit');
    }

    public function updatePassword(Request $request): RedirectResponse
    {
        $validated = $request->validateWithBag('passwordUpdate', [
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'string', 'confirmed', 'min:8'],
        ]);

        $request->user()->update([
            'password' => $validated['password'],
        ]);

        return redirect()->route('profile.edit');
    }

    public function destroy(Request $request): RedirectResponse
    {
        $request->validateWithBag('accountDelete', [
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();
        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('guest.home');
    }

    public function image(Request $request, User $user)
    {
        $type = $request->query('type', 'picture');

        if ($type === 'cover' && $user->cover) {
            return response($user->cover, 200)->header('Content-Type', $user->cover_mime ?? 'image/jpeg');
        }

        if ($user->picture) {
            return response($user->picture, 200)->header('Content-Type', $user->picture_mime ?? 'image/jpeg');
        }

        $defaultProfilePath = public_path('default-profile.png');

        if (file_exists($defaultProfilePath)) {
            return response()->file($defaultProfilePath);
        }

        abort(404);
    }
}
