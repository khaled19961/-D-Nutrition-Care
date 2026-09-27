"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

function safeNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  return value;
}

function authErrorMessage(error: { code?: string; message?: string }) {
  switch (error.code) {
    case "invalid_credentials": return "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
    case "email_not_confirmed": return "يجب تأكيد البريد الإلكتروني أولاً. راجع بريدك ثم حاول تسجيل الدخول.";
    case "too_many_requests": return "تم تجاوز عدد المحاولات المسموح بها. انتظر قليلاً ثم حاول مرة أخرى.";
    default: return error.message || "تعذر تسجيل الدخول حالياً. حاول مرة أخرى.";
  }
}

export default function AuthLoginForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = safeNextPath(sp.get("next"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError("");
    try {
      const supabase = createSupabaseBrowserClient();
      const result = await Promise.race([
        supabase.auth.signInWithPassword({ email: email.trim(), password }),
        new Promise<never>((_, reject) => window.setTimeout(() => reject(new Error("انتهت مهلة الاتصال بخدمة تسجيل الدخول. تحقق من الاتصال ثم حاول مرة أخرى.")), 15000))
      ]);
      if (result.error) {
        setError(authErrorMessage(result.error));
        return;
      }
      router.replace(next);
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "تعذر تسجيل الدخول حالياً. حاول مرة أخرى.");
    } finally {
      setPending(false);
    }
  }

  return <section className="w-full max-w-md rounded-3xl border border-[var(--border)] bg-white p-8 shadow-sm">
    <Link href="/" className="text-sm font-semibold text-[var(--primary)]">← العودة للرئيسية</Link>
    <h1 className="mt-6 text-3xl font-extrabold">تسجيل الدخول</h1>
    <p className="mt-2 text-[var(--muted)]">ادخل إلى حسابك لمتابعة حجوزاتك وبرنامجك الغذائي.</p>
    <form onSubmit={submit} className="mt-8 space-y-5">
      <label className="block"><span className="mb-2 block font-semibold">البريد الإلكتروني</span><input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full rounded-xl border border-[var(--border)] px-4 py-3 outline-none focus:border-[var(--primary)]" autoComplete="email" /></label>
      <label className="block"><span className="mb-2 block font-semibold">كلمة المرور</span><input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full rounded-xl border border-[var(--border)] px-4 py-3 outline-none focus:border-[var(--primary)]" autoComplete="current-password" /></label>
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <button type="submit" disabled={pending} className="w-full rounded-xl bg-[var(--primary)] px-5 py-3 font-bold text-white disabled:opacity-60">{pending ? "جارٍ الدخول..." : "دخول"}</button>
    </form>
    <div className="mt-6 flex justify-between gap-4 text-sm"><Link href="/auth/forgot-password" className="text-[var(--primary)]">نسيت كلمة المرور؟</Link><Link href={`/auth/register?next=${encodeURIComponent(next)}`} className="font-semibold">إنشاء حساب</Link></div>
  </section>;
}
