"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { getSupabaseUrl } from "@/lib/supabase/config";

export default function RecoveryIntermediaryPage() {
  const [starting, setStarting] = useState(false);

  const confirmationUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const raw = new URLSearchParams(window.location.search).get(
      "confirmation_url"
    );

    if (!raw) return "";

    try {
      const url = new URL(raw);
      const supabaseUrl = new URL(getSupabaseUrl());

      // Only allow the Supabase Auth verification endpoint generated for
      // this project. Never navigate to an arbitrary URL from the query.
      if (
        url.origin !== supabaseUrl.origin ||
        url.pathname !== "/auth/v1/verify"
      ) {
        return "";
      }

      return url.toString();
    } catch {
      return "";
    }
  }, []);

  function continueToReset() {
    if (!confirmationUrl) return;
    setStarting(true);
    window.location.assign(confirmationUrl);
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[var(--background)] px-4 py-8 sm:px-6 sm:py-12"
    >
      <div className="container flex min-h-[calc(100vh-96px)] items-center justify-center">
        <section className="forgot-password-card w-full">
          <div className="forgot-password-back">
            <Link href="/auth/login" className="forgot-password-back-link">
              العودة لتسجيل الدخول <span aria-hidden="true">←</span>
            </Link>
          </div>

          <div className="mt-7">
            <p className="text-sm font-bold text-[var(--primary)]">
              أمان حسابك
            </p>
            <h1 className="forgot-password-heading mt-2">
              متابعة استعادة كلمة المرور
            </h1>
            <p className="forgot-password-description mt-3">
              اضغط الزر أدناه للمتابعة إلى صفحة تعيين كلمة مرور جديدة.
            </p>
          </div>

          {confirmationUrl ? (
            <div className="mt-8 space-y-4">
              <button
                type="button"
                onClick={continueToReset}
                disabled={starting}
                className="forgot-password-submit"
              >
                {starting ? "جارٍ فتح صفحة الاستعادة..." : "متابعة الاستعادة"}
              </button>

              <p className="forgot-password-message" role="note">
                لن يتم استخدام رابط الاستعادة إلا بعد ضغطك على الزر.
              </p>
            </div>
          ) : (
            <div className="mt-8 space-y-4">
              <p className="forgot-password-error" role="alert">
                رابط الاستعادة غير مكتمل أو غير صالح. اطلب رابطاً جديداً من
                صفحة استعادة كلمة المرور.
              </p>

              <Link
                href="/auth/forgot-password"
                className="forgot-password-submit flex items-center justify-center"
              >
                طلب رابط جديد
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
