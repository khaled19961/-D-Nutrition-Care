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
      className="forgot-password-card"
    >
      <div className="forgot-password-back">
        <Link
          href="/auth/login"
          className="forgot-password-back-link"
          aria-label="العودة إلى تسجيل الدخول"
        >
          <span aria-hidden="true">→</span>
          <span>العودة لتسجيل الدخول</span>
        </Link>
      </div>

      <div className="forgot-password-heading">
        <h1 id="forgot-password-title">استعادة كلمة المرور</h1>
        <p>
          أدخل بريدك الإلكتروني وسنرسل لك رابطًا آمنًا لإعادة تعيين كلمة المرور
        </p>
      </div>

      <form
        onSubmit={submit}
        className="forgot-password-form"
        noValidate
      >
        <div className="forgot-password-field">
          <label htmlFor="forgot-email">البريد الإلكتروني</label>
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
          />
        </div>

        {error && (
          <p
            id="forgot-email-error"
            role="alert"
            className="forgot-password-message forgot-password-error"
          >
            {error}
          </p>
        )}

        {message && (
          <p
            role="status"
            aria-live="polite"
            className="forgot-password-message forgot-password-success"
          >
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="forgot-password-submit"
          aria-busy={pending}
        >
          {pending ? "جارٍ إرسال رابط الاستعادة..." : "إرسال رابط الاستعادة"}
        </button>
      </form>
    </section>
  );
}
