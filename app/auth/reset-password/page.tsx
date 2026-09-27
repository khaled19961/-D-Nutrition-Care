"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);
  const [checking, setChecking] = useState(true);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const supabase = createSupabaseBrowserClient();

    async function initialize() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const recovery = params.get("recovery") === "1";

      if (!recovery) {
        if (active) {
          setError("افتح رابط إعادة تعيين كلمة المرور من بريدك الإلكتروني.");
          setChecking(false);
        }
        return;
      }

      try {
        if (code) {
          const { error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) throw exchangeError;

          const clean = new URL(window.location.href);
          clean.searchParams.delete("code");
          clean.searchParams.delete("recovery");
          window.history.replaceState({}, "", clean.pathname + clean.search);
        }

        const { data, error: sessionError } = await supabase.auth.getSession();

        if (!active) return;

        if (sessionError || !data.session) {
          setError("رابط الاستعادة غير صالح أو منتهي. اطلب رابطاً جديداً.");
          setReady(false);
        } else {
          setReady(true);
          setError("");
        }
      } catch {
        if (active) {
          setError("تعذر التحقق من رابط الاستعادة. اطلب رابطاً جديداً.");
          setReady(false);
        }
      } finally {
        if (active) setChecking(false);
      }
    }

    initialize();

    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!ready) {
      setError("لا توجد جلسة صالحة لإعادة تعيين كلمة المرور.");
      return;
    }

    if (password.length < 8) {
      setError("كلمة المرور يجب أن تكون 8 أحرف على الأقل.");
      return;
    }

    if (password !== confirm) {
      setError("كلمتا المرور غير متطابقتين.");
      return;
    }

    setPending(true);

    const supabase = createSupabaseBrowserClient();
    const { error: updateError } =
      await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setPending(false);
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <main dir="rtl" className="min-h-screen bg-[var(--background)] py-12">
      <div className="container flex min-h-[80vh] items-center justify-center">
        <section className="w-full max-w-md rounded-3xl border border-[var(--border)] bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-extrabold">
            تعيين كلمة مرور جديدة
          </h1>

          <p className="mt-2 text-[var(--muted)]">
            اختر كلمة مرور جديدة لحسابك.
          </p>

          {checking ? (
            <p className="mt-8 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
              جارٍ التحقق من رابط الاستعادة...
            </p>
          ) : !ready ? (
            <div className="mt-8 space-y-4">
              <p
                className="rounded-xl bg-red-50 p-3 text-sm text-red-700"
                role="alert"
              >
                {error}
              </p>

              <Link
                href="/auth/forgot-password"
                className="block w-full rounded-xl bg-[var(--primary)] px-5 py-3 text-center font-bold text-white"
              >
                طلب رابط جديد
              </Link>

              <Link
                href="/auth/login"
                className="block text-center text-sm font-semibold text-[var(--primary)]"
              >
                العودة لتسجيل الدخول
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <input
                required
                minLength={8}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="كلمة المرور الجديدة"
                autoComplete="new-password"
                className="w-full rounded-xl border border-[var(--border)] px-4 py-3 outline-none"
              />

              <input
                required
                minLength={8}
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="تأكيد كلمة المرور"
                autoComplete="new-password"
                className="w-full rounded-xl border border-[var(--border)] px-4 py-3 outline-none"
              />

              {error && (
                <p
                  className="rounded-xl bg-red-50 p-3 text-sm text-red-700"
                  role="alert"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={pending}
                className="w-full rounded-xl bg-[var(--primary)] px-5 py-3 font-bold text-white disabled:opacity-60"
              >
                {pending ? "جارٍ الحفظ..." : "حفظ كلمة المرور"}
              </button>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}
