import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const revalidate = 60;

export default async function NutritionistDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: publicRows } = await supabase.rpc("get_public_nutritionist", { p_id: id });
  const nutritionist = publicRows?.[0];
  if (!nutritionist) notFound();

  const { data: services } = await supabase
    .from("services")
    .select("id,name_ar,description_ar,duration_minutes,price,currency")
    .eq("nutritionist_id", id)
    .eq("is_active", true)
    .order("price", { ascending: true });

  return (
    <main className="container py-14">
      <Link href="/nutritionists" className="text-sm font-semibold text-[var(--primary)]">← جميع الأخصائيين</Link>
      <section className="mt-6 rounded-3xl border border-[var(--border)] bg-white p-7 md:p-10">
        <div className="flex flex-wrap items-center gap-5">
          <div className="grid h-24 w-24 place-items-center rounded-3xl bg-emerald-50 text-3xl font-bold text-[var(--primary)]">
            {(nutritionist.full_name || "أ").slice(0, 1)}
          </div>
          <div>
            <h1 className="text-3xl font-extrabold">{nutritionist.full_name || "أخصائي تغذية"}</h1>
            <p className="mt-2 text-[var(--muted)]">{nutritionist.years_experience || 0} سنوات خبرة</p>
          </div>
        </div>
        <p className="mt-7 max-w-3xl leading-8 text-[var(--muted)]">{nutritionist.bio || "متابعة غذائية واستشارات مخصصة حسب الهدف والحالة."}</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Stat label="سنوات الخبرة" value={String(nutritionist.years_experience || 0)} />
          <Stat label="سعر الاستشارة" value={nutritionist.consultation_fee ? `${nutritionist.consultation_fee} ${nutritionist.currency || "SAR"}` : "حسب الخدمة"} />
          <Stat label="الحالة" value="متاح للحجز" />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-2xl font-extrabold">الخدمات المتاحة</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          {services?.length ? services.map((service) => (
            <article key={service.id} className="rounded-3xl border border-[var(--border)] bg-white p-6">
              <h3 className="text-xl font-bold">{service.name_ar}</h3>
              <p className="mt-3 leading-7 text-[var(--muted)]">{service.description_ar || "جلسة غذائية مخصصة."}</p>
              <div className="mt-5 flex items-center justify-between gap-4">
                <span className="text-sm text-[var(--muted)]">{service.duration_minutes} دقيقة</span>
                <span className="font-bold text-[var(--primary)]">{service.price} {service.currency}</span>
              </div>
            </article>
          )) : <p className="text-[var(--muted)]">لا توجد خدمات منشورة حالياً.</p>}
        </div>
        {services?.length ? <Link href="/booking" className="mt-7 inline-flex rounded-xl bg-[var(--primary)] px-6 py-3 font-bold text-white">اختيار الموعد والحجز</Link> : null}
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl bg-[var(--background)] p-4"><p className="text-sm text-[var(--muted)]">{label}</p><p className="mt-1 font-bold">{value}</p></div>;
}
