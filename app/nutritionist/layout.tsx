import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function NutritionistLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims?.sub) redirect("/auth/login?next=/nutritionist");

  const { data: profile } = await supabase.from("profiles").select("role,full_name").eq("id", claims.claims.sub).maybeSingle();
  if (!profile || !["nutritionist", "admin", "super_admin"].includes(profile.role)) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-[var(--border)] bg-white">
        <div className="container flex min-h-16 flex-wrap items-center justify-between gap-4">
          <Link href="/nutritionist" className="font-extrabold text-[var(--primary)]">لوحة الأخصائي</Link>
          <nav className="flex flex-wrap gap-4 text-sm font-semibold">
            <Link href="/nutritionist">الرئيسية</Link>
            <Link href="/nutritionist/services">الخدمات</Link>
            <Link href="/nutritionist/availability">المواعيد المتاحة</Link>
            <Link href="/nutritionist/appointments">الحجوزات</Link>
          </nav>
          <Link href="/" className="text-sm font-semibold">الموقع العام</Link>
        </div>
      </header>
      {children}
    </div>
  );
}
