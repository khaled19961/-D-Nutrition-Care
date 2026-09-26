import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient();
  const [{ count: users }, { count: nutritionists }, { count: pendingNutritionists }, { count: appointments }, { count: reviews }] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("nutritionists").select("*", { count: "exact", head: true }),
    supabase.from("nutritionists").select("*", { count: "exact", head: true }).eq("verification_status", "pending"),
    supabase.from("appointments").select("*", { count: "exact", head: true }),
    supabase.from("reviews").select("*", { count: "exact", head: true }).eq("status", "pending")
  ]);

  return (
    <main className="container py-10">
      <h1 className="text-3xl font-extrabold">لوحة الإدارة</h1>
      <p className="mt-2 text-[var(--muted)]">مراقبة المستخدمين والأخصائيين والمحتوى والحجوزات.</p>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Metric title="المستخدمون" value={users} />
        <Metric title="الأخصائيون" value={nutritionists} href="/admin/nutritionists" />
        <Metric title="طلبات التحقق" value={pendingNutritionists} href="/admin/nutritionists" />
        <Metric title="الحجوزات" value={appointments} />
        <Metric title="تقييمات بانتظار المراجعة" value={reviews} href="/admin/reviews" />
      </div>
    </main>
  );
}

function Metric({ title, value, href }: { title: string; value: number | null; href?: string }) {
  const body = <><p className="text-sm text-[var(--muted)]">{title}</p><p className="mt-2 text-3xl font-extrabold">{value ?? 0}</p></>;
  return href ? <Link href={href} className="rounded-3xl border border-[var(--border)] bg-white p-6">{body}</Link> : <div className="rounded-3xl border border-[var(--border)] bg-white p-6">{body}</div>;
}
