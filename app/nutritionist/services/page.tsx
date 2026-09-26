"use client";

import { FormEvent, useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type Service = { id: string; name_ar: string; description_ar: string | null; duration_minutes: number; price: number; currency: string; is_active: boolean };

export default function ServicesPage() {
  const [nutritionistId, setNutritionistId] = useState("");
  const [services, setServices] = useState<Service[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("60");
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    const supabase = createSupabaseBrowserClient();
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;
    const { data: nutritionist } = await supabase.from("nutritionists").select("id").eq("profile_id", user.user.id).single();
    if (!nutritionist) return;
    setNutritionistId(nutritionist.id);
    const { data, error } = await supabase.from("services").select("id,name_ar,description_ar,duration_minutes,price,currency,is_active").eq("nutritionist_id", nutritionist.id).order("created_at", { ascending: false });
    if (error) setError(error.message); else setServices(data ?? []);
  }

  useEffect(() => { load(); }, []);

  async function addService(event: FormEvent) {
    event.preventDefault();
    setError(""); setMessage("");
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from("services").insert({
      nutritionist_id: nutritionistId,
      name_ar: name.trim(),
      description_ar: description.trim() || null,
      duration_minutes: Number(duration),
      price: Number(price),
      currency: "SAR",
      is_active: true
    });
    if (error) setError(error.message);
    else { setMessage("تمت إضافة الخدمة."); setName(""); setDescription(""); setPrice(""); await load(); }
  }

  async function toggle(service: Service) {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from("services").update({ is_active: !service.is_active }).eq("id", service.id);
    if (error) setError(error.message); else await load();
  }

  return (
    <main className="container py-10">
      <h1 className="text-3xl font-extrabold">الخدمات</h1>
      <div className="mt-8 grid gap-6 lg:grid-cols-[380px_1fr]">
        <form onSubmit={addService} className="rounded-3xl border border-[var(--border)] bg-white p-6 space-y-4">
          <h2 className="text-xl font-bold">إضافة خدمة</h2>
          <input required value={name} onChange={(e)=>setName(e.target.value)} placeholder="اسم الخدمة" className="w-full rounded-xl border border-[var(--border)] px-4 py-3" />
          <textarea value={description} onChange={(e)=>setDescription(e.target.value)} placeholder="وصف الخدمة" rows={4} className="w-full rounded-xl border border-[var(--border)] px-4 py-3" />
          <input required type="number" min="15" value={duration} onChange={(e)=>setDuration(e.target.value)} placeholder="المدة بالدقائق" className="w-full rounded-xl border border-[var(--border)] px-4 py-3" />
          <input required type="number" min="0" step="0.01" value={price} onChange={(e)=>setPrice(e.target.value)} placeholder="السعر بالريال" className="w-full rounded-xl border border-[var(--border)] px-4 py-3" />
          {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          {message && <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>}
          <button className="w-full rounded-xl bg-[var(--primary)] px-5 py-3 font-bold text-white">إضافة الخدمة</button>
        </form>
        <section className="space-y-3">
          {services.map((service) => (
            <article key={service.id} className="rounded-3xl border border-[var(--border)] bg-white p-5 flex flex-wrap justify-between gap-4">
              <div><h3 className="font-bold">{service.name_ar}</h3><p className="mt-1 text-sm text-[var(--muted)]">{service.duration_minutes} دقيقة · {service.price} {service.currency}</p></div>
              <button onClick={()=>toggle(service)} className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm">{service.is_active ? "تعطيل" : "تفعيل"}</button>
            </article>
          ))}
          {!services.length && <div className="rounded-3xl bg-white p-6 text-[var(--muted)]">لا توجد خدمات بعد.</div>}
        </section>
      </div>
    </main>
  );
}
