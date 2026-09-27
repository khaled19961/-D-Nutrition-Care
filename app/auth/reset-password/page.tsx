"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

function getPasswordError(error: { code?: string; message?: string } | null) {
  if (!error) return "";

  switch (error.code) {
    case "same_password":
      return "كلمة المرور الجديدة يجب أن تكون مختلفة عن كلمة المرور الحالية.";
    case "weak_password":
      return "كلمة المرور ضعيفة. اختر كلمة مرور أقوى وتأكد من استيفاء متطلبات الأمان.";
    case "reauthentication_needed":
      return "يلزم التحقق من هويتك مرة أخرى قبل تغيير كلمة المرور. اطلب رابط استعادة جديداً.";
    case "flow_state_expired":
    case "flow_state_not_found":
      return "انتهت صلاحية رابط الاستعادة. اطلب رابطاً جديداً ثم افتحه من البريد الإلكتروني.";
    default:
      return "تعذر تغيير كلمة المرور حالياً. حاول مرة أخرى أو اطلب رابط استعادة جديداً.";
  }
}

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
      const recovery = params.get("recovery") === "1";
      const code = params.get("code");

      if (!recovery) {
        if (active) {
          setError("افتح رابط استعادة كلمة المرور من البريد الإلكتروني.");
          setChecking(false);
        }
        return;
      }

      try {
        let sessionError = null;

        if (code) {
          const result = await supabase.auth.exchangeCodeForSession(code);
          sessionError = result.error;
        } else {
          const result = await supabase.auth.getSession();
          sessionError = result.error;
        }

        const clean = new URL(window.location.href);
        clean.searchParams.delete("recovery");
        clean.searchParams.delete("code");
        window.history.replaceState({}, "", clean.pathname + clean.search);

        if (!active) return;

        const { data } = await supabase.auth.getSession();

        if (sessionError || !data.session) {
          setError("رابط استعادة كلمة المرور غير صالح أو انتهت صلاحيته. اطلب رابطاً جديداً.");
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
      setError("لا توجد جلسة صالحة لتغيير كلمة المرور. اطلب رابط استعادة جديداً.");
      return;
    }

    if (password.length < 8) {
      setError("كلمة المرور يجب أن تحتوي على 8 أحرف أو أكثر.");
      return;
    }

    if (password !== confirm) {
      setError("كلمتا المرور غير متطابقتين. تأكد من إدخالهما بالطريقة نفسها.");
      return;
    }

    setPending(true);

    const supabase = createSupabaseBrowserClient();
    const { error: updateError } =
      await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(getPasswordError(updateError));
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
            اختر كلمة مرور جديدة وآمنة لحسابك.
          </p>

          {checking ? (
            <p className="mt-8 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
              جارٍ التحقق من رابط الاستعادة...
            </p>
          ) : !ready ? (
            <div className="mt-8 space-y-4">
              <p
                className="rounded-xl bg-red-50 p-3 text-sm leading-6 text-red-700"
                role="alert"
              >
                {error}
              </p>

              <Link
                href="/auth/forgot-password"
                className="block w-full rounded-xl bg-[var(--primary)] px-5 py-3 text-center font-bold text-white"
              >
                طلب رابط استعادة جديد
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
              <div>
                <label
                  htmlFor="new-password"
                  className="mb-2 block text-sm font-bold"
                >
                  كلمة المرور الجديدة
                </label>
                <input
                  id="new-password"
                  required
                  minLength={8}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور الجديدة"
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-[var(--border)] px-4 py-3 outline-none"
                />
                <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
                  استخدم 8 أحرف أو أكثر واختر كلمة مرور مختلفة عن القديمة.
                </p>
              </div>

              <div>
                <label
                  htmlFor="confirm-password"
                  className="mb-2 block text-sm font-bold"
                >
                  تأكيد كلمة المرور
                </label>
                <input
                  id="confirm-password"
                  required
                  minLength={8}
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="أعد كتابة كلمة المرور"
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-[var(--border)] px-4 py-3 outline-none"
                />
              </div>

              {error && (
                <p
                  className="rounded-xl bg-red-50 p-3 text-sm leading-6 text-red-700"
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
                {pending ? "جارٍ حفظ كلمة المرور..." : "حفظ كلمة المرور الجديدة"}
              </button>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}
