"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type Item = { id: string; profile_id: string; bio: string | null; years_experience: number | null; verification_status: string; is_available: boolean };

export default function AdminNutritionistsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [error, setError] = useState("");

  async function load() {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.from("nutritionists").select("id,profile_id,bio,years_experience,verification_status,is_available").order("created_at", { ascending: false });
    if (error) { setError(error.message); return; }
    setItems(data ?? []);
    const ids = (data ?? []).map((x) => x.profile_id);
    if (ids.length) {
      const { data: profiles } = await supabase.from("profiles").select("id,full_name").in("id", ids);
      setNames(Object.fromEntries((profiles ?? []).map((p) => [p.id, p.full_name || "بدون اسم"])));
    }
  }

  useEffect(() => { load(); }, []);

  async function verify(item: Item, status: "verified" | "rejected") {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from("nutritionists").update({ verification_status: status, is_available: status === "verified" }).eq("id", item.id);
    if (error) setError(error.message); else await load();
  }

  return (
    <main className="container py-10">
      <h1 className="text-3xl font-extrabold">إدارة الأخصائيين</h1>
      {error && <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      <div className="mt-8 space-y-3">
        {items.map((item) => (
          <article key={item.id} className="rounded-3xl border border-[var(--border)] bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div><h2 className="font-bold">{names[item.profile_id] || "أخصائي"}</h2><p className="mt-1 text-sm text-[var(--muted)]">{item.years_experience || 0} سنوات · {item.verification_status}</p></div>
              <div className="flex gap-2">
                {item.verification_status !== "verified" && <button onClick={()=>verify(item,"verified")} className="rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-bold text-white">اعتماد</button>}
                {item.verification_status !== "rejected" && <button onClick={()=>verify(item,"rejected")} className="rounded-xl border border-red-200 px-4 py-2 text-sm text-red-700">رفض</button>}
              </div>
            </div>
          </article>
        ))}
        {!items.length && <div className="rounded-3xl bg-white p-8 text-center text-[var(--muted)]">لا توجد طلبات.</div>}
      </div>
    </main>
  );
}
