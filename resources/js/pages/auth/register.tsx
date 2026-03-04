import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

type RegisterForm = {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    password_confirmation: string;
    picture: File | null;
};

export default function Register() {
    const { data, setData, processing, errors, post } = useForm<RegisterForm>({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        password_confirmation: '',
        picture: null,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

    return (
        <>
            <Head title="Register" />

            <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br from-slate-950 via-slate-900 to-emerald-950 px-4 py-10 text-slate-100">
                <div className="pointer-events-none absolute -left-24 top-20 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" />
                <div className="pointer-events-none absolute -right-28 bottom-8 h-72 w-72 rounded-full bg-teal-400/20 blur-3xl" />

                <section className="relative w-full max-w-xl rounded-3xl border border-white/15 bg-white/10 p-7 shadow-2xl backdrop-blur-xl sm:p-8">
                    <div className="mb-6 space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300">Join now</p>
                        <h1 className="text-3xl font-semibold tracking-tight">Create your account</h1>
                        <p className="text-sm text-slate-300">Set up your profile and start using the app.</p>
                    </div>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            post('/register', { forceFormData: true });
                        }}
                        className="space-y-5"
                    >
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <label htmlFor="first_name" className="text-sm font-medium text-slate-200">
                                    First name
                                </label>
                                <input
                                    id="first_name"
                                    name="first_name"
                                    value={data.first_name}
                                    onChange={(e) => setData('first_name', e.target.value)}
                                    placeholder="Hamza"
                                    required
                                    className="w-full rounded-xl border border-white/20 bg-slate-950/70 px-4 py-3 text-sm outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-300/40"
                                />
                                {errors.first_name && <p className="text-sm text-rose-300">{errors.first_name}</p>}
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="last_name" className="text-sm font-medium text-slate-200">
                                    Last name
                                </label>
                                <input
                                    id="last_name"
                                    name="last_name"
                                    value={data.last_name}
                                    onChange={(e) => setData('last_name', e.target.value)}
                                    placeholder="Sabbagh"
                                    required
                                    className="w-full rounded-xl border border-white/20 bg-slate-950/70 px-4 py-3 text-sm outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-300/40"
                                />
                                {errors.last_name && <p className="text-sm text-rose-300">{errors.last_name}</p>}
                            </div>
                        </div>

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
                                placeholder="you@example.com"
                                required
                                className="w-full rounded-xl border border-white/20 bg-slate-950/70 px-4 py-3 text-sm outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-300/40"
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
                                    autoComplete="new-password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    required
                                    className="w-full rounded-xl border border-white/20 bg-slate-950/70 px-4 py-3 pr-20 text-sm outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-300/40"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-3 py-1.5 text-xs font-semibold text-emerald-200 transition hover:bg-white/10"
                                >
                                    {showPassword ? 'Hide' : 'Show'}
                                </button>
                            </div>
                            {errors.password && <p className="text-sm text-rose-300">{errors.password}</p>}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password_confirmation" className="text-sm font-medium text-slate-200">
                                Confirm password
                            </label>
                            <div className="relative">
                                <input
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    type={showPasswordConfirmation ? 'text' : 'password'}
                                    autoComplete="new-password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    required
                                    className="w-full rounded-xl border border-white/20 bg-slate-950/70 px-4 py-3 pr-20 text-sm outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-300/40"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordConfirmation((prev) => !prev)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-3 py-1.5 text-xs font-semibold text-emerald-200 transition hover:bg-white/10"
                                >
                                    {showPasswordConfirmation ? 'Hide' : 'Show'}
                                </button>
                            </div>
                            {errors.password_confirmation && <p className="text-sm text-rose-300">{errors.password_confirmation}</p>}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="picture" className="text-sm font-medium text-slate-200">
                                Profile picture (optional)
                            </label>
                            <input
                                id="picture"
                                name="picture"
                                type="file"
                                accept="image/*"
                                onChange={(e) => setData('picture', e.target.files?.[0] ?? null)}
                                className="block w-full cursor-pointer rounded-xl border border-white/20 bg-slate-950/70 px-4 py-2.5 text-sm text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-400 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-slate-950 hover:file:bg-emerald-300"
                            />
                            {errors.picture && <p className="text-sm text-rose-300">{errors.picture}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full rounded-xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {processing ? 'Creating account...' : 'Create account'}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-slate-300">
                        Already have an account?{' '}
                        <Link href="/login" className="font-semibold text-emerald-200 underline-offset-4 hover:underline">
                            Sign in
                        </Link>
                    </p>
                </section>
            </main>
        </>
    );
}
