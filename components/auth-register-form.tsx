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
    case "user_already_exists": return "يوجد حساب مسجل بهذا البريد الإلكتروني بالفعل. سجّل الدخول بدلاً من إنشاء حساب جديد.";
    case "email_address_invalid": return "البريد الإلكتروني غير صحيح.";
    case "weak_password": return "كلمة المرور ضعيفة. استخدم كلمة مرور أقوى لا تقل عن 8 أحرف.";
    case "over_email_send_rate_limit": return "تم تجاوز حد إرسال رسائل البريد مؤقتاً. انتظر قليلاً ثم حاول مرة أخرى.";
    default: return error.message || "تعذر إنشاء الحساب حالياً. حاول مرة أخرى.";
  }
}

export default function AuthRegisterForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = safeNextPath(sp.get("next"));
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError("");
    setMessage("");
    try {
      const supabase = createSupabaseBrowserClient();
      const redirectUrl = new URL("/auth/callback", window.location.origin);
      redirectUrl.searchParams.set("next", next);
      const result = await Promise.race([
        supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { full_name: name.trim(), phone: phone.trim() }, emailRedirectTo: redirectUrl.toString() }
        }),
        new Promise<never>((_, reject) => window.setTimeout(() => reject(new Error("انتهت مهلة الاتصال بخدمة إنشاء الحساب. تحقق من الاتصال ثم حاول مرة أخرى.")), 20000))
      ]);
      if (result.error) {
        setError(authErrorMessage(result.error));
        return;
      }
      if (result.data.session) {
        router.replace(next);
        router.refresh();
        return;
      }
      setMessage("تم إنشاء الحساب. راجع بريدك الإلكتروني واضغط رابط التأكيد، ثم سجّل الدخول.");
    } catch (error) {
      setError(error instanceof Error ? error.message : "تعذر إنشاء الحساب حالياً. حاول مرة أخرى.");
    } finally {
      setPending(false);
    }
  }

  return <section className="w-full max-w-lg rounded-3xl border border-[var(--border)] bg-white p-8 shadow-sm">
    <Link href="/" className="text-sm font-semibold text-[var(--primary)]">← العودة للرئيسية</Link>
    <h1 className="mt-6 text-3xl font-extrabold">إنشاء حساب جديد</h1>
    <p className="mt-2 text-[var(--muted)]">ابدأ رحلتك الغذائية وسنحتفظ ببيانات المتابعة والحجوزات في حسابك.</p>
    <form onSubmit={submit} className="mt-8 space-y-5">
      <label className="block"><span className="mb-2 block font-semibold">الاسم الكامل</span><input required value={name} onChange={e => setName(e.target.value)} className="w-full rounded-xl border border-[var(--border)] px-4 py-3 outline-none focus:border-[var(--primary)]" autoComplete="name" /></label>
      <label className="block"><span className="mb-2 block font-semibold">رقم الجوال</span><input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full rounded-xl border border-[var(--border)] px-4 py-3 outline-none focus:border-[var(--primary)]" autoComplete="tel" /></label>
      <label className="block"><span className="mb-2 block font-semibold">البريد الإلكتروني</span><input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full rounded-xl border border-[var(--border)] px-4 py-3 outline-none focus:border-[var(--primary)]" autoComplete="email" /></label>
      <label className="block"><span className="mb-2 block font-semibold">كلمة المرور</span><input required minLength={8} type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full rounded-xl border border-[var(--border)] px-4 py-3 outline-none focus:border-[var(--primary)]" autoComplete="new-password" /><span className="mt-1 block text-xs text-[var(--muted)]">8 أحرف على الأقل.</span></label>
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {message && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>}
      <button type="submit" disabled={pending} className="w-full rounded-xl bg-[var(--primary)] px-5 py-3 font-bold text-white disabled:opacity-60">{pending ? "جارٍ إنشاء الحساب..." : "إنشاء الحساب"}</button>
    </form>
    <p className="mt-6 text-center text-sm text-[var(--muted)]">لديك حساب بالفعل؟ <Link href={`/auth/login?next=${encodeURIComponent(next)}`} className="font-semibold text-[var(--primary)]">تسجيل الدخول</Link></p>
  </section>;
}
