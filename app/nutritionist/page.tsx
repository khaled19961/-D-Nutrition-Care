import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  pending: "بانتظار التأكيد",
  confirmed: "مؤكد",
  completed: "مكتمل",
  cancelled: "ملغي",
  no_show: "لم يحضر"
};

const verificationLabels: Record<string, string> = {
  pending: "قيد المراجعة",
  verified: "تم التحقق",
  rejected: "مرفوض"
};

export default async function NutritionistDashboard() {
  const supabase = await createSupabaseServerClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims!.claims.sub as string;

  const { data: nutritionist } = await supabase
    .from("nutritionists")
    .select("id,bio,years_experience,consultation_fee,currency,verification_status,is_available")
    .eq("profile_id", userId)
    .maybeSingle();

  if (!nutritionist) {
    return (
      <main className="dashboard-page">
        <div className="empty-state">
          <h1>ملف الأخصائي غير مكتمل</h1>
          <p>لم يتم إنشاء ملف أخصائي لهذا الحساب بعد. يجب إنشاء الملف قبل استقبال الحجوزات.</p>
        </div>
      </main>
    );
  }

  const now = new Date().toISOString();
  const [{ count: servicesCount }, { count: slotsCount }, { count: appointmentsCount }, { data: upcoming }] = await Promise.all([
    supabase.from("services").select("id", { count: "exact", head: true }).eq("nutritionist_id", nutritionist.id).eq("is_active", true),
    supabase.from("availability_slots").select("id", { count: "exact", head: true }).eq("nutritionist_id", nutritionist.id).eq("status", "open").gt("starts_at", now),
    supabase.from("appointments").select("id", { count: "exact", head: true }).eq("nutritionist_id", nutritionist.id).in("status", ["pending", "confirmed"]).gt("starts_at", now),
    supabase.from("appointments").select("id,patient_id,starts_at,ends_at,status,booking_notes").eq("nutritionist_id", nutritionist.id).in("status", ["pending", "confirmed"]).gte("starts_at", now).order("starts_at", { ascending: true }).limit(5)
  ]);

  const patientIds = [...new Set((upcoming ?? []).map((item) => item.patient_id))];
  const { data: patients } = patientIds.length
    ? await supabase.from("profiles").select("id,full_name").in("id", patientIds)
    : { data: [] };

  const patientMap = new Map((patients ?? []).map((patient) => [patient.id, patient.full_name]));

  return (
    <main className="dashboard-page">
      <div className="dashboard-page-head">
        <div>
          <span className="eyebrow">مساحة العمل</span>
          <h1>نظرة عامة</h1>
          <p>كل ما تحتاجه لإدارة خدماتك ومواعيدك وحجوزات المرضى.</p>
        </div>
        <Link href="/nutritionist/availability" className="primary-btn">إضافة موعد متاح</Link>
      </div>

      <div className="dashboard-metrics">
        <Metric title="الخدمات النشطة" value={String(servicesCount ?? 0)} href="/nutritionist/services" />
        <Metric title="المواعيد المفتوحة" value={String(slotsCount ?? 0)} href="/nutritionist/availability" />
        <Metric title="الحجوزات القادمة" value={String(appointmentsCount ?? 0)} href="/nutritionist/appointments" />
      </div>

      <div className="dashboard-main-grid">
        <section className="dashboard-panel">
          <div className="dashboard-panel-head">
            <div><h2>الحجوزات القادمة</h2><p>أقرب المواعيد التي تحتاج متابعتك.</p></div>
            <Link href="/nutritionist/appointments">عرض الكل</Link>
          </div>
          <div className="dashboard-list">
            {upcoming?.length ? upcoming.map((item) => (
              <div key={item.id} className="dashboard-list-row">
                <div>
                  <strong>{patientMap.get(item.patient_id) || "مريض"}</strong>
                  <small>{new Date(item.starts_at).toLocaleString("ar-SA", { dateStyle: "medium", timeStyle: "short" })}</small>
                </div>
                <span className={`status-pill status-${item.status}`}>{statusLabels[item.status] || item.status}</span>
              </div>
            )) : <div className="empty-state compact"><p>لا توجد حجوزات قادمة حالياً.</p></div>}
          </div>
        </section>

        <section className="dashboard-panel">
          <div className="dashboard-panel-head"><div><h2>حالة الملف</h2><p>البيانات التي تؤثر على ظهورك واستقبال الحجوزات.</p></div></div>
          <div className="profile-status-list">
            <div><span>حالة التحقق</span><strong>{verificationLabels[nutritionist.verification_status] || nutritionist.verification_status}</strong></div>
            <div><span>استقبال الحجوزات</span><strong>{nutritionist.is_available ? "مفعل" : "متوقف"}</strong></div>
            <div><span>سنوات الخبرة</span><strong>{nutritionist.years_experience ?? "غير محددة"}</strong></div>
            <div><span>سعر الاستشارة</span><strong>{Number(nutritionist.consultation_fee).toLocaleString("ar-SA")} {nutritionist.currency}</strong></div>
          </div>
          <Link href="/nutritionist/profile" className="secondary-btn">مراجعة الملف</Link>
        </section>
      </div>
    </main>
  );
}

function Metric({ title, value, href }: { title: string; value: string; href: string }) {
  return <Link href={href} className="dashboard-metric"><span>{title}</span><strong>{value}</strong><small>فتح الإدارة</small></Link>;
}
