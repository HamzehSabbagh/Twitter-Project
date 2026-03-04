import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

export default function Login() {
    const { data, setData, post, processing, errors } = useForm<LoginForm>({
        email: '',
        password: '',
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);

    return (
        <>
            <Head title="Log in" />

            <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br from-slate-950 via-slate-900 to-cyan-950 px-4 py-10 text-slate-100">
                <div className="pointer-events-none absolute -left-28 top-20 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl" />
                <div className="pointer-events-none absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-sky-400/20 blur-3xl" />

                <section className="relative w-full max-w-md rounded-3xl border border-white/15 bg-white/10 p-7 shadow-2xl backdrop-blur-xl sm:p-8">
                    <div className="mb-6 space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">Welcome back</p>
                        <h1 className="text-3xl font-semibold tracking-tight">Sign in to your account</h1>
                        <p className="text-sm text-slate-300">Continue where you left off.</p>
                    </div>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            post('/login');
                        }}
                        className="space-y-5"
                    >
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium text-slate-200">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="w-full rounded-xl border border-white/20 bg-slate-950/70 px-4 py-3 text-sm outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/40"
                                placeholder="you@example.com"
                            />
                            {errors.email && <p className="text-sm text-rose-300">{errors.email}</p>}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium text-slate-200">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="w-full rounded-xl border border-white/20 bg-slate-950/70 px-4 py-3 pr-20 text-sm outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/40"
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-3 py-1.5 text-xs font-semibold text-cyan-200 transition hover:bg-white/10"
                                >
                                    {showPassword ? 'Hide' : 'Show'}
                                </button>
                            </div>
                            {errors.password && <p className="text-sm text-rose-300">{errors.password}</p>}
                        </div>

                        <div className="flex items-center justify-between gap-3">
                            <label className="inline-flex items-center gap-2 text-sm text-slate-200">
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="h-4 w-4 rounded border-white/30 bg-slate-900 text-cyan-400"
                                />
                                Remember me
                            </label>

                            <Link href="/forgot-password" className="text-sm font-medium text-cyan-200 underline-offset-4 hover:underline">
                                Forgot password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {processing ? 'Signing in...' : 'Sign in'}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-slate-300">
                        New here?{' '}
                        <Link href="/register" className="font-semibold text-cyan-200 underline-offset-4 hover:underline">
                            Create account
                        </Link>
                    </p>
                </section>
            </main>
        </>
    );
}
