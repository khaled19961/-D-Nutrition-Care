import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function NutritionistAppointmentsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims!.claims.sub as string;
  const { data: nutritionist } = await supabase.from("nutritionists").select("id").eq("profile_id", userId).single();

  const { data: appointments } = nutritionist ? await supabase
    .from("appointments")
    .select("id,starts_at,ends_at,status,booking_notes,profiles!appointments_patient_id_fkey(full_name,phone)")
    .eq("nutritionist_id", nutritionist.id)
    .order("starts_at", { ascending: false })
    .limit(50) : { data: [] };

  return (
    <main className="container py-10">
      <h1 className="text-3xl font-extrabold">حجوزات المرضى</h1>
      <div className="mt-8 space-y-3">
        {appointments?.length ? appointments.map((item: any) => {
          const patient = Array.isArray(item.profiles) ? item.profiles[0] : item.profiles;
          return <article key={item.id} className="rounded-3xl border border-[var(--border)] bg-white p-5">
            <div className="flex flex-wrap justify-between gap-4">
              <div><h2 className="font-bold">{patient?.full_name || "مريض"}</h2><p className="mt-1 text-sm text-[var(--muted)]">{patient?.phone || ""}</p></div>
              <div className="text-left"><p className="font-semibold">{new Date(item.starts_at).toLocaleString("ar-SA")}</p><p className="mt-1 text-sm text-[var(--muted)]">{item.status}</p></div>
            </div>
            {item.booking_notes && <p className="mt-4 rounded-xl bg-[var(--background)] p-3 text-sm">{item.booking_notes}</p>}
          </article>;
        }) : <div className="rounded-3xl bg-white p-8 text-center text-[var(--muted)]">لا توجد حجوزات.</div>}
      </div>
    </main>
  );
}
