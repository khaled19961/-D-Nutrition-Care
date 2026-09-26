"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { SiteChrome } from "@/components/site-chrome";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setPending(false);
      return;
    }

    router.replace(next);
    router.refresh();
  }

  return (
    <SiteChrome><main className="min-h-screen bg-[var(--background)] py-12">
      <div className="container flex min-h-[80vh] items-center justify-center">
        <section className="w-full max-w-md rounded-3xl border border-[var(--border)] bg-white p-8 shadow-sm">
          <Link href="/" className="text-sm font-semibold text-[var(--primary)]">← العودة للرئيسية</Link>
          <h1 className="mt-6 text-3xl font-extrabold">تسجيل الدخول</h1>
          <p className="mt-2 text-[var(--muted)]">ادخل إلى حسابك لمتابعة حجوزاتك وبرنامجك الغذائي.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <label className="block">
              <span className="mb-2 block font-semibold">البريد الإلكتروني</span>
              <input
                required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-[var(--border)] px-4 py-3 outline-none focus:border-[var(--primary)]"
                autoComplete="email"
              />
            </label>

            <label className="block">
              <span className="mb-2 block font-semibold">كلمة المرور</span>
              <input
                required type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-[var(--border)] px-4 py-3 outline-none focus:border-[var(--primary)]"
                autoComplete="current-password"
              />
            </label>

            {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

            <button disabled={pending} className="w-full rounded-xl bg-[var(--primary)] px-5 py-3 font-bold text-white disabled:opacity-60">
              {pending ? "جارٍ الدخول..." : "دخول"}
            </button>
          </form>

          <div className="mt-6 flex justify-between gap-4 text-sm">
            <Link href="/auth/forgot-password" className="text-[var(--primary)]">نسيت كلمة المرور؟</Link>
            <Link href="/auth/register" className="font-semibold">إنشاء حساب</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
