import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

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
    return <main className="container py-12"><div className="rounded-3xl bg-white p-8">لم يتم إنشاء ملف أخصائي لهذا الحساب بعد.</div></main>;
  }

  const [{ count: servicesCount }, { count: slotsCount }, { count: appointmentsCount }] = await Promise.all([
    supabase.from("services").select("*", { count: "exact", head: true }).eq("nutritionist_id", nutritionist.id).eq("is_active", true),
    supabase.from("availability_slots").select("*", { count: "exact", head: true }).eq("nutritionist_id", nutritionist.id).eq("status", "open").gt("starts_at", new Date().toISOString()),
    supabase.from("appointments").select("*", { count: "exact", head: true }).eq("nutritionist_id", nutritionist.id).in("status", ["pending", "confirmed"])
  ]);

  return (
    <main className="container py-10">
      <h1 className="text-3xl font-extrabold">مرحباً بك في لوحة الأخصائي</h1>
      <p className="mt-2 text-[var(--muted)]">إدارة الخدمات والمواعيد والحجوزات من مكان واحد.</p>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        <Metric title="الخدمات النشطة" value={String(servicesCount ?? 0)} href="/nutritionist/services" />
        <Metric title="المواعيد المفتوحة" value={String(slotsCount ?? 0)} href="/nutritionist/availability" />
        <Metric title="الحجوزات القادمة" value={String(appointmentsCount ?? 0)} href="/nutritionist/appointments" />
      </div>
      <section className="mt-8 rounded-3xl border border-[var(--border)] bg-white p-6">
        <h2 className="text-xl font-bold">حالة الملف</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3 text-sm">
          <div>التحقق: <strong>{nutritionist.verification_status}</strong></div>
          <div>متاح للحجز: <strong>{nutritionist.is_available ? "نعم" : "لا"}</strong></div>
          <div>سنوات الخبرة: <strong>{nutritionist.years_experience ?? 0}</strong></div>
        </div>
      </section>
    </main>
  );
}

function Metric({ title, value, href }: { title: string; value: string; href: string }) {
  return <Link href={href} className="rounded-3xl border border-[var(--border)] bg-white p-6"><p className="text-sm text-[var(--muted)]">{title}</p><p className="mt-2 text-3xl font-extrabold">{value}</p></Link>;
}
