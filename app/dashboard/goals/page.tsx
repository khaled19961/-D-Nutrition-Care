"use client";

import { FormEvent, useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type Goal = { id: string; title: string; description: string | null; target_value: number | null; unit: string | null; target_date: string | null; status: string };

export default function GoalsPage() {
  const [items, setItems] = useState<Goal[]>([]);
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("");
  const [unit, setUnit] = useState("كجم");
  const [date, setDate] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.from("goals").select("id,title,description,target_value,unit,target_date,status").order("created_at", { ascending: false });
    if (error) setError(error.message); else setItems(data ?? []);
  }
  useEffect(() => { load(); }, []);

  async function add(event: FormEvent) {
    event.preventDefault(); setError("");
    const supabase = createSupabaseBrowserClient();
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;
    const { error } = await supabase.from("goals").insert({
      patient_id: user.user.id,
      title: title.trim(),
      target_value: target ? Number(target) : null,
      unit: unit.trim() || null,
      target_date: date || null,
      status: "active"
    });
    if (error) setError(error.message);
    else { setTitle(""); setTarget(""); setDate(""); await load(); }
  }

  async function complete(id: string) {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from("goals").update({ status: "completed" }).eq("id", id);
    if (error) setError(error.message); else await load();
  }

  return (
    <main className="container py-10">
      <h1 className="text-3xl font-extrabold">أهدافي</h1>
      <div className="mt-8 grid gap-6 lg:grid-cols-[360px_1fr]">
        <form onSubmit={add} className="rounded-3xl border border-[var(--border)] bg-white p-6 space-y-4">
          <h2 className="text-xl font-bold">هدف جديد</h2>
          <input required value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="مثال: الوصول إلى وزن مستهدف" className="w-full rounded-xl border border-[var(--border)] px-4 py-3" />
          <input type="number" step="0.1" value={target} onChange={(e)=>setTarget(e.target.value)} placeholder="القيمة المستهدفة" className="w-full rounded-xl border border-[var(--border)] px-4 py-3" />
          <input value={unit} onChange={(e)=>setUnit(e.target.value)} placeholder="الوحدة" className="w-full rounded-xl border border-[var(--border)] px-4 py-3" />
          <input type="date" value={date} onChange={(e)=>setDate(e.target.value)} className="w-full rounded-xl border border-[var(--border)] px-4 py-3" />
          {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <button className="w-full rounded-xl bg-[var(--primary)] px-5 py-3 font-bold text-white">إضافة الهدف</button>
        </form>
        <section className="space-y-3">
          {items.map((item)=><article key={item.id} className="rounded-3xl border border-[var(--border)] bg-white p-5 flex flex-wrap justify-between gap-4">
            <div><h2 className="font-bold">{item.title}</h2><p className="mt-1 text-sm text-[var(--muted)]">المستهدف: {item.target_value ?? "—"} {item.unit || ""} · {item.target_date || "بدون تاريخ"}</p></div>
            {item.status === "active" && <button onClick={()=>complete(item.id)} className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm">تم الإنجاز</button>}
          </article>)}
          {!items.length && <div className="rounded-3xl bg-white p-8 text-center text-[var(--muted)]">لا توجد أهداف بعد.</div>}
        </section>
      </div>
    </main>
  );
}
