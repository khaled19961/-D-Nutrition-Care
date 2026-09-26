"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type Appointment = {
  id: string;
  starts_at: string;
  ends_at: string;
  status: string;
  booking_notes: string | null;
  cancellation_reason: string | null;
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  async function load() {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("appointments")
      .select("id,starts_at,ends_at,status,booking_notes,cancellation_reason")
      .order("starts_at", { ascending: false });

    if (error) setError(error.message);
    else setAppointments(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function cancel(id: string) {
    setBusyId(id);
    setError("");

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.rpc("cancel_appointment", {
      p_appointment_id: id,
      p_reason: "تم الإلغاء من قبل المريض"
    });

    if (error) setError(error.message);
    else await load();
    setBusyId("");
  }
  return (
    <main className="container py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">مواعيدي</h1>
          <p className="mt-2 text-[var(--muted)]">تابع مواعيدك الحالية والسابقة.</p>
        </div>
        <Link href="/booking" className="rounded-xl bg-[var(--primary)] px-5 py-3 font-bold text-white">حجز موعد</Link>
      </div>

      {error && <p className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}

      <section className="mt-8 space-y-4">
        {loading ? <p>جارٍ التحميل...</p> : appointments.length === 0 ? (
          <div className="rounded-3xl border border-[var(--border)] bg-white p-8 text-center text-[var(--muted)]">
            لا توجد مواعيد حتى الآن.
          </div>
        ) : appointments.map((item) => {
          const canCancel = ["pending", "confirmed"].includes(item.status) && new Date(item.starts_at) > new Date();
          return (
            <article key={item.id} className="rounded-3xl border border-[var(--border)] bg-white p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="font-bold">{new Date(item.starts_at).toLocaleString("ar-SA", {
                    weekday: "long", year: "numeric", month: "long", day: "numeric",
                    hour: "2-digit", minute: "2-digit"
                  })}</h2>
                  <p className="mt-2 text-sm text-[var(--muted)]">الحالة: {item.status}</p>
                  {item.booking_notes && <p className="mt-2 text-sm">ملاحظات: {item.booking_notes}</p>}
                  {item.cancellation_reason && <p className="mt-2 text-sm text-red-700">سبب الإلغاء: {item.cancellation_reason}</p>}
                </div>
                {canCancel && (
                  <button disabled={busyId === item.id} onClick={() => cancel(item.id)}
                    className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 disabled:opacity-50">
                    {busyId === item.id ? "جارٍ الإلغاء..." : "إلغاء الموعد"}
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
