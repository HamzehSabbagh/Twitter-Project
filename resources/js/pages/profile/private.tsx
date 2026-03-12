import { Head, Link, router } from '@inertiajs/react';

type PrivateProfileProps = {
    profile: {
        first_name: string;
        last_name: string;
        username: string;
        picture_url: string;
        is_following: boolean;
    };
};

export default function PrivateProfile({ profile }: PrivateProfileProps) {
    return (
        <>
            <Head title={`@${profile.username}`} />

            <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-10">
                <section className="w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                    <Link
                        href="/home"
                        className="mb-6 inline-block rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
                    >
                        Back to Home
                    </Link>

                    <div className="flex items-center gap-4">
                        <img
                            src={profile.picture_url}
                            alt="Profile"
                            className="h-20 w-20 rounded-full border border-slate-200 object-cover dark:border-slate-700"
                        />
                        <div>
                            <h1 className="text-2xl font-semibold">
                                {profile.first_name} {profile.last_name}
                            </h1>
                            <p className="text-sm text-slate-500">@{profile.username}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() =>
                                profile.is_following
                                    ? router.delete(`/profile/${profile.username}/follow`, { preserveScroll: true })
                                    : router.post(`/profile/${profile.username}/follow`, {}, { preserveScroll: true })
                            }
                            className={`ml-auto rounded-full px-4 py-2 text-sm font-semibold transition ${
                                profile.is_following
                                    ? 'border border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900'
                                    : 'bg-slate-900 text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300'
                            }`}
                        >
                            {profile.is_following ? 'Unfollow' : 'Follow'}
                        </button>
                    </div>

                    <div className="mt-8 rounded-2xl border border-dashed border-slate-300 p-6 dark:border-slate-700">
                        <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">This profile is private</p>
                        <p className="mt-2 text-sm text-slate-500">
                            The user has chosen to hide their full profile. Only they and admins can view it.
                        </p>
                    </div>
                </section>
            </main>
        </>
    );
}
