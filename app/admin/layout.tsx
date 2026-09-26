import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims?.sub) redirect("/auth/login?next=/admin");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", claims.claims.sub).maybeSingle();
  if (!profile || !["admin", "super_admin"].includes(profile.role)) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-[var(--border)] bg-white">
        <div className="container flex min-h-16 flex-wrap items-center justify-between gap-4">
          <Link href="/admin" className="font-extrabold text-[var(--primary)]">إدارة D-Nutrition-Care</Link>
          <nav className="flex flex-wrap gap-4 text-sm font-semibold">
            <Link href="/admin">الرئيسية</Link>
            <Link href="/admin/nutritionists">الأخصائيون</Link>
            <Link href="/admin/articles">المقالات</Link>
            <Link href="/admin/reviews">التقييمات</Link>
            <Link href="/admin/payments">المدفوعات</Link>\n            <Link href="/admin/store">المتجر</Link>
          </nav>
          <Link href="/" className="text-sm font-semibold">الموقع العام</Link>
        </div>
      </header>
      {children}
    </div>
  );
}
