import { Head, Link, useForm } from '@inertiajs/react';

type ResetPasswordProps = {
    email: string;
    token: string;
};

export default function ResetPassword({ email, token }: ResetPasswordProps) {
    const { data, setData, post, processing, errors } = useForm({
        token,
        email: email ?? '',
        password: '',
        password_confirmation: '',
    });

    return (
        <>
            <Head title="Reset password" />

            <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br from-slate-950 via-slate-900 to-emerald-950 px-4 py-10 text-slate-100">
                <section className="w-full max-w-md rounded-3xl border border-white/15 bg-white/10 p-7 shadow-2xl backdrop-blur-xl sm:p-8">
                    <Link
                        href="/home"
                        className="mb-4 inline-block rounded-lg border border-white/20 px-3 py-1.5 text-xs font-semibold text-slate-100 transition hover:bg-white/10"
                    >
                        Back to Home
                    </Link>

                    <h1 className="text-2xl font-semibold">Reset password</h1>
                    <p className="mt-2 text-sm text-slate-300">Set a new password for your account.</p>

                    <form
                        className="mt-5 space-y-4"
                        onSubmit={(e) => {
                            e.preventDefault();
                            post('/reset-password');
                        }}
                    >
                        <input
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="you@example.com"
                            className="w-full rounded-xl border border-white/20 bg-slate-950/70 px-4 py-3 text-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-300/40"
                            required
                        />
                        {errors.email && <p className="text-sm text-rose-300">{errors.email}</p>}

                        <input
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="New password"
                            className="w-full rounded-xl border border-white/20 bg-slate-950/70 px-4 py-3 text-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-300/40"
                            required
                        />
                        {errors.password && <p className="text-sm text-rose-300">{errors.password}</p>}

                        <input
                            type="password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            placeholder="Confirm new password"
                            className="w-full rounded-xl border border-white/20 bg-slate-950/70 px-4 py-3 text-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-300/40"
                            required
                        />

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full rounded-xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-emerald-300 disabled:opacity-60"
                        >
                            {processing ? 'Resetting...' : 'Reset password'}
                        </button>
                    </form>

                    <p className="mt-5 text-center text-sm text-slate-300">
                        <Link href="/login" className="font-semibold text-emerald-200 underline-offset-4 hover:underline">
                            Back to login
                        </Link>
                    </p>
                </section>
            </main>
        </>
    );
}
