"use client";

import { FormEvent, useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type Slot = { id: string; starts_at: string; ends_at: string; status: string };

export default function AvailabilityPage() {
  const [nutritionistId, setNutritionistId] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("18:00");
  const [duration, setDuration] = useState("60");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    const supabase = createSupabaseBrowserClient();
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;
    const { data: nutritionist } = await supabase.from("nutritionists").select("id").eq("profile_id", user.user.id).single();
    if (!nutritionist) return;
    setNutritionistId(nutritionist.id);
    const { data, error } = await supabase
      .from("availability_slots")
      .select("id,starts_at,ends_at,status")
      .eq("nutritionist_id", nutritionist.id)
      .order("starts_at", { ascending: true })
      .limit(100);
    if (error) setError(error.message); else setSlots(data ?? []);
  }

  useEffect(() => { load(); }, []);

  async function addSlot(event: FormEvent) {
    event.preventDefault();
    setError(""); setMessage("");
    if (!date || !time) { setError("اختر التاريخ والوقت."); return; }

    const durationValue = Number(duration);
    if (!Number.isInteger(durationValue) || durationValue < 15) { setError("مدة الموعد يجب أن تكون 15 دقيقة أو أكثر."); return; }

    const start = new Date(`${date}T${time}:00`);
    if (Number.isNaN(start.getTime()) || start <= new Date()) { setError("يجب أن يكون الموعد في المستقبل."); return; }
    const end = new Date(start.getTime() + durationValue * 60000);

    setSaving(true);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from("availability_slots").insert({
      nutritionist_id: nutritionistId,
      starts_at: start.toISOString(),
      ends_at: end.toISOString(),
      status: "open"
    });

    setSaving(false);
    if (error) setError("تعذر إضافة الموعد. قد يكون هناك تعارض مع موعد موجود.");
    else { setMessage("تمت إضافة الموعد المتاح."); setDate(""); setTime("18:00"); await load(); }
  }

  async function blockSlot(slot: Slot) {
    if (slot.status !== "open") return;
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from("availability_slots").update({ status: "blocked" }).eq("id", slot.id);
    if (error) setError(error.message); else await load();
  }

  return (
    <main className="container py-10">
      <h1 className="text-3xl font-extrabold">المواعيد المتاحة</h1>
      <p className="mt-2 text-[var(--muted)]">أضف الفترات التي يمكن للمرضى الحجز فيها.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[380px_1fr]">
        <form onSubmit={addSlot} className="rounded-3xl border border-[var(--border)] bg-white p-6 space-y-4">
          <h2 className="text-xl font-bold">إضافة فترة</h2>
          <input required type="date" value={date} onChange={(e)=>setDate(e.target.value)} className="w-full rounded-xl border border-[var(--border)] px-4 py-3" />
          <input required type="time" value={time} onChange={(e)=>setTime(e.target.value)} className="w-full rounded-xl border border-[var(--border)] px-4 py-3" />
          <input required type="number" min="15" step="15" value={duration} onChange={(e)=>setDuration(e.target.value)} placeholder="المدة بالدقائق" className="w-full rounded-xl border border-[var(--border)] px-4 py-3" />
          {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          {message && <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>}
          <button disabled={saving} className="w-full rounded-xl bg-[var(--primary)] px-5 py-3 font-bold text-white disabled:opacity-50">{saving ? "جارٍ الحفظ..." : "إضافة الموعد"}</button>
        </form>

        <section className="space-y-3">
          {slots.map((slot) => (
            <article key={slot.id} className="rounded-3xl border border-[var(--border)] bg-white p-5 flex flex-wrap justify-between gap-4">
              <div>
                <p className="font-bold">{new Date(slot.starts_at).toLocaleString("ar-SA")}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">حتى {new Date(slot.ends_at).toLocaleTimeString("ar-SA", {hour:"2-digit",minute:"2-digit"})} · {slot.status === "open" ? "متاح للحجز" : slot.status === "booked" ? "محجوز" : "محظور"}</p>
              </div>
              {slot.status === "open" && <button onClick={()=>blockSlot(slot)} className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm">حظر</button>}
            </article>
          ))}
          {!slots.length && <div className="rounded-3xl bg-white p-6 text-[var(--muted)]">لا توجد فترات مضافة.</div>}
        </section>
      </div>
    </main>
  );
}
