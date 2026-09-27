"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { SiteChrome } from "@/components/site-chrome";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const passwordRecovery = searchParams.get("recovery") === "1";
  const callbackError = searchParams.get("error");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const supabase = createSupabaseBrowserClient();

    async function checkRecoverySession() {
      const { data, error } = await supabase.auth.getSession();
      if (!active) return;

      if (error || !data.session) {
        setError(
          callbackError === "auth_callback"
            ? "تعذر التحقق من رابط الاستعادة. اطلب رابطاً جديداً ثم افتحه من نفس المتصفح الذي طلبت منه الاستعادة."
            : "رابط إعادة تعيين كلمة المرور غير صالح أو منتهي. اطلب رابطاً جديداً ثم افتحه من بريدك الإلكتروني."
        );
        setReady(false);
      } else if (passwordRecovery) {
        setReady(true);
      } else {
        setError("افتح رابط إعادة تعيين كلمة المرور من بريدك الإلكتروني للمتابعة.");
        setReady(false);
      }
      setCheckingSession(false);
    }

    checkRecoverySession();

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === "PASSWORD_RECOVERY" && session) {
        setReady(true);
        setError("");
        setCheckingSession(false);
      }
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [callbackError, passwordRecovery]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!ready) {
      setError("لا توجد جلسة صالحة لإعادة تعيين كلمة المرور. اطلب رابطاً جديداً.");
      return;
    }
    if (password.length < 8) return setError("كلمة المرور يجب أن تكون 8 أحرف على الأقل.");
    if (password !== confirm) return setError("كلمتا المرور غير متطابقتين.");

    setPending(true);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setPending(false);
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <SiteChrome>
      <main className="min-h-screen bg-[var(--background)] py-12">
        <div className="container flex min-h-[70vh] items-center justify-center">
          <section className="w-full max-w-md rounded-3xl border border-[var(--border)] bg-white p-8 shadow-sm">
            <h1 className="text-3xl font-extrabold">تعيين كلمة مرور جديدة</h1>
            <p className="mt-2 text-[var(--muted)]">اختر كلمة مرور جديدة لحسابك.</p>

            {checkingSession ? (
              <p className="mt-8 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">جارٍ التحقق من رابط الاستعادة...</p>
            ) : !ready ? (
              <div className="mt-8 space-y-4">
                {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}
                <Link href="/auth/forgot-password" className="block w-full rounded-xl bg-[var(--primary)] px-5 py-3 text-center font-bold text-white">طلب رابط جديد</Link>
                <Link href="/auth/login" className="block text-center text-sm font-semibold text-[var(--primary)]">العودة لتسجيل الدخول</Link>
              </div>
            ) : (
              <>
                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                  <input required minLength={8} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="كلمة المرور الجديدة" autoComplete="new-password" className="w-full rounded-xl border border-[var(--border)] px-4 py-3 outline-none focus:border-[var(--primary)]" />
                  <input required minLength={8} type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="تأكيد كلمة المرور" autoComplete="new-password" className="w-full rounded-xl border border-[var(--border)] px-4 py-3 outline-none focus:border-[var(--primary)]" />
                  {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}
                  <button disabled={pending} className="w-full rounded-xl bg-[var(--primary)] px-5 py-3 font-bold text-white disabled:opacity-60">{pending ? "جارٍ الحفظ..." : "حفظ كلمة المرور"}</button>
                </form>
                <Link href="/auth/login" className="mt-6 block text-center text-sm font-semibold text-[var(--primary)]">العودة لتسجيل الدخول</Link>
              </>
            )}
          </section>
        </div>
      </main>
    </SiteChrome>
  );
}
