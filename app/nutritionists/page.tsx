import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SiteChrome } from "@/components/site-chrome";

export const revalidate = 60;

export default async function NutritionistsPage({ searchParams }: { searchParams?: Promise<{ q?: string }> }) {
  const supabase = await createSupabaseServerClient();
  const q = (await searchParams)?.q?.trim().toLocaleLowerCase("ar") || "";
  const { data: rawData, error } = await supabase.rpc("list_public_nutritionists");
  const data = rawData as Array<{
    id: string;
    full_name: string | null;
    years_experience: number | null;
    bio: string | null;
    consultation_fee: number | null;
    currency: string | null;
  }> | null;

  return (
    <main className="container py-14">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-extrabold">أخصائيو التغذية</h1>
        <p className="mt-4 leading-8 text-[var(--muted)]">تعرّف على الأخصائيين المتاحين واختر الخدمة والموعد المناسبين لك.</p>
      </div>

      <form action="/nutritionists" method="get" className="site-search" style={{ marginTop: "24px", marginBottom: "24px" }}><input name="q" defaultValue={q} placeholder="ابحث باسم الأخصائي" aria-label="بحث" /><button type="submit">بحث</button></form>\n      {error ? (
        <div className="mt-8 rounded-2xl bg-red-50 p-5 text-red-700">تعذر تحميل الأخصائيين حالياً.</div>
      ) : data?.length ? (
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {data.map((item) => (
            <article key={item.id} className="rounded-3xl border border-[var(--border)] bg-white p-6">
              <div className="flex items-center gap-4">
                <div className="grid h-16 w-16 place-items-center rounded-2xl bg-emerald-50 text-xl font-bold text-[var(--primary)]">
                  {(item.full_name || "أ").slice(0, 1)}
                </div>
                <div>
                  <h2 className="font-bold">{item.full_name || "أخصائي تغذية"}</h2>
                  <p className="text-sm text-[var(--muted)]">{item.years_experience || 0} سنوات خبرة</p>
                </div>
              </div>
              <p className="mt-5 min-h-14 text-sm leading-7 text-[var(--muted)]">{item.bio || "أخصائي تغذية معتمد لتقديم الاستشارات والمتابعة."}</p>
              <div className="mt-5 flex items-center justify-between gap-3">
                <span className="font-bold text-[var(--primary)]">{item.consultation_fee ?? "—"} {item.currency || "SAR"}</span>
                <Link href={`/nutritionists/${item.id}`} className="rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-bold text-white">عرض الملف</Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-3xl border border-[var(--border)] bg-white p-8 text-center text-[var(--muted)]">لا يوجد أخصائيون متاحون حالياً.</div>
      )}
    </main>
  );
}
