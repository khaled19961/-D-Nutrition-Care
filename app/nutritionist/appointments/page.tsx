"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type Appointment = {
  id: string;
  patient_id: string;
  starts_at: string;
  ends_at: string;
  status: string;
  booking_notes: string | null;
};

type Patient = { id: string; full_name: string | null; phone: string | null };

const statusLabels: Record<string, string> = {
  pending: "بانتظار التأكيد",
  confirmed: "مؤكد",
  completed: "مكتمل",
  cancelled: "ملغي",
  no_show: "لم يحضر"
};

export default function NutritionistAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Record<string, Patient>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    const supabase = createSupabaseBrowserClient();
    const { data: user } = await supabase.auth.getUser();

    if (!user.user) {
      setError("انتهت جلسة الدخول. سجل الدخول مرة أخرى.");
      setLoading(false);
      return;
    }

    const { data: nutritionist, error: nutritionistError } = await supabase
      .from("nutritionists")
      .select("id")
      .eq("profile_id", user.user.id)
      .maybeSingle();

    if (nutritionistError || !nutritionist) {
      setError("لم يتم العثور على ملف الأخصائي.");
      setLoading(false);
      return;
    }

    const { data, error: appointmentsError } = await supabase
      .from("appointments")
      .select("id,patient_id,starts_at,ends_at,status,booking_notes")
      .eq("nutritionist_id", nutritionist.id)
      .order("starts_at", { ascending: true })
      .limit(100);

    if (appointmentsError) {
      setError("تعذر تحميل الحجوزات.");
      setLoading(false);
      return;
    }

    const rows = data ?? [];
    const ids = [...new Set(rows.map((item) => item.patient_id))];
    const { data: patientRows } = ids.length
      ? await supabase.from("profiles").select("id,full_name,phone").in("id", ids)
      : { data: [] };

    setAppointments(rows);
    setPatients(Object.fromEntries((patientRows ?? []).map((patient) => [patient.id, patient])));
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function updateStatus(appointment: Appointment, status: "confirmed" | "completed" | "cancelled" | "no_show") {
    setSavingId(appointment.id);
    setError("");
    const supabase = createSupabaseBrowserClient();
    const { error: updateError } = await supabase
      .from("appointments")
      .update({ status })
      .eq("id", appointment.id);

    setSavingId("");
    if (updateError) {
      setError("تعذر تحديث حالة الحجز.");
      return;
    }
    await load();
  }

  return (
    <main className="dashboard-page">
      <div className="dashboard-page-head">
        <div>
          <span className="eyebrow">إدارة المواعيد</span>
          <h1>الحجوزات</h1>
          <p>راجع مواعيد المرضى وحدّث حالة كل حجز بعد المتابعة.</p>
        </div>
      </div>

      {error && <div className="form-message error">{error}</div>}

      <div className="dashboard-panel appointments-panel">
        {loading ? <div className="empty-state compact"><p>جاري تحميل الحجوزات...</p></div> :
          appointments.length ? <div className="appointments-list">{appointments.map((item) => {
            const patient = patients[item.patient_id];
            const canManage = ["pending", "confirmed"].includes(item.status) && new Date(item.starts_at) > new Date();
            return (
              <article key={item.id} className="appointment-row">
                <div className="appointment-person">
                  <span className="dashboard-avatar">{(patient?.full_name || "م").trim().charAt(0)}</span>
                  <div>
                    <strong>{patient?.full_name || "مريض"}</strong>
                    <small>{patient?.phone || "رقم التواصل غير متوفر"}</small>
                  </div>
                </div>
                <div className="appointment-time">
                  <strong>{new Date(item.starts_at).toLocaleDateString("ar-SA", { dateStyle: "medium" })}</strong>
                  <span>{new Date(item.starts_at).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })} - {new Date(item.ends_at).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
                <span className={`status-pill status-${item.status}`}>{statusLabels[item.status] || item.status}</span>
                {item.booking_notes && <p className="appointment-note">{item.booking_notes}</p>}
                {canManage && (
                  <div className="appointment-actions">
                    {item.status === "pending" && <button disabled={savingId === item.id} onClick={() => updateStatus(item, "confirmed")}>تأكيد الحجز</button>}
                    <button disabled={savingId === item.id} onClick={() => updateStatus(item, "completed")}>تسجيل كمكتمل</button>
                    <button disabled={savingId === item.id} onClick={() => updateStatus(item, "cancelled")}>إلغاء</button>
                  </div>
                )}
              </article>
            );
          })}</div> :
          <div className="empty-state compact"><h2>لا توجد حجوزات</h2><p>ستظهر هنا الحجوزات بمجرد أن يبدأ المرضى بالحجز من الموقع.</p></div>}
      </div>
    </main>
  );
}
