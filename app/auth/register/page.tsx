"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { SiteChrome } from "@/components/site-chrome";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    setMessage("");

    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name, phone },
        emailRedirectTo: window.location.origin + "/auth/callback?next=/dashboard"
      }
    });

    if (error) {
      setError(error.message);
      setPending(false);
      return;
    }

    if (data.session) {
      router.replace("/dashboard");
      router.refresh();
      return;
    }

    setMessage("تم إنشاء الحساب. راجع بريدك الإلكتروني لتأكيد الحساب ثم سجّل الدخول.");
    setPending(false);
  }

  return (
    <SiteChrome><main className="min-h-screen bg-[var(--background)] py-12">
      <div className="container flex min-h-[80vh] items-center justify-center">
        <section className="w-full max-w-lg rounded-3xl border border-[var(--border)] bg-white p-8 shadow-sm">
          <Link href="/" className="text-sm font-semibold text-[var(--primary)]">← العودة للرئيسية</Link>
          <h1 className="mt-6 text-3xl font-extrabold">إنشاء حساب جديد</h1>
          <p className="mt-2 text-[var(--muted)]">ابدأ رحلتك الغذائية وسنحتفظ ببيانات المتابعة والحجوزات في حسابك.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <label className="block">
              <span className="mb-2 block font-semibold">الاسم الكامل</span>
              <input required value={name} onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-[var(--border)] px-4 py-3 outline-none focus:border-[var(--primary)]" />
            </label>

            <label className="block">
              <span className="mb-2 block font-semibold">رقم الجوال</span>
              <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-[var(--border)] px-4 py-3 outline-none focus:border-[var(--primary)]"
                autoComplete="tel" />
            </label>

            <label className="block">
              <span className="mb-2 block font-semibold">البريد الإلكتروني</span>
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-[var(--border)] px-4 py-3 outline-none focus:border-[var(--primary)]"
                autoComplete="email" />
            </label>

            <label className="block">
              <span className="mb-2 block font-semibold">كلمة المرور</span>
              <input required minLength={8} type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-[var(--border)] px-4 py-3 outline-none focus:border-[var(--primary)]"
                autoComplete="new-password" />
              <span className="mt-1 block text-xs text-[var(--muted)]">8 أحرف على الأقل.</span>
            </label>

            {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            {message && <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>}

            <button disabled={pending} className="w-full rounded-xl bg-[var(--primary)] px-5 py-3 font-bold text-white disabled:opacity-60">
              {pending ? "جارٍ إنشاء الحساب..." : "إنشاء الحساب"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--muted)]">
            لديك حساب بالفعل؟ <Link href="/auth/login" className="font-semibold text-[var(--primary)]">تسجيل الدخول</Link>
          </p>
        </section>
      </div>
    </main>
  );
}
