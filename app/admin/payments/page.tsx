import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: payments } = await supabase
    .from("payments")
    .select("id,patient_id,appointment_id,amount,currency,provider,status,paid_at,created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <main className="container py-10">
      <h1 className="text-3xl font-extrabold">المدفوعات</h1>
      <div className="mt-8 overflow-x-auto rounded-3xl border border-[var(--border)] bg-white">
        <table className="min-w-full text-sm">
          <thead><tr className="border-b border-[var(--border)] text-right"><th className="p-4">المبلغ</th><th className="p-4">المزود</th><th className="p-4">الحالة</th><th className="p-4">التاريخ</th></tr></thead>
          <tbody>
            {payments?.map((item) => <tr key={item.id} className="border-b border-[var(--border)] last:border-0"><td className="p-4 font-semibold">{item.amount} {item.currency}</td><td className="p-4">{item.provider}</td><td className="p-4">{item.status}</td><td className="p-4">{new Date(item.created_at).toLocaleString("ar-SA")}</td></tr>)}
          </tbody>
        </table>
        {!payments?.length && <p className="p-8 text-center text-[var(--muted)]">لا توجد مدفوعات.</p>}
      </div>
    </main>
  );
}
