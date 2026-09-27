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

      setPending(false);
      window.location.replace("/admin");
    } catch (caught) {
      setError(
        caught instanceof DOMException && caught.name === "AbortError"
          ? "انتهت مهلة الاتصال بخدمة تسجيل الدخول. تحقق من اتصال الموقع بـ Supabase ثم حاول مرة أخرى."
          : caught instanceof Error
            ? caught.message
            : "تعذر تسجيل الدخول حالياً."
      );
      setPending(false);
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  return (
    <main dir="rtl" className="min-h-screen bg-[var(--background)] py-12">
        <div className="container flex min-h-[80vh] items-center justify-center">
          <section className="w-full max-w-md rounded-3xl border border-[var(--border)] bg-white p-8 shadow-sm">
            <Link href="/" className="text-sm font-semibold text-[var(--primary)]">← العودة للموقع</Link>
            <h1 className="mt-6 text-3xl font-extrabold">بوابة إدارة النظام</h1>
            <p className="mt-2 text-[var(--muted)]">هذه البوابة مخصصة لمدير النظام فقط.</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <label className="block">
                <span className="mb-2 block font-semibold">البريد الإلكتروني</span>
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border)] px-4 py-3 outline-none focus:border-[var(--primary)]"
                  autoComplete="username" />
              </label>

              <label className="block">
                <span className="mb-2 block font-semibold">كلمة المرور</span>
                <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border)] px-4 py-3 outline-none focus:border-[var(--primary)]"
                  autoComplete="current-password" />
              </label>

              <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]"
                />
                <span>تذكر البريد الإلكتروني</span>
              </label>

              {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}

              <button disabled={pending} className="w-full rounded-xl bg-[var(--primary)] px-5 py-3 font-bold text-white disabled:opacity-60">
                {pending ? "جارٍ الدخول..." : "دخول الإدارة"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-[var(--muted)]">
              للأخصائيين والموظفين ستكون هناك بوابات وصلاحيات مستقلة.
            </p>
          </section>
        </div>
    </main>
  );
}
