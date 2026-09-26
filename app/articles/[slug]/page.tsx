import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const revalidate = 300;

export default async function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: article } = await supabase
    .from("articles")
    .select("title_ar,excerpt_ar,content_ar,cover_image_url,published_at")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (!article) notFound();

  return (
    <main className="container max-w-4xl py-14">
      <article className="rounded-3xl border border-[var(--border)] bg-white p-7 md:p-10">
        {article.cover_image_url && <img src={article.cover_image_url} alt="" className="mb-8 max-h-[420px] w-full rounded-2xl object-cover" />}
        <h1 className="text-4xl font-extrabold leading-tight">{article.title_ar}</h1>
        {article.published_at && <p className="mt-3 text-sm text-[var(--muted)]">{new Date(article.published_at).toLocaleDateString("ar-SA")}</p>}
        {article.excerpt_ar && <p className="mt-7 text-lg leading-8 text-[var(--muted)]">{article.excerpt_ar}</p>}
        <div className="prose prose-slate mt-8 max-w-none whitespace-pre-wrap leading-9">{article.content_ar}</div>
      </article>
    </main>
  );
}
