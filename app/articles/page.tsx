import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const revalidate = 300;

export default async function ArticlesPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("articles")
    .select("id,title_ar,slug,excerpt_ar,cover_image_url,published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  return (
    <main className="container py-14">
      <h1 className="text-4xl font-extrabold">المقالات</h1>
      <p className="mt-4 max-w-2xl leading-8 text-[var(--muted)]">محتوى غذائي منظم يساعدك على فهم التغذية وبناء عادات أفضل.</p>
      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {data?.length ? data.map((article) => (
          <article key={article.id} className="overflow-hidden rounded-3xl border border-[var(--border)] bg-white">
            <div className="h-40 bg-emerald-50">
              {article.cover_image_url ? <img src={article.cover_image_url} alt="" className="h-full w-full object-cover" /> : null}
            </div>
            <div className="p-6">
              <h2 className="text-xl font-bold">{article.title_ar}</h2>
              <p className="mt-3 line-clamp-3 leading-7 text-[var(--muted)]">{article.excerpt_ar || "اقرأ المقال لمعرفة المزيد."}</p>
              <Link href={`/articles/${article.slug}`} className="mt-5 inline-flex font-semibold text-[var(--primary)]">قراءة المقال</Link>
            </div>
          </article>
        )) : <p className="text-[var(--muted)]">لا توجد مقالات منشورة حالياً.</p>}
      </div>
    </main>
  );
}
