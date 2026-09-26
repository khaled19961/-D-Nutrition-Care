import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const revalidate = 60;

export default async function ProgramsPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("nutrition_programs")
    .select("id,title_ar,description_ar,duration_days")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  return (
    <main className="container py-14">
      <h1 className="text-4xl font-extrabold">البرامج الغذائية</h1>
      <p className="mt-4 max-w-2xl leading-8 text-[var(--muted)]">برامج منشورة من الأخصائيين يمكن استعراضها قبل بدء رحلة المتابعة.</p>
      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {data?.length ? data.map((program) => (
          <article key={program.id} className="rounded-3xl border border-[var(--border)] bg-white p-6">
            <h2 className="text-xl font-bold">{program.title_ar}</h2>
            <p className="mt-3 leading-7 text-[var(--muted)]">{program.description_ar || "برنامج غذائي مصمم للمتابعة المنظمة."}</p>
            <div className="mt-5 flex items-center justify-between text-sm">
              <span>{program.duration_days} يوم</span>
              <Link href="/auth/register" className="font-semibold text-[var(--primary)]">ابدأ الآن</Link>
            </div>
          </article>
        )) : <p className="text-[var(--muted)]">لا توجد برامج منشورة حالياً.</p>}
      </div>
    </main>
  );
}
