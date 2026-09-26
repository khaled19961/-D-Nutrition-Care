"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { SiteChrome } from "@/components/site-chrome";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");

    const supabase = createSupabaseBrowserClient();
    try {
      const result = await Promise.race([
        supabase.auth.signInWithPassword({ email, password }),
        new Promise<never>((_, reject) =>
          window.setTimeout(
            () => reject(new Error("انتهت مهلة الاتصال بخدمة تسجيل الدخول. تحقق من اتصال الموقع بـ Supabase ثم حاول مرة أخرى.")),
            15000
          )
        ),
      ]);

      if (result.error) {
        setError(result.error.message);
        setPending(false);
        return;
      }

      // Force a full navigation after authentication. This avoids leaving the
      // login button in the pending state when the App Router transition is
      // delayed by the Cloudflare/Vinext runtime or auth cookie refresh.
      setPending(false);
      window.location.replace("/admin");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "تعذر تسجيل الدخول حالياً.");
      setPending(false);
    }
  }

  return (
    <SiteChrome>
      <main className="min-h-screen bg-[var(--background)] py-12">
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

              {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

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
    </SiteChrome>
  );
}
