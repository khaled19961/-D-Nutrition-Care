import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardProgramsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: programs } = await supabase
    .from("patient_programs")
    .select("id,start_date,end_date,status,notes,nutrition_programs(title_ar,description_ar,duration_days)")
    .order("start_date", { ascending: false });

  return (
    <main className="container py-10">
      <h1 className="text-3xl font-extrabold">برامجي الغذائية</h1>
      <p className="mt-2 text-[var(--muted)]">البرامج المرتبطة بحسابك وحالتها الحالية.</p>
      <div className="mt-8 space-y-4">
        {programs?.length ? programs.map((item: any) => {
          const program = Array.isArray(item.nutrition_programs) ? item.nutrition_programs[0] : item.nutrition_programs;
          return <article key={item.id} className="rounded-3xl border border-[var(--border)] bg-white p-6">
            <div className="flex flex-wrap justify-between gap-4">
              <div><h2 className="text-xl font-bold">{program?.title_ar || "برنامج غذائي"}</h2><p className="mt-2 leading-7 text-[var(--muted)]">{program?.description_ar || ""}</p></div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm text-[var(--primary)]">{item.status}</span>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3 text-sm">
              <div>البداية: {item.start_date || "—"}</div><div>النهاية: {item.end_date || "—"}</div><div>المدة: {program?.duration_days || "—"} يوم</div>
            </div>
          </article>;
        }) : <div className="rounded-3xl border border-[var(--border)] bg-white p-8 text-center text-[var(--muted)]">لا توجد برامج مرتبطة بحسابك.</div>}
      </div>
    </main>
  );
}
