import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const { data: claims } = await supabase.auth.getClaims();

  if (!claims?.claims?.sub) {
    redirect("/auth/login?next=/dashboard");
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-[var(--border)] bg-white">
        <div className="container flex min-h-16 flex-wrap items-center justify-between gap-4">
          <Link href="/dashboard" className="font-extrabold text-[var(--primary)]">D-Nutrition-Care</Link>
          <nav className="flex flex-wrap gap-4 text-sm font-semibold">
            <Link href="/dashboard">الرئيسية</Link>
            <Link href="/dashboard/appointments">المواعيد</Link>
            <Link href="/dashboard/programs">البرامج</Link>
            <Link href="/dashboard/progress">التقدم</Link><Link href="/dashboard/goals">الأهداف</Link>
            <Link href="/dashboard/profile">الملف الشخصي</Link>
          </nav>
          <Link href="/booking" className="rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-bold text-white">حجز جديد</Link>
        </div>
      </header>
      {children}
    </div>
  );
}
