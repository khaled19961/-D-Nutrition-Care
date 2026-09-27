"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError("");
    setMessage("");

    const s = createSupabaseBrowserClient();
    const { error } = await s.auth.resetPasswordForEmail(email, {
      redirectTo:
        window.location.origin +
        "/auth/callback?next=/auth/reset-password",
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage(
        "إذا كان البريد مسجلاً، ستصلك رسالة لإعادة تعيين كلمة المرور."
      );
    }

    setPending(false);
  }

  return (
    <section
      dir="rtl"
      aria-labelledby="forgot-password-title"
      className="w-full max-w-[560px] rounded-[28px] border border-[var(--border)] bg-white px-7 py-8 shadow-[0_18px_50px_rgba(23,59,51,0.08)] sm:px-11 sm:py-10"
    >
      <div className="mb-7">
        <Link
          href="/auth/login"
          className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-bold text-[var(--primary-dark)] transition-colors hover:bg-[var(--mint)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
          aria-label="العودة إلى تسجيل الدخول"
        >
          <span aria-hidden="true" className="text-lg leading-none">←</span>
          <span>العودة لتسجيل الدخول</span>
        </Link>
      </div>

      <div>
        <p className="mb-2 text-sm font-extrabold text-[var(--primary)]">
          أمان حسابك
        </p>
        <h1
          id="forgot-password-title"
          className="text-3xl font-extrabold leading-[1.35] tracking-tight text-[#173b33] sm:text-[34px]"
        >
          استعادة كلمة المرور
        </h1>
        <p className="mt-4 max-w-[470px] text-[15px] leading-8 text-[var(--muted)]">
          أدخل بريدك الإلكتروني وسنرسل لك رابطًا آمنًا لإعادة تعيين كلمة المرور
        </p>
      </div>

      <form onSubmit={submit} className="mt-9 space-y-6" noValidate>
        <div>
          <label
            htmlFor="forgot-email"
            className="mb-2.5 block text-sm font-bold leading-6 text-[var(--foreground)]"
          >
            البريد الإلكتروني
          </label>
          <input
            id="forgot-email"
            name="email"
            required
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError("");
              if (message) setMessage("");
            }}
            placeholder="أدخل بريدك الإلكتروني"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "forgot-email-error" : undefined}
            className="min-h-14 w-full rounded-2xl border border-[var(--border)] bg-[#fcfdfc] px-5 text-base leading-6 text-[var(--foreground)] text-right outline-none transition-all placeholder:text-[#9aa39f] hover:border-[#c5d4ce] focus:border-[var(--primary)] focus:bg-white focus:ring-4 focus:ring-[#167c63]/10"
          />
        </div>

        {error && (
          <p
            id="forgot-email-error"
            role="alert"
            className="rounded-2xl border border-red-100 bg-red-50 px-5 py-3.5 text-sm leading-7 text-red-700"
          >
            {error}
          </p>
        )}

        {message && (
          <p
            role="status"
            aria-live="polite"
            className="rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-3.5 text-sm leading-7 text-emerald-800"
          >
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="min-h-14 w-full rounded-2xl bg-[var(--primary-dark)] px-6 text-base font-extrabold text-white shadow-sm transition-all hover:bg-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          aria-busy={pending}
        >
          {pending ? "جارٍ إرسال رابط الاستعادة..." : "إرسال رابط الاستعادة"}
        </button>
      </form>
    </section>
  );
}
