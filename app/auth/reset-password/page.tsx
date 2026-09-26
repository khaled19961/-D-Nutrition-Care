"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

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
    <main className="min-h-screen bg-[var(--background)] py-12">
      <div className="container flex min-h-[80vh] items-center justify-center">
        <section className="w-full max-w-md rounded-3xl border border-[var(--border)] bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-extrabold">تعيين كلمة مرور جديدة</h1>
          <p className="mt-2 text-[var(--muted)]">اختر كلمة مرور جديدة لحسابك.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <input required minLength={8} type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="كلمة المرور الجديدة"
              className="w-full rounded-xl border border-[var(--border)] px-4 py-3 outline-none focus:border-[var(--primary)]" />
            <input required minLength={8} type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
              placeholder="تأكيد كلمة المرور"
              className="w-full rounded-xl border border-[var(--border)] px-4 py-3 outline-none focus:border-[var(--primary)]" />
            {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            <button disabled={pending} className="w-full rounded-xl bg-[var(--primary)] px-5 py-3 font-bold text-white disabled:opacity-60">
              {pending ? "جارٍ الحفظ..." : "حفظ كلمة المرور"}
            </button>
          </form>

          <Link href="/auth/login" className="mt-6 block text-center text-sm font-semibold text-[var(--primary)]">العودة لتسجيل الدخول</Link>
        </section>
      </div>
    </main>
  );
}
