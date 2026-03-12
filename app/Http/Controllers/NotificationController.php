<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function index(Request $request): Response
    {
        $notifications = $request->user()
            ->notifications()
            ->latest()
            ->limit(50)
            ->get();

        return Inertia::render('notifications', [
            'notifications' => $notifications->map(fn ($notification) => [
                'id' => $notification->id,
                'type' => $notification->data['type'] ?? 'activity',
                'title' => $notification->data['title'] ?? 'Notification',
                'message' => $notification->data['message'] ?? '',
                'url' => $notification->data['url'] ?? '/home',
                'read_at' => $notification->read_at?->toDateTimeString(),
                'created_at' => $notification->created_at?->toDateTimeString(),
            ])->values(),
        ]);
    }

    public function markAllRead(Request $request): RedirectResponse
    {
        $request->user()->unreadNotifications->markAsRead();

        return redirect()->back()->with('status', 'Notifications marked as read.');
    }

    public function open(Request $request, string $notification): RedirectResponse
    {
        $notificationItem = $request->user()
            ->notifications()
            ->where('id', $notification)
            ->firstOrFail();

        if ($notificationItem->read_at === null) {
            $notificationItem->markAsRead();
        }

        return redirect()->to($notificationItem->data['url'] ?? '/home');
    }
}
