import { Head, Link } from '@inertiajs/react';

export default function Guest() {
    return (
        <>
            <Head title="Welcome" />

            <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 text-slate-100">
                <div className="pointer-events-none absolute -top-16 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-500/20 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-10 -left-10 h-80 w-80 rounded-full bg-sky-400/15 blur-3xl" />

                <section className="mx-auto flex max-w-6xl flex-col px-4 pt-24 pb-16 sm:px-6 lg:flex-row lg:items-start lg:justify-between lg:px-8 lg:pt-28 lg:pb-20">
                    <div className="max-w-2xl">
                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">Social Platform</p>
                        <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl">
                            Share updates, follow people, and build your timeline
                        </h1>
                        <p className="mt-4 text-base text-slate-300 sm:text-lg">
                            A clean Twitter-like experience built with Laravel, Inertia, and React.
                        </p>

                        <div className="mt-8 flex flex-wrap items-center gap-3">
                            <Link
                                href="/register"
                                className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-cyan-300"
                            >
                                Create account
                            </Link>
                            <Link
                                href="/login"
                                className="rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/20"
                            >
                                Log in
                            </Link>
                        </div>
                    </div>

                    <div className="mt-10 w-full max-w-md space-y-3 lg:mt-0">
                        <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-xl">
                            <p className="text-sm font-semibold">Fast timeline</p>
                            <p className="mt-1 text-sm text-slate-300">Posts, reposts, and comments in one place.</p>
                        </div>
                        <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-xl">
                            <p className="text-sm font-semibold">Media support</p>
                            <p className="mt-1 text-sm text-slate-300">Attach photos, video, and audio to posts.</p>
                        </div>
                        <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-xl">
                            <p className="text-sm font-semibold">Discover hashtags</p>
                            <p className="mt-1 text-sm text-slate-300">Track topics and join conversations quickly.</p>
                        </div>
                    </div>
                </section>

                <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-xl">
                            <p className="text-xs uppercase tracking-wider text-cyan-300">Posts</p>
                            <p className="mt-2 text-2xl font-semibold">Compose fast</p>
                        </div>
                        <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-xl">
                            <p className="text-xs uppercase tracking-wider text-cyan-300">Threads</p>
                            <p className="mt-2 text-2xl font-semibold">Reply in context</p>
                        </div>
                        <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-xl">
                            <p className="text-xs uppercase tracking-wider text-cyan-300">Reposts</p>
                            <p className="mt-2 text-2xl font-semibold">Boost ideas</p>
                        </div>
                        <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-xl">
                            <p className="text-xs uppercase tracking-wider text-cyan-300">Hashtags</p>
                            <p className="mt-2 text-2xl font-semibold">Discover trends</p>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}
