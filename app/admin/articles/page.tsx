"use client";

import { FormEvent, useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type Article = { id: string; title_ar: string; slug: string; status: string; published_at: string | null };

export default function AdminArticlesPage() {
  const [items, setItems] = useState<Article[]>([]);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.from("articles").select("id,title_ar,slug,status,published_at").order("created_at", { ascending: false });
    if (error) setError(error.message); else setItems(data ?? []);
  }

  useEffect(() => { load(); }, []);

  async function createArticle(event: FormEvent) {
    event.preventDefault();
    setError(""); setMessage("");
    const supabase = createSupabaseBrowserClient();
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) { setError("يجب تسجيل الدخول."); return; }

    const { error } = await supabase.from("articles").insert({
      author_profile_id: user.user.id,
      title_ar: title.trim(),
      title_en: title.trim(),
      slug: slug.trim().toLowerCase(),
      excerpt_ar: excerpt.trim() || null,
      excerpt_en: excerpt.trim() || null,
      content_ar: content.trim(),
      content_en: content.trim(),
      status: "draft"
    });

    if (error) setError(error.message);
    else { setMessage("تم إنشاء المسودة."); setTitle(""); setSlug(""); setExcerpt(""); setContent(""); await load(); }
  }

  async function publish(article: Article, status: "published" | "archived" | "draft") {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from("articles").update({
      status,
      published_at: status === "published" ? new Date().toISOString() : article.published_at
    }).eq("id", article.id);
    if (error) setError(error.message); else await load();
  }

  return (
    <main className="container py-10">
      <h1 className="text-3xl font-extrabold">إدارة المقالات</h1>
      <div className="mt-8 grid gap-6 lg:grid-cols-[400px_1fr]">
        <form onSubmit={createArticle} className="rounded-3xl border border-[var(--border)] bg-white p-6 space-y-4">
          <h2 className="text-xl font-bold">مقال جديد</h2>
          <input required value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="العنوان" className="w-full rounded-xl border border-[var(--border)] px-4 py-3" />
          <input required value={slug} onChange={(e)=>setSlug(e.target.value.replace(/\s+/g,"-"))} placeholder="slug-بسيط" className="w-full rounded-xl border border-[var(--border)] px-4 py-3" />
          <textarea value={excerpt} onChange={(e)=>setExcerpt(e.target.value)} placeholder="المقتطف" rows={3} className="w-full rounded-xl border border-[var(--border)] px-4 py-3" />
          <textarea required value={content} onChange={(e)=>setContent(e.target.value)} placeholder="محتوى المقال" rows={10} className="w-full rounded-xl border border-[var(--border)] px-4 py-3" />
          {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          {message && <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>}
          <button className="w-full rounded-xl bg-[var(--primary)] px-5 py-3 font-bold text-white">حفظ كمسودة</button>
        </form>

        <section className="space-y-3">
          {items.map((article) => (
            <article key={article.id} className="rounded-3xl border border-[var(--border)] bg-white p-5">
              <div className="flex flex-wrap justify-between gap-4">
                <div><h2 className="font-bold">{article.title_ar}</h2><p className="mt-1 text-sm text-[var(--muted)]">{article.status}</p></div>
                <div className="flex gap-2">
                  {article.status !== "published" && <button onClick={()=>publish(article,"published")} className="rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-bold text-white">نشر</button>}
                  {article.status === "published" && <button onClick={()=>publish(article,"archived")} className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm">أرشفة</button>}
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
