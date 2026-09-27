"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type Mode = "login" | "register";
type LoginMethod = "password" | "otp";
type OtpPurpose = "login" | "register";

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
    case "weak_password": return "كلمة المرور يجب أن تكون أقوى ولا تقل عن 8 أحرف.";
    case "over_email_send_rate_limit": return "تم تجاوز حد إرسال البريد مؤقتاً. انتظر قليلاً ثم حاول مرة أخرى.";
    case "provider_disabled": return "طريقة الدخول هذه غير مفعلة حالياً.";
    default: return error.message || "تعذر تنفيذ العملية حالياً. حاول مرة أخرى.";
  }
}

function getPhone(value: string) {
  const trimmed = value.trim();
  return /^\+?[0-9\s()-]{8,20}$/.test(trimmed) ? trimmed.replace(/[\s()-]/g, "") : null;
}

export default function AuthLoginForm() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const next = safeNextPath(sp.get("next"));
  const pathMode: Mode = pathname === "/auth/register" ? "register" : "login";
  const requestedMode = sp.get("mode") === "register" ? "register" : pathMode;

  const [mode, setMode] = useState<Mode>(requestedMode);
  const [loginMethod, setLoginMethod] = useState<LoginMethod>("password");
  const [identifier, setIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpPurpose, setOtpPurpose] = useState<OtpPurpose>("login");
  const [otpEmail, setOtpEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  function switchMode(nextMode: Mode) {
    setMode(nextMode);
    setError("");
    setMessage("");
    setOtpSent(false);
    setOtp("");
    const url = new URL(window.location.href);
    url.searchParams.set("mode", nextMode);
    window.history.replaceState(null, "", url.toString());
  }

  async function loginWithPassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setMessage("");
    const value = identifier.trim();
    if (!value || !loginPassword) return setError("أدخل بيانات الدخول.");

    setPending(true);
    try {
      const phoneValue = getPhone(value);
      const result = phoneValue
        ? await supabase.auth.signInWithPassword({ phone: phoneValue, password: loginPassword })
        : await supabase.auth.signInWithPassword({ email: value, password: loginPassword });

      if (result.error) {
        setError(authErrorMessage(result.error));
        return;
      }
      router.replace(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر تسجيل الدخول حالياً.");
    } finally {
      setPending(false);
    }
  }

  async function sendLoginOtp(e?: FormEvent<HTMLFormElement>) {
    e?.preventDefault();
    setError("");
    setMessage("");
    const value = identifier.trim();
    if (!value || !value.includes("@")) return setError("أدخل بريداً إلكترونياً صحيحاً لاستخدام رمز OTP.");

    setPending(true);
    try {
      const result = await supabase.auth.signInWithOtp({
        email: value,
        options: {
          shouldCreateUser: false,
          emailRedirectTo: window.location.origin + "/auth/callback?next=" + encodeURIComponent(next)
        }
      });
      if (result.error) {
        setError(authErrorMessage(result.error));
        return;
      }
      setOtpEmail(value);
      setOtpPurpose("login");
      setOtp("");
      setOtpSent(true);
      setMessage("تم إرسال رمز التحقق إلى بريدك الإلكتروني.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر إرسال رمز التحقق.");
    } finally {
      setPending(false);
    }
  }

  async function verifyOtp(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setMessage("");
    const token = otp.trim();
    if (!/^\d{6,8}$/.test(token)) return setError("أدخل رمز التحقق المرسل إلى بريدك.");

    setPending(true);
    try {
      const type = "email";
      const result = await supabase.auth.verifyOtp({ email: otpEmail, token, type });
      if (result.error) {
        setError(authErrorMessage(result.error));
        return;
      }
      router.replace(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "رمز التحقق غير صالح أو منتهي.");
    } finally {
      setPending(false);
    }
  }

  async function resendConfirmation() {
    const value = identifier.trim();
    if (!value.includes("@")) {
      setError("أدخل البريد الإلكتروني المرتبط بالحساب.");
      return;
    }
    setPending(true);
    setError("");
    setMessage("");
    try {
      const result = await supabase.auth.resend({
        type: "signup",
        email: value,
        options: { emailRedirectTo: window.location.origin + "/auth/callback?next=" + encodeURIComponent(next) }
      });
      if (result.error) setError(authErrorMessage(result.error));
      else setMessage("تم طلب رسالة تأكيد جديدة. افحص بريدك.");
    } finally {
      setPending(false);
    }
  }

  async function register(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!email.trim()) return setError("أدخل البريد الإلكتروني.");
    if (password.length < 8) return setError("كلمة المرور يجب ألا تقل عن 8 أحرف.");
    if (password !== confirmPassword) return setError("تأكيد كلمة المرور غير مطابق.");
    if (!acceptedTerms) return setError("يجب الموافقة على الشروط والأحكام وسياسة الخصوصية.");

    setPending(true);
    try {
      const result = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: name.trim(), phone: phone.trim() },
          emailRedirectTo: window.location.origin + "/auth/callback?next=" + encodeURIComponent(next)
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

      setOtpEmail(email.trim());
      setOtpPurpose("register");
      setOtp("");
      setOtpSent(true);
      setMode("login");
      setLoginMethod("otp");
      setMessage("تم إنشاء الحساب. أرسلنا رمز تأكيد إلى بريدك الإلكتروني.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر إنشاء الحساب حالياً.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="auth-page" dir="rtl">
      <div className="auth-card">
        <Link href="/" className="auth-brand">d-nutrition-care</Link>
        <p className="auth-tagline">رحلتك الصحية تبدأ هنا</p>

        <div className="auth-tabs" role="tablist">
          <button type="button" role="tab" aria-selected={mode === "register"} className={mode === "register" ? "is-active" : ""} onClick={() => switchMode("register")}>إنشاء حساب</button>
          <button type="button" role="tab" aria-selected={mode === "login"} className={mode === "login" ? "is-active" : ""} onClick={() => switchMode("login")}>تسجيل الدخول</button>
        </div>

        {mode === "login" ? (
          <div className="auth-form">
            <div className="auth-method-tabs">
              <button type="button" className={loginMethod === "password" ? "is-active" : ""} onClick={() => {setLoginMethod("password");setOtpSent(false);setError("");setMessage("");}}>كلمة المرور</button>
              <button type="button" className={loginMethod === "otp" ? "is-active" : ""} onClick={() => {setLoginMethod("otp");setOtpSent(false);setError("");setMessage("");}}>رمز OTP</button>
            </div>

            {loginMethod === "password" ? (
              <form onSubmit={loginWithPassword} className="auth-form">
                <label><span>البريد الإلكتروني أو رقم الهاتف</span><input required value={identifier} onChange={e => setIdentifier(e.target.value)} placeholder="أدخل البريد الإلكتروني أو رقم الهاتف" autoComplete="username" /></label>
                <label><span>كلمة المرور</span><input required type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="أدخل كلمة المرور" autoComplete="current-password" /></label>
                {error && <p className="auth-error" role="alert">{error}</p>}
                {message && <p className="auth-success" role="status">{message}</p>}
                <button className="auth-primary" disabled={pending}>{pending ? "جارٍ تسجيل الدخول..." : "تسجيل الدخول"}</button>
                <div className="auth-login-links">
                  <Link href="/auth/forgot-password">نسيت كلمة المرور؟</Link>
                  <button type="button" onClick={resendConfirmation} disabled={pending}>إعادة إرسال تأكيد البريد</button>
                </div>
              </form>
            ) : !otpSent ? (
              <form onSubmit={sendLoginOtp} className="auth-form">
                <label><span>البريد الإلكتروني</span><input required type="email" value={identifier} onChange={e => setIdentifier(e.target.value)} placeholder="أدخل بريدك الإلكتروني" autoComplete="email" /></label>
                {error && <p className="auth-error" role="alert">{error}</p>}
                {message && <p className="auth-success" role="status">{message}</p>}
                <button className="auth-primary" disabled={pending}>{pending ? "جارٍ إرسال الرمز..." : "إرسال رمز OTP"}</button>
              </form>
            ) : (
              <form onSubmit={verifyOtp} className="auth-form">
                <p className="auth-otp-info">أدخل رمز التحقق المرسل إلى <strong>{otpEmail}</strong></p>
                <label><span>رمز OTP</span><input required inputMode="numeric" autoComplete="one-time-code" maxLength={8} value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ""))} placeholder="أدخل رمز التحقق" /></label>
                {error && <p className="auth-error" role="alert">{error}</p>}
                {message && <p className="auth-success" role="status">{message}</p>}
                <button className="auth-primary" disabled={pending}>{pending ? "جارٍ التحقق..." : "تأكيد الرمز"}</button>
                <button type="button" className="auth-secondary" disabled={pending} onClick={() => {setOtpSent(false);setOtp("");setError("");setMessage("");}}>إرسال رمز جديد</button>
              </form>
            )}
          </div>
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
          </form>
        )}

        <Link href="/" className="auth-home-link">العودة للرئيسية</Link>
      </div>
    </main>
  );
}
