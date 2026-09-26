"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    setMessage("");

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/auth/callback?next=/auth/reset-password"
    });

    if (error) setError(error.message);
    else setMessage("إذا كان البريد مسجلاً، ستصلك رسالة لإعادة تعيين كلمة المرور.");

    setPending(false);
  }

  return (
    <main className="min-h-screen bg-[var(--background)] py-12">
      <div className="container flex min-h-[80vh] items-center justify-center">
        <section className="w-full max-w-md rounded-3xl border border-[var(--border)] bg-white p-8 shadow-sm">
          <Link href="/auth/login" className="text-sm font-semibold text-[var(--primary)]">← العودة لتسجيل الدخول</Link>
          <h1 className="mt-6 text-3xl font-extrabold">استعادة كلمة المرور</h1>
          <p className="mt-2 text-[var(--muted)]">أدخل بريدك وسنرسل لك رابطاً آمناً لإعادة تعيين كلمة المرور.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full rounded-xl border border-[var(--border)] px-4 py-3 outline-none focus:border-[var(--primary)]" />
            {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            {message && <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>}
            <button disabled={pending} className="w-full rounded-xl bg-[var(--primary)] px-5 py-3 font-bold text-white disabled:opacity-60">
              {pending ? "جارٍ الإرسال..." : "إرسال رابط الاستعادة"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
