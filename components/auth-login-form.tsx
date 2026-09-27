"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type Mode = "login" | "register";
type IdentifierType = "email" | "phone";

function safeNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  return value;
}

function authErrorMessage(error: { code?: string; message?: string }) {
  switch (error.code) {
    case "invalid_credentials": return "بيانات الدخول غير صحيحة.";
    case "email_not_confirmed": return "يجب تأكيد البريد الإلكتروني أولاً.";
    case "user_already_exists": return "يوجد حساب بهذه البيانات بالفعل. جرّب تسجيل الدخول.";
    case "email_address_invalid": return "البريد الإلكتروني غير صحيح.";
    case "phone_exists": return "رقم الهاتف مستخدم بالفعل.";
    case "weak_password": return "كلمة المرور ضعيفة. استخدم كلمة مرور أقوى لا تقل عن 8 أحرف.";
    case "over_email_send_rate_limit": return "تم تجاوز حد إرسال رسائل البريد مؤقتاً. انتظر قليلاً ثم حاول مرة أخرى.";
    case "over_sms_send_rate_limit": return "تم تجاوز حد إرسال الرسائل النصية مؤقتاً. انتظر قليلاً ثم حاول مرة أخرى.";
    case "provider_disabled": return "طريقة الدخول هذه غير مفعلة حالياً.";
    default: return error.message || "تعذر تنفيذ العملية حالياً. حاول مرة أخرى.";
  }
}

function getIdentifierType(value: string): IdentifierType | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return "email";
  if (/^\+?[0-9\s()-]{8,20}$/.test(trimmed)) return "phone";
  return null;
}

