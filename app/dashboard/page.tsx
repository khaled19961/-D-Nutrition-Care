import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SiteChrome } from "@/components/site-chrome";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const { data: claims } = await supabase.auth.getClaims();

  if (!claims?.claims?.sub) {
    redirect("/auth/login?next=/dashboard");
  }

  const userId = claims.claims.sub as string;
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, phone, locale")
    .eq("id", userId)
    .maybeSingle();

  const { data: appointments } = await supabase
    .from("appointments")
    .select("id, starts_at, ends_at, status, booking_notes")
    .eq("patient_id", userId)
    .order("starts_at", { ascending: true })
    .limit(5);

  return (
    <SiteChrome><main className="min-h-screen bg-[var(--background)] py-10">
      <div className="container">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link href="/" className="text-sm font-semibold text-[var(--primary)]">D-Nutrition-Care</Link>
            <h1 className="mt-2 text-3xl font-extrabold">مرحباً {profile?.full_name || "بك"}</h1>
            <p className="mt-1 text-[var(--muted)]">هذه لوحة البداية لحسابك الصحي.</p>
          </div>
          <Link href="/booking" className="rounded-xl bg-[var(--primary)] px-5 py-3 font-bold text-white">حجز استشارة</Link>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <DashboardCard href="/dashboard/appointments" title="مواعيدي" text="عرض وإدارة مواعيد الاستشارات." />
          <DashboardCard href="/dashboard/programs" title="برامجي الغذائية" text="متابعة البرامج والخطط المسندة إليك." />
          <DashboardCard href="/dashboard/progress" title="تقدمي" text="الوزن والقياسات وسجل التقدم." />
        </div>

        <section className="mt-8 rounded-3xl border border-[var(--border)] bg-white p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold">أقرب المواعيد</h2>
            <Link href="/dashboard/appointments" className="text-sm font-semibold text-[var(--primary)]">عرض الكل</Link>
          </div>

          {appointments?.length ? (
            <div className="mt-5 space-y-3">
              {appointments.map((item) => (
                <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border)] p-4">
                  <div>
                    <p className="font-semibold">{new Date(item.starts_at).toLocaleString("ar-SA")}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">حالة الموعد: {item.status}</p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm text-[var(--primary)]">موعد</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl bg-[var(--background)] p-6 text-center text-[var(--muted)]">
              لا توجد مواعيد حتى الآن.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function DashboardCard({ href, title, text }: { href: string; title: string; text: string }) {
  return (
    <Link href={href} className="rounded-3xl border border-[var(--border)] bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-sm">
      <h2 className="text-xl font-bold">{title}</h2>
      <p className="mt-2 leading-7 text-[var(--muted)]">{text}</p>
    </Link>
  );
}
