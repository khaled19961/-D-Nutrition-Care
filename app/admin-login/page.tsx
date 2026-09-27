"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedEmail = localStorage.getItem("admin_login_email");
    if (savedEmail) setEmail(savedEmail);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");

    if (remember) localStorage.setItem("admin_login_email", email.trim());
    else localStorage.removeItem("admin_login_email");

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        cache: "no-store",
        body: JSON.stringify({ email, password }),
        signal: controller.signal,
      });

      const result = (await response.json()) as { ok?: boolean; error?: string };

      if (!response.ok || !result.ok) {
        setError(result.error || "تعذر تسجيل الدخول حالياً.");
        setPending(false);
        return;
      }

      window.location.replace("/admin");
    } catch (caught) {
      setError(
        caught instanceof DOMException && caught.name === "AbortError"
          ? "انتهت مهلة الاتصال بخدمة تسجيل الدخول. تحقق من اتصال الموقع بـ Supabase ثم حاول مرة أخرى."
          : caught instanceof Error ? caught.message : "تعذر تسجيل الدخول حالياً."
      );
      setPending(false);
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  return (
    <main dir="rtl" className="admin-login-page">
      <div className="admin-login-container">
        <section className="admin-login-card">
          <Link href="/" className="admin-login-back">
            <span aria-hidden="true">←</span>
            العودة للموقع
          </Link>

          <p className="admin-login-kicker">إدارة النظام</p>
          <h1 className="admin-login-title">بوابة إدارة النظام</h1>
          <p className="admin-login-description">
            هذه البوابة مخصصة لمدير النظام فقط.
          </p>

          <form onSubmit={handleSubmit} className="admin-login-form">
            <div className="admin-login-field">
              <label htmlFor="admin-email">البريد الإلكتروني</label>
              <input
                id="admin-email"
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
              />
            </div>

            <div className="admin-login-field">
              <label htmlFor="admin-password">كلمة المرور</label>
              <input
                id="admin-password"
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            <label className="admin-login-remember">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span>تذكر البريد الإلكتروني</span>
            </label>

            {error && (
              <p className="admin-login-error" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="admin-login-submit"
            >
              {pending ? "جارٍ الدخول..." : "دخول الإدارة"}
            </button>
          </form>

          <p className="admin-login-note">
            للأخصائيين والموظفين ستكون هناك بوابات وصلاحيات مستقلة.
          </p>
        </section>
      </div>
    </main>
  );
}