export default function AuthLoginForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = safeNextPath(sp.get("next"));
  const requestedMode = sp.get("mode") === "register" ? "register" : "login";
  const [mode, setMode] = useState<Mode>(requestedMode);
  const [identifier, setIdentifier] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [pending, setPending] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationType, setVerificationType] = useState<IdentifierType>("email");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  function switchMode(nextMode: Mode) {
    setMode(nextMode);
    setError("");
    setMessage("");
    setVerificationSent(false);
    setCode("");
    const url = new URL(window.location.href);
    url.searchParams.set("mode", nextMode);
    window.history.replaceState(null, "", url.toString());
  }

  async function sendVerification(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = identifier.trim();
    const type = getIdentifierType(value);
    setError("");
    setMessage("");
    if (!type) {
      setError("أدخل بريداً إلكترونياً صحيحاً أو رقم هاتف بصيغة صحيحة.");
      return;
    }
    setPending(true);
    try {
      const result = type === "email"
        ? await supabase.auth.signInWithOtp({ email: value, options: { shouldCreateUser: false } })
        : await supabase.auth.signInWithOtp({ phone: value, options: { shouldCreateUser: false } });
      if (result.error) {
        setError(authErrorMessage(result.error));
        return;
      }
      setVerificationType(type);
      setVerificationSent(true);
      setMessage(type === "email" ? "تم إرسال رمز التحقق إلى بريدك الإلكتروني." : "تم إرسال رمز التحقق إلى رقم هاتفك.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر إرسال رمز التحقق حالياً.");
    } finally {
      setPending(false);
    }
  }

  async function verifyCode(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!/^\d{6}$/.test(code.trim())) {
      setError("أدخل رمز التحقق المكوّن من 6 أرقام.");
      return;
    }
    setPending(true);
    setError("");
    try {
      const result = verificationType === "email"
        ? await supabase.auth.verifyOtp({ email: identifier.trim(), token: code.trim(), type: "email" })
        : await supabase.auth.verifyOtp({ phone: identifier.trim(), token: code.trim(), type: "sms" });
      if (result.error) {
        setError(authErrorMessage(result.error));
        return;
      }
      router.replace(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر التحقق من الرمز حالياً.");
    } finally {
      setPending(false);
    }
  }

  async function register(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setMessage("");
    if (password.length < 8) {
      setError("كلمة المرور يجب ألا تقل عن 8 أحرف.");
      return;
    }
    if (password !== confirmPassword) {
      setError("تأكيد كلمة المرور غير مطابق.");
      return;
    }
    if (!acceptedTerms) {
      setError("يجب الموافقة على الشروط والأحكام وسياسة الخصوصية.");
      return;
    }
    setPending(true);
    try {
      const redirectUrl = new URL("/auth/callback", window.location.origin);
      redirectUrl.searchParams.set("next", next);
      const result = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: name.trim(), phone: phone.trim() },
          emailRedirectTo: redirectUrl.toString()
        }
      });
      if (result.error) {
        setError(authErrorMessage(result.error));
        return;
      }
      if (result.data.session) {
        router.replace(next);
        router.refresh();
        return;
      }
      setMessage("تم إنشاء الحساب. راجع بريدك الإلكتروني واضغط رابط التأكيد ثم سجّل الدخول.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر إنشاء الحساب حالياً.");
    } finally {
      setPending(false);
    }
  }

  async function oauth(provider: "google" | "apple") {
    setPending(true);
    setError("");
    try {
      const redirectUrl = new URL("/auth/callback", window.location.origin);
      redirectUrl.searchParams.set("next", next);
      const result = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: redirectUrl.toString() }
      });
      if (result.error) setError(authErrorMessage(result.error));
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر بدء تسجيل الدخول بالحساب الخارجي.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="auth-page" dir="rtl">
      <div className="auth-card">
        <Link href="/" className="auth-brand">d-nutrition-care</Link>
        <p className="auth-tagline">رحلتك الصحية تبدأ هنا</p>

        <div className="auth-tabs" role="tablist" aria-label="اختيار طريقة الحساب">
          <button type="button" role="tab" aria-selected={mode === "register"} className={mode === "register" ? "is-active" : ""} onClick={() => switchMode("register")}>إنشاء حساب</button>
          <button type="button" role="tab" aria-selected={mode === "login"} className={mode === "login" ? "is-active" : ""} onClick={() => switchMode("login")}>تسجيل الدخول</button>
        </div>

        {mode === "login" ? (
          verificationSent ? (
            <form onSubmit={verifyCode} className="auth-form">
              <div className="auth-code-heading">
                <h1>أدخل رمز التحقق</h1>
                <p>{verificationType === "email" ? "أرسلنا الرمز إلى بريدك الإلكتروني." : "أرسلنا الرمز إلى رقم هاتفك."}</p>
              </div>
              <label><span>رمز التحقق</span><input required inputMode="numeric" maxLength={6} value={code} onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="000000" autoComplete="one-time-code" /></label>
              {error && <p className="auth-error" role="alert">{error}</p>}
              {message && <p className="auth-success" role="status">{message}</p>}
              <button className="auth-primary" disabled={pending}>{pending ? "جارٍ التحقق..." : "تحقق ودخول"}</button>
              <div className="auth-code-actions">
                <button type="button" onClick={() => { setVerificationSent(false); setCode(""); setMessage(""); setError(""); }}>تغيير البريد أو رقم الهاتف</button>
                <button type="button" onClick={() => { setVerificationSent(false); setMessage(""); setCode(""); }}>إرسال رمز جديد</button>
              </div>
            </form>
          ) : (
            <form onSubmit={sendVerification} className="auth-form">
              <label><span>البريد الإلكتروني أو رقم الهاتف</span><input required value={identifier} onChange={e => setIdentifier(e.target.value)} placeholder="أدخل البريد الإلكتروني أو رقم الهاتف" autoComplete="username" /></label>
              {error && <p className="auth-error" role="alert">{error}</p>}
              {message && <p className="auth-success" role="status">{message}</p>}
              <button className="auth-primary" disabled={pending}>{pending ? "جارٍ إرسال الرمز..." : "إرسال رمز التحقق"}</button>
              <div className="auth-divider"><span>أو تابع باستخدام</span></div>
              <div className="auth-socials">
                <button type="button" onClick={() => oauth("apple")} disabled={pending}><span className="auth-apple">●</span> Apple</button>
                <button type="button" onClick={() => oauth("google")} disabled={pending}><span className="auth-google">G</span> Google</button>
              </div>
            </form>
          )
        ) : (
          <form onSubmit={register} className="auth-form">
            <label><span>الاسم الكامل</span><input required value={name} onChange={e => setName(e.target.value)} placeholder="أدخل الاسم الكامل" autoComplete="name" /></label>
            <label><span>البريد الإلكتروني</span><input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="أدخل البريد الإلكتروني" autoComplete="email" /></label>
            <label><span>رقم الهاتف</span><input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="أدخل رقم الهاتف" autoComplete="tel" /></label>
            <label><span>كلمة المرور</span><input required minLength={8} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="أدخل كلمة المرور" autoComplete="new-password" /></label>
            <label><span>تأكيد كلمة المرور</span><input required minLength={8} type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="أعد إدخال كلمة المرور" autoComplete="new-password" /></label>
            <label className="auth-terms"><input type="checkbox" checked={acceptedTerms} onChange={e => setAcceptedTerms(e.target.checked)} /><span>أوافق على <Link href="/more#policies">الشروط والأحكام</Link> و<Link href="/more#policies"> سياسة الخصوصية</Link></span></label>
            {error && <p className="auth-error" role="alert">{error}</p>}
            {message && <p className="auth-success" role="status">{message}</p>}
            <button className="auth-primary" disabled={pending}>{pending ? "جارٍ إنشاء الحساب..." : "إنشاء الحساب"}</button>
            <div className="auth-divider"><span>أو تابع باستخدام</span></div>
            <div className="auth-socials">
              <button type="button" onClick={() => oauth("apple")} disabled={pending}><span className="auth-apple">●</span> Apple</button>
              <button type="button" onClick={() => oauth("google")} disabled={pending}><span className="auth-google">G</span> Google</button>
            </div>
          </form>
        )}

        <Link href="/" className="auth-home-link">العودة للرئيسية</Link>
      </div>
    </main>
  );
}
