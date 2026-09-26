import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import { SiteChrome } from "@/components/site-chrome";

export const revalidate = 60;

export default async function OffersPage() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("nutrition_programs").select("id,title_ar,description_ar,duration_days").eq("status","published").order("created_at",{ascending:false});

  return <SiteChrome><main>
    <section className="page-hero"><div className="container"><span>العروض والبرامج</span><h1>برامج غذائية منشورة ومتاحة عبر المنصة</h1><p>نظهر هنا البيانات المنشورة فعلياً في النظام فقط. لا توجد عروض أو أسعار تجريبية.</p></div></section>
    <section><div className="container"><div className="services-grid">
      {error ? <div className="empty-state">تعذر تحميل البرامج حالياً.</div> : data?.length ? data.map(program => <article className="service-card" key={program.id}><h3>{program.title_ar}</h3><p>{program.description_ar || "برنامج غذائي منشور من المنصة."}</p><div className="program-meta">{program.duration_days ? <span>{program.duration_days} يوم</span> : null}<Link href="/booking">ابدأ الحجز ←</Link></div></article>) : <div className="empty-state">لا توجد برامج أو عروض منشورة حالياً.</div>}
    </div></div></section>
  </main></SiteChrome>;
}
