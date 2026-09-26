"use client";

import { FormEvent, useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type RecordItem = {
  id: string;
  recorded_at: string;
  weight_kg: number | null;
  height_cm: number | null;
  bmi: number | null;
  body_fat_percentage: number | null;
  waist_cm: number | null;
  notes: string | null;
};

export default function ProgressPage() {
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [waist, setWaist] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("progress_records")
      .select("id,recorded_at,weight_kg,height_cm,bmi,body_fat_percentage,waist_cm,notes")
      .order("recorded_at", { ascending: false });

    if (error) setError(error.message);
    else setRecords(data ?? []);
  }

  useEffect(() => { load(); }, []);

  async function addRecord(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");

    const supabase = createSupabaseBrowserClient();
    const w = Number(weight);
    const h = Number(height);
    const waistValue = waist ? Number(waist) : null;
    const bmi = w > 0 && h > 0 ? Number((w / Math.pow(h / 100, 2)).toFixed(2)) : null;

    const { error } = await supabase.from("progress_records").insert({
      weight_kg: w || null,
      height_cm: h || null,
      bmi,
      waist_cm: waistValue,
      notes: notes.trim() || null
    });

    if (error) setError(error.message);
    else {
      setMessage("تم تسجيل القياس.");
      setWeight(""); setHeight(""); setWaist(""); setNotes("");
      await load();
    }
  }

  return (
    <main className="container py-10">
      <h1 className="text-3xl font-extrabold">متابعة التقدم</h1>
      <p className="mt-2 text-[var(--muted)]">سجّل القياسات الأساسية وراجع تاريخ تقدمك.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[380px_1fr]">
        <form onSubmit={addRecord} className="rounded-3xl border border-[var(--border)] bg-white p-6">
          <h2 className="text-xl font-bold">إضافة قياس</h2>
          <div className="mt-5 space-y-4">
            <input required type="number" step="0.1" placeholder="الوزن كجم" value={weight} onChange={(e) => setWeight(e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] px-4 py-3" />
            <input type="number" step="0.1" placeholder="الطول سم" value={height} onChange={(e) => setHeight(e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] px-4 py-3" />
            <input type="number" step="0.1" placeholder="محيط الخصر سم" value={waist} onChange={(e) => setWaist(e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] px-4 py-3" />
            <textarea rows={3} placeholder="ملاحظات" value={notes} onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] px-4 py-3" />
            {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            {message && <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>}
            <button className="w-full rounded-xl bg-[var(--primary)] px-5 py-3 font-bold text-white">حفظ القياس</button>
          </div>
        </form>

        <section className="space-y-3">
          {records.length === 0 ? (
            <div className="rounded-3xl border border-[var(--border)] bg-white p-8 text-center text-[var(--muted)]">لا توجد قياسات مسجلة.</div>
          ) : records.map((item) => (
            <article key={item.id} className="rounded-3xl border border-[var(--border)] bg-white p-5">
              <div className="flex flex-wrap justify-between gap-4">
                <strong>{new Date(item.recorded_at).toLocaleDateString("ar-SA")}</strong>
                <span className="text-[var(--primary)]">{item.weight_kg ?? "—"} كجم</span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3 text-sm">
                <div>الطول: {item.height_cm ?? "—"} سم</div>
                <div>BMI: {item.bmi ?? "—"}</div>
                <div>الخصر: {item.waist_cm ?? "—"} سم</div>
              </div>
              {item.notes && <p className="mt-3 text-sm text-[var(--muted)]">{item.notes}</p>}
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
