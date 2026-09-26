"use client";

import { FormEvent, useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function ProfilePage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createSupabaseBrowserClient();
      const [{ data: userData }, { data: profile, error }] = await Promise.all([
        supabase.auth.getUser(),
        supabase.from("profiles").select("full_name,phone").single()
      ]);

      if (error) setError(error.message);
      setEmail(userData.user?.email ?? "");
      setName(profile?.full_name ?? "");
      setPhone(profile?.phone ?? "");
      setPending(false);
    }
    load();
  }, []);

  async function save(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from("profiles").update({
      full_name: name.trim(),
      phone: phone.trim()
    }).select("id").single();

    if (error) setError(error.message);
    else setMessage("تم حفظ بيانات الملف الشخصي.");
    setSaving(false);
  }

  async function logout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }
  return (
    <main className="container py-10">
      <h1 className="text-3xl font-extrabold">الملف الشخصي</h1>
      <p className="mt-2 text-[var(--muted)]">حدّث بيانات التواصل الخاصة بك.</p>

      <section className="mt-8 max-w-2xl rounded-3xl border border-[var(--border)] bg-white p-6">
        {pending ? <p>جارٍ تحميل البيانات...</p> : (
          <form onSubmit={save} className="space-y-5">
            <label className="block">
              <span className="mb-2 block font-semibold">البريد الإلكتروني</span>
              <input value={email} disabled className="w-full rounded-xl border border-[var(--border)] bg-slate-50 px-4 py-3" />
            </label>
            <label className="block">
              <span className="mb-2 block font-semibold">الاسم الكامل</span>
              <input required value={name} onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-[var(--border)] px-4 py-3" />
            </label>
            <label className="block">
              <span className="mb-2 block font-semibold">رقم الجوال</span>
              <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-[var(--border)] px-4 py-3" />
            </label>

            {error && <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
            {message && <p className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">{message}</p>}

            <div className="flex flex-wrap gap-3">
              <button disabled={saving} className="rounded-xl bg-[var(--primary)] px-5 py-3 font-bold text-white disabled:opacity-50">
                {saving ? "جارٍ الحفظ..." : "حفظ التغييرات"}
              </button>
              <button type="button" onClick={logout} className="rounded-xl border border-[var(--border)] px-5 py-3 font-semibold">
                تسجيل الخروج
              </button>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}
