import { Head, Link, useForm } from '@inertiajs/react';

type ForgotPasswordProps = {
    status?: string;
};

export default function ForgotPassword({ status }: ForgotPasswordProps) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    return (
        <>
            <Head title="Forgot password" />

            <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br from-slate-950 via-slate-900 to-cyan-950 px-4 py-10 text-slate-100">
                <section className="w-full max-w-md rounded-3xl border border-white/15 bg-white/10 p-7 shadow-2xl backdrop-blur-xl sm:p-8">
                    <Link
                        href="/home"
                        className="mb-4 inline-block rounded-lg border border-white/20 px-3 py-1.5 text-xs font-semibold text-slate-100 transition hover:bg-white/10"
                    >
                        Back to Home
                    </Link>

                    <h1 className="text-2xl font-semibold">Forgot your password?</h1>
                    <p className="mt-2 text-sm text-slate-300">
                        Enter your email and we will send you a reset link.
                    </p>

                    {status && (
                        <p className="mt-4 rounded-lg border border-emerald-300/40 bg-emerald-400/15 px-3 py-2 text-sm text-emerald-200">
                            {status}
                        </p>
                    )}

                    <form
                        className="mt-5 space-y-4"
                        onSubmit={(e) => {
                            e.preventDefault();
                            post('/forgot-password');
                        }}
                    >
                        <input
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="you@example.com"
                            className="w-full rounded-xl border border-white/20 bg-slate-950/70 px-4 py-3 text-sm outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/40"
                            required
                        />

                        {errors.email && <p className="text-sm text-rose-300">{errors.email}</p>}

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-cyan-300 disabled:opacity-60"
                        >
                            {processing ? 'Sending...' : 'Send reset link'}
                        </button>
                    </form>

                    <p className="mt-5 text-center text-sm text-slate-300">
                        <Link href="/login" className="font-semibold text-cyan-200 underline-offset-4 hover:underline">
                            Back to login
                        </Link>
                    </p>
                </section>
            </main>
        </>
    );
}
