"use client";

import { FormEvent, useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function NutritionistProfilePage() {
  const [nutritionistId, setNutritionistId] = useState("");
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [years, setYears] = useState("");
  const [fee, setFee] = useState("");
  const [available, setAvailable] = useState(true);
  const [verification, setVerification] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createSupabaseBrowserClient();
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        setError("انتهت جلسة الدخول. سجل الدخول مرة أخرى.");
        setLoading(false);
        return;
      }

      const [{ data: profile }, { data: nutritionist, error: nutritionistError }] = await Promise.all([
        supabase.from("profiles").select("full_name").eq("id", user.user.id).maybeSingle(),
        supabase.from("nutritionists").select("id,bio,years_experience,consultation_fee,verification_status,is_available").eq("profile_id", user.user.id).maybeSingle()
      ]);

      if (nutritionistError || !nutritionist) {
        setError("لم يتم العثور على ملف الأخصائي.");
        setLoading(false);
        return;
      }

      setFullName(profile?.full_name || "");
      setNutritionistId(nutritionist.id);
      setBio(nutritionist.bio || "");
      setYears(nutritionist.years_experience == null ? "" : String(nutritionist.years_experience));
      setFee(String(nutritionist.consultation_fee ?? ""));
      setAvailable(Boolean(nutritionist.is_available));
      setVerification(nutritionist.verification_status);
      setLoading(false);
    }
    load();
  }, []);

  async function save(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");

    const yearsValue = years.trim() === "" ? null : Number(years);
    const feeValue = Number(fee);

    if (yearsValue !== null && (!Number.isInteger(yearsValue) || yearsValue < 0)) {
      setError("سنوات الخبرة يجب أن تكون رقماً صحيحاً غير سالب.");
      return;
    }
    if (!Number.isFinite(feeValue) || feeValue < 0) {
      setError("أدخل سعر الاستشارة بشكل صحيح.");
      return;
    }

    setSaving(true);
    const supabase = createSupabaseBrowserClient();

    const [profileResult, nutritionistResult] = await Promise.all([
      supabase.from("profiles").update({ full_name: fullName.trim() }).eq("id", (await supabase.auth.getUser()).data.user?.id || ""),
      supabase.from("nutritionists").update({
        bio: bio.trim() || null,
        years_experience: yearsValue,
        consultation_fee: feeValue,
        is_available: available
      }).eq("id", nutritionistId)
    ]);

    setSaving(false);

    if (profileResult.error || nutritionistResult.error) {
      setError(profileResult.error?.message || nutritionistResult.error?.message || "تعذر حفظ التعديلات.");
      return;
    }
    setMessage("تم حفظ بيانات الملف.");
  }

  if (loading) return <main className="dashboard-page"><div className="empty-state"><p>جاري تحميل الملف...</p></div></main>;

  return (
    <main className="dashboard-page">
      <div className="dashboard-page-head">
        <div>
          <span className="eyebrow">الملف المهني</span>
          <h1>ملفي كأخصائي</h1>
          <p>حدّث البيانات التي تظهر للمرضى قبل الحجز.</p>
        </div>
        <span className={`status-pill status-${verification}`}>{verification === "verified" ? "تم التحقق" : verification === "rejected" ? "مرفوض" : "قيد المراجعة"}</span>
      </div>

      <form onSubmit={save} className="dashboard-form">
        <div className="dashboard-panel">
          <div className="form-section-head"><h2>البيانات الأساسية</h2><p>هذه البيانات مرتبطة بحسابك ولا تحتاج إلى إدخالها في كل حجز.</p></div>
          <label>الاسم الكامل<input value={fullName} onChange={(e) => setFullName(e.target.value)} required /></label>
          <label>نبذة مهنية<textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={6} placeholder="اكتب نبذة واضحة عن خبرتك وطريقة عملك" /></label>
        </div>

        <div className="dashboard-panel">
          <div className="form-section-head"><h2>بيانات الحجز</h2><p>اضبط المعلومات التي يراها المريض عند اختيار الخدمة.</p></div>
          <div className="form-grid-two">
            <label>سنوات الخبرة<input type="number" min="0" step="1" value={years} onChange={(e) => setYears(e.target.value)} /></label>
            <label>سعر الاستشارة بالريال<input type="number" min="0" step="0.01" value={fee} onChange={(e) => setFee(e.target.value)} required /></label>
          </div>
          <label className="toggle-field"><input type="checkbox" checked={available} onChange={(e) => setAvailable(e.target.checked)} /><span><strong>استقبال حجوزات جديدة</strong><small>عند الإيقاف لن يظهر الملف ضمن الأخصائيين المتاحين للحجز.</small></span></label>
        </div>

        {error && <div className="form-message error">{error}</div>}
        {message && <div className="form-message success">{message}</div>}
        <button disabled={saving} className="primary-btn form-submit">{saving ? "جارٍ الحفظ..." : "حفظ التعديلات"}</button>
      </form>
    </main>
  );
}
