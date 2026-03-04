import { Head, Link, useForm } from '@inertiajs/react';

type VerifyEmailProps = {
    status?: string;
};

export default function VerifyLogin({ status }: VerifyEmailProps) {
    const { post, processing } = useForm();

    return (
        <>
            <Head title="Verify email" />

            <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-4 py-10 text-slate-100">
                <div className="pointer-events-none absolute -left-24 top-20 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
                <div className="pointer-events-none absolute -right-24 bottom-8 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />

                <section className="relative w-full max-w-lg rounded-3xl border border-white/15 bg-white/10 p-7 shadow-2xl backdrop-blur-xl sm:p-8">
                    <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-300">One more step</p>
                        <h1 className="text-3xl font-semibold tracking-tight">Verify your email</h1>
                        <p className="text-sm text-slate-300">
                            Check your inbox and click the verification link we sent. If it did not arrive, request a new one below.
                        </p>
                    </div>

                    {status === 'verification-link-sent' && (
                        <p className="mt-5 rounded-xl border border-emerald-300/40 bg-emerald-400/15 px-4 py-3 text-sm text-emerald-200">
                            A fresh verification link has been sent to your email address.
                        </p>
                    )}

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            post('/email/verification-notification');
                        }}
                        className="mt-6"
                    >
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full rounded-xl bg-indigo-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-indigo-300 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {processing ? 'Sending link...' : 'Resend verification email'}
                        </button>
                    </form>

                    <div className="mt-4 text-center">
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="text-sm font-semibold text-indigo-200 underline-offset-4 hover:underline"
                        >
                            Log out
                        </Link>
                    </div>
                </section>
            </main>
        </>
    );
}
