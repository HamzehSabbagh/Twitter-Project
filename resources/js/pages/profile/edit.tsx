import { Head, useForm } from '@inertiajs/react';

type EditProfileProps = {
    user: {
        first_name: string;
        last_name: string;
        username: string;
        role_name?: string | null;
        email: string;
        birth_date: string;
        location: string | null;
        bio: string | null;
        is_profile_public: boolean;
        picture_url: string;
        cover_url: string;
    };
};

export default function Edit({ user }: EditProfileProps) {
    const isAdmin = (user.role_name ?? '').toLowerCase() === 'admin';

    const profileForm = useForm({
        first_name: user.first_name ?? '',
        last_name: user.last_name ?? '',
        username: user.username ?? '',
        email: user.email ?? '',
        birth_date: user.birth_date ?? '',
        location: user.location ?? '',
        bio: user.bio ?? '',
        is_profile_public: user.is_profile_public,
        picture: null as File | null,
        cover: null as File | null,
    });

    const deleteForm = useForm({
        password: '',
    });
    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    return (
        <>
            <Head title="Edit profile" />

            <main className={`mx-auto min-h-screen w-full max-w-4xl space-y-5 px-4 py-6 ${isAdmin ? 'bg-rose-50/40 dark:bg-rose-950/10' : ''}`}>
                <section className={`overflow-hidden rounded-2xl border ${isAdmin ? 'border-rose-300 bg-rose-50 dark:border-rose-800 dark:bg-rose-950/20' : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950'}`}>
                    <div className="relative">
                        <img
                            src={user.cover_url}
                            alt="Cover"
                            className="h-44 w-full object-cover sm:h-56"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
                        <img
                            src={user.picture_url}
                            alt="Profile"
                            className="absolute -bottom-8 left-4 h-20 w-20 rounded-full border-4 border-white object-cover shadow-md dark:border-slate-950"
                        />
                    </div>
                    <div className="px-4 pb-4 pt-10">
                        <div className="flex items-center gap-2">
                            <p className="text-base font-semibold">
                                {user.first_name} {user.last_name}
                            </p>
                            {isAdmin && (
                                <span className="rounded-full bg-rose-600 px-2 py-0.5 text-xs font-semibold text-white">
                                    Admin
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-slate-500">@{user.username}</p>
                    </div>
                </section>

                <header className={`rounded-2xl border p-4 ${isAdmin ? 'border-rose-300 bg-rose-50 dark:border-rose-800 dark:bg-rose-950/20' : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950'}`}>
                    <a
                        href="/home"
                        className="mb-3 inline-block rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
                    >
                        Back to Home
                    </a>
                    <h1 className="text-2xl font-semibold">Edit profile</h1>
                    <p className="mt-1 text-sm text-slate-500">Update your account details and security settings.</p>
                </header>

                <section className={`rounded-2xl border p-4 ${isAdmin ? 'border-rose-300 bg-rose-50 dark:border-rose-800 dark:bg-rose-950/20' : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950'}`}>
                    <h2 className="text-lg font-semibold">Profile details</h2>

                    <form
                        className="mt-4 space-y-4"
                        onSubmit={(e) => {
                            e.preventDefault();
                            profileForm.patch('/profile', {
                                forceFormData: true,
                                errorBag: 'profileUpdate',
                            });
                        }}
                    >
                        <div className="grid gap-3 sm:grid-cols-2">
                            <input
                                value={profileForm.data.first_name}
                                onChange={(e) => profileForm.setData('first_name', e.target.value)}
                                className="rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-900"
                                placeholder="First name"
                            />
                            <input
                                value={profileForm.data.last_name}
                                onChange={(e) => profileForm.setData('last_name', e.target.value)}
                                className="rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-900"
                                placeholder="Last name"
                            />
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <input
                                value={profileForm.data.username}
                                onChange={(e) => profileForm.setData('username', e.target.value)}
                                className="rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-900"
                                placeholder="Username"
                            />
                            <input
                                type="email"
                                value={profileForm.data.email}
                                onChange={(e) => profileForm.setData('email', e.target.value)}
                                className="rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-900"
                                placeholder="Email"
                            />
                        </div>

                        <input
                            type="date"
                            value={profileForm.data.birth_date}
                            onChange={(e) => profileForm.setData('birth_date', e.target.value)}
                            className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-900"
                        />

                        <input
                            value={profileForm.data.location}
                            onChange={(e) => profileForm.setData('location', e.target.value)}
                            className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-900"
                            placeholder="Location (optional)"
                        />

                        <textarea
                            value={profileForm.data.bio}
                            onChange={(e) => profileForm.setData('bio', e.target.value)}
                            className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-900"
                            placeholder="Bio (optional)"
                            rows={3}
                        />

                        <label className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                            <div>
                                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Public profile</p>
                                <p className="mt-1 text-sm text-slate-500">
                                    When turned off, only you and admins can view your full profile.
                                </p>
                            </div>
                            <button
                                type="button"
                                role="switch"
                                aria-checked={profileForm.data.is_profile_public}
                                onClick={() => profileForm.setData('is_profile_public', !profileForm.data.is_profile_public)}
                                className={`relative inline-flex h-7 w-14 items-center rounded-full transition ${
                                    profileForm.data.is_profile_public ? 'bg-cyan-500' : 'bg-slate-300 dark:bg-slate-700'
                                }`}
                            >
                                <span
                                    className={`inline-block h-5 w-5 rounded-full bg-white transition ${
                                        profileForm.data.is_profile_public ? 'translate-x-8' : 'translate-x-1'
                                    }`}
                                />
                            </button>
                        </label>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-1 text-sm">
                                <span className="text-slate-500">Profile picture</span>
                                <div className="flex items-center gap-2">
                                    <input
                                        id="profile-picture-input"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => profileForm.setData('picture', e.target.files?.[0] ?? null)}
                                    />
                                    <label
                                        htmlFor="profile-picture-input"
                                        className="inline-flex cursor-pointer items-center rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
                                    >
                                        Choose profile picture
                                    </label>
                                    <span className="truncate text-xs text-slate-500">
                                        {profileForm.data.picture ? profileForm.data.picture.name : 'No file chosen'}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-1 text-sm">
                                <span className="text-slate-500">Cover image</span>
                                <div className="flex items-center gap-2">
                                    <input
                                        id="cover-image-input"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => profileForm.setData('cover', e.target.files?.[0] ?? null)}
                                    />
                                    <label
                                        htmlFor="cover-image-input"
                                        className="inline-flex cursor-pointer items-center rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
                                    >
                                        Choose cover image
                                    </label>
                                    <span className="truncate text-xs text-slate-500">
                                        {profileForm.data.cover ? profileForm.data.cover.name : 'No file chosen'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {Object.values(profileForm.errors).length > 0 && (
                            <p className="text-sm text-rose-500">{Object.values(profileForm.errors)[0]}</p>
                        )}

                        <button
                            type="submit"
                            disabled={profileForm.processing}
                            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
                        >
                            {profileForm.processing ? 'Saving...' : 'Save profile & images'}
                        </button>
                    </form>
                </section>

                <section className={`rounded-2xl border p-4 ${isAdmin ? 'border-rose-300 bg-rose-50 dark:border-rose-800 dark:bg-rose-950/20' : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950'}`}>
                    <h2 className="text-lg font-semibold">Change current password</h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Enter your current password to set a new one.
                    </p>

                    <form
                        className="mt-4 space-y-3"
                        onSubmit={(e) => {
                            e.preventDefault();
                            passwordForm.patch('/profile/password', {
                                errorBag: 'passwordUpdate',
                                onSuccess: () => passwordForm.reset(),
                            });
                        }}
                    >
                        <input
                            type="password"
                            value={passwordForm.data.current_password}
                            onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                            className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-900"
                            placeholder="Current password"
                        />
                        <input
                            type="password"
                            value={passwordForm.data.password}
                            onChange={(e) => passwordForm.setData('password', e.target.value)}
                            className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-900"
                            placeholder="New password"
                        />
                        <input
                            type="password"
                            value={passwordForm.data.password_confirmation}
                            onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                            className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-900"
                            placeholder="Confirm new password"
                        />

                        {Object.values(passwordForm.errors).length > 0 && (
                            <p className="text-sm text-rose-500">{Object.values(passwordForm.errors)[0]}</p>
                        )}

                        <button
                            type="submit"
                            disabled={passwordForm.processing}
                            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
                        >
                            {passwordForm.processing ? 'Updating...' : 'Update password'}
                        </button>
                    </form>
                </section>

                {!isAdmin && (
                    <section className="rounded-2xl border border-rose-300 bg-rose-50 p-4 dark:border-rose-800 dark:bg-rose-950/20">
                        <h2 className="text-lg font-semibold text-rose-700 dark:text-rose-300">Delete account</h2>
                        <p className="mt-1 text-sm text-rose-700/80 dark:text-rose-300/80">
                            This action is permanent. Enter your password to confirm.
                        </p>

                        <form
                            className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center"
                            onSubmit={(e) => {
                                e.preventDefault();
                                deleteForm.delete('/profile', {
                                    errorBag: 'accountDelete',
                                });
                            }}
                        >
                            <input
                                type="password"
                                value={deleteForm.data.password}
                                onChange={(e) => deleteForm.setData('password', e.target.value)}
                                className="w-full rounded-lg border border-rose-300 p-2 dark:border-rose-800 dark:bg-slate-900"
                                placeholder="Enter password to delete account"
                            />
                            <button
                                type="submit"
                                disabled={deleteForm.processing}
                                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {deleteForm.processing ? 'Deleting...' : 'Delete account'}
                            </button>
                        </form>

                        {Object.values(deleteForm.errors).length > 0 && (
                            <p className="mt-2 text-sm text-rose-600 dark:text-rose-300">{Object.values(deleteForm.errors)[0]}</p>
                        )}
                    </section>
                )}
            </main>
        </>
    );
}
