<?php

use App\Http\Controllers\CommentController;
use App\Http\Controllers\HashtagController;
use App\Http\Controllers\LikeController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RepostController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use Inertia\Inertia;


Route::get('/', function(){
    return Inertia::render('guest');
})->middleware('guest')->name('guest.home');

Route::get('/home', [PostController::class, 'index'])->middleware(['auth', 'verified'])->name('home');

Route::middleware('auth')->group(function(){
    Route::get('/profile/edit', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::get('/profile/{user:username}', [ProfileController::class, 'show'])->name('profile.show');
    Route::post('/profile/{user:username}/follow', [ProfileController::class, 'follow'])->name('profile.follow');
    Route::delete('/profile/{user:username}/follow', [ProfileController::class, 'unfollow'])->name('profile.unfollow');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::patch('/profile/password', [ProfileController::class, 'updatePassword'])->name('profile.password.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::resource('post', PostController::class)->except(['index']);
    Route::resource('comment', CommentController::class)->only(['store', 'update', 'destroy']);
    Route::post('/post/{post}/like', [LikeController::class, 'storePost'])->name('post.like');
    Route::delete('/post/{post}/like', [LikeController::class, 'destroyPost'])->name('post.unlike');
    Route::post('/post/{post}/repost', [RepostController::class, 'storePost'])->name('post.repost');
    Route::delete('/post/{post}/repost', [RepostController::class, 'destroyPost'])->name('post.unrepost');
    Route::post('/comment/{comment}/like', [LikeController::class, 'storeComment'])->name('comment.like');
    Route::delete('/comment/{comment}/like', [LikeController::class, 'destroyComment'])->name('comment.unlike');
    Route::get('/hashtag/{hashtag}', [HashtagController::class, 'show'])->name('hashtag.show');
});

Route::get('/profile/{user:username}/image', [ProfileController::class, 'image'])
    ->middleware('auth')
    ->name('profile.image');

Route::get('/home/image', function (Request $request) {
    $user = $request->user();

    abort_unless($user, 404);

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

})->middleware('auth')->name('home.image');
