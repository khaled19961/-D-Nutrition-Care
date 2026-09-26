"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type Review = { id: string; rating: number; comment: string | null; status: string; created_at: string; patient_id: string; nutritionist_id: string };

export default function AdminReviewsPage() {
  const [items, setItems] = useState<Review[]>([]);
  const [error, setError] = useState("");

  async function load() {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.from("reviews").select("id,rating,comment,status,created_at,patient_id,nutritionist_id").order("created_at", { ascending: false });
    if (error) setError(error.message); else setItems(data ?? []);
  }

  useEffect(() => { load(); }, []);

  async function moderate(id: string, status: "approved" | "rejected") {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from("reviews").update({ status }).eq("id", id);
    if (error) setError(error.message); else await load();
  }

  return (
    <main className="container py-10">
      <h1 className="text-3xl font-extrabold">مراجعة التقييمات</h1>
      {error && <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      <div className="mt-8 space-y-3">
        {items.map((item) => (
          <article key={item.id} className="rounded-3xl border border-[var(--border)] bg-white p-5">
            <div className="flex flex-wrap justify-between gap-4"><strong>{item.rating}/5</strong><span className="text-sm text-[var(--muted)]">{item.status}</span></div>
            {item.comment && <p className="mt-3 leading-7">{item.comment}</p>}
            {item.status === "pending" && <div className="mt-4 flex gap-2"><button onClick={()=>moderate(item.id,"approved")} className="rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-bold text-white">اعتماد</button><button onClick={()=>moderate(item.id,"rejected")} className="rounded-xl border border-red-200 px-4 py-2 text-sm text-red-700">رفض</button></div>}
          </article>
        ))}
        {!items.length && <div className="rounded-3xl bg-white p-8 text-center text-[var(--muted)]">لا توجد تقييمات.</div>}
      </div>
    </main>
  );
}
