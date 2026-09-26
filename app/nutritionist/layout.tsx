import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SiteChrome } from "@/components/site-chrome";

export const dynamic = "force-dynamic";

const navigation = [
  ["/nutritionist", "نظرة عامة"],
  ["/nutritionist/services", "الخدمات"],
  ["/nutritionist/availability", "المواعيد المتاحة"],
  ["/nutritionist/appointments", "الحجوزات"],
] as const;

export default async function NutritionistLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims?.sub) redirect("/auth/login?next=/nutritionist");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role,full_name")
    .eq("id", claims.claims.sub)
    .maybeSingle();

  if (!profile || !["nutritionist", "admin", "super_admin"].includes(profile.role)) {
    redirect("/dashboard");
  }

  return (
    <SiteChrome>
      <div className="dashboard-shell">
        <aside className="dashboard-sidebar">
          <div className="dashboard-profile">
            <span className="dashboard-avatar">{(profile.full_name || "أ").trim().charAt(0)}</span>
            <div>
              <strong>{profile.full_name || "الأخصائي"}</strong>
              <small>لوحة الأخصائي</small>
            </div>
          </div>

          <nav className="dashboard-nav" aria-label="إدارة الأخصائي">
            {navigation.map(([href, label]) => (
              <Link key={href} href={href}>{label}</Link>
            ))}
          </nav>

          <div className="dashboard-sidebar-footer">
            <Link href="/dashboard">لوحة المريض</Link>
            <Link href="/">الموقع العام</Link>
          </div>
        </aside>

        <section className="dashboard-content">{children}</section>
      </div>
    </SiteChrome>
  );
}
