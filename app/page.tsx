import Link from "next/link";
import type { CSSProperties } from "react";
import { SiteChrome } from "@/components/site-chrome";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const revalidate = 60;

type Banner = {
  id: string;
  image_url: string;
  alt_ar: string;
  title_ar: string | null;
  subtitle_ar: string | null;
  link_url: string | null;
};

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();
  const [{ data: nutritionists }, { data: programs }, { data: articles }, { data: banners }] = await Promise.all([
    supabase.rpc("list_public_nutritionists"),
    supabase.from("nutrition_programs").select("id,title_ar,description_ar,duration_days").eq("status", "published").order("created_at", { ascending: false }).limit(6),
    supabase.from("articles").select("id,title_ar,slug,excerpt_ar,published_at").eq("status", "published").order("published_at", { ascending: false }).limit(6),
    supabase.from("site_banners").select("id,image_url,alt_ar,title_ar,subtitle_ar,link_url").eq("is_active", true).order("sort_order", { ascending: true }).order("created_at", { ascending: false })
  ]);
  const publicNutritionists = (nutritionists ?? []) as any[];
  const activeBanners = (banners ?? []) as Banner[];
  return (
    <SiteChrome>
      <main>
        <section className="hero-banner-area" aria-label="البنرات الرئيسية">
          {activeBanners.length ? (
            <div className="hero-banner-carousel" style={{"--banner-count": activeBanners.length} as CSSProperties}>
              {activeBanners.map((banner, index) => {
                const content = <div className="hero-banner-slide" style={{"--banner-index": index} as CSSProperties}>
                  <img src={banner.image_url} alt={banner.alt_ar || banner.title_ar || "بنر D-Nutrition-Care"} />
                  {(banner.title_ar || banner.subtitle_ar) && (
                    <div className="hero-banner-overlay">
                      {banner.title_ar && <h1>{banner.title_ar}</h1>}
                      {banner.subtitle_ar && <p>{banner.subtitle_ar}</p>}
                    </div>
                  )}
                </div>;
                return banner.link_url ? <Link href={banner.link_url} key={banner.id} className="hero-banner-link">{content}</Link> : <div key={banner.id}>{content}</div>;
              })}
            </div>
          ) : (
            <div className="hero-banner-empty">
              <div className="container"><span>ابدأ رحلتك الغذائية</span><h1>رعاية غذائية تناسب احتياجك</h1><p>استعرض الأخصائيين والخدمات والبرامج الغذائية من مكان واحد.</p></div>
            </div>
          )}
        </section>

        <section className="storefront-section"><div className="container"><div className="section-heading split"><div><span>الفئات</span><h2>تصفح حسب احتياجك</h2></div><Link href="/categories" className="text-link">عرض الكل ←</Link></div><div className="horizontal-rail category-rail">{categories.map(([title,text,href])=><Link href={href} className="category-card storefront-card" key={title}><strong>{title}</strong><span>{text}</span><small>استكشف ←</small></Link>)}</div></div></section>
        <section className="storefront-section storefront-tinted"><div className="container"><div className="section-heading split"><div><span>الخدمات</span><h2>ابدأ بالخدمة التي تحتاجها</h2></div><Link href="/booking" className="text-link">الحجز ←</Link></div><div className="horizontal-rail service-rail">{services.map(([title,text,href])=><Link href={href} className="service-card storefront-service" key={title}><small>خدمة</small><h3>{title}</h3><p>{text}</p><b>ابدأ الآن ←</b></Link>)}</div></div></section>
        <section className="feature-banner storefront-feature"><div className="container feature-banner-inner"><div><span className="eyebrow">الحجز أونلاين</span><h2>اختر الموعد المناسب لك</h2><p>استعرض الأخصائيين ثم اختر الخدمة والموعد المتاح وأكمل الحجز من حسابك.</p></div><Link href="/booking" className="primary-btn large">ابدأ الحجز</Link></div></section>
        <section className="storefront-section"><div className="container"><div className="section-heading split"><div><span>الأخصائيون</span><h2>أخصائيون التغذية</h2></div><Link href="/nutritionists" className="text-link">عرض الجميع ←</Link></div>{publicNutritionists.length?<div className="horizontal-rail nutritionist-rail">{publicNutritionists.map((item)=><article className="nutritionist-card storefront-nutritionist" key={item.id}><div className="nutritionist-card-head"><div className="nutritionist-avatar-fallback">{(item.full_name||"أ").slice(0,1)}</div><div><h2>{item.full_name||"أخصائي تغذية"}</h2><p>{item.years_experience!=null?item.years_experience+" سنوات خبرة":"الخبرة غير محددة"}</p></div></div><p className="nutritionist-bio">{item.bio||"لم تتم إضافة نبذة تعريفية بعد."}</p><div className="nutritionist-card-bottom"><strong>{item.consultation_fee??"—"} {item.currency||"SAR"}</strong><Link href={"/nutritionists/"+item.id}>عرض الملف ←</Link></div></article>)}</div>:<div className="empty-state">لا يوجد أخصائيون متاحون حالياً.</div>}</div></section>
        <section className="storefront-section storefront-tinted"><div className="container"><div className="section-heading split"><div><span>البرامج الغذائية</span><h2>برامج منشورة فعلياً</h2></div><Link href="/programs" className="text-link">عرض البرامج ←</Link></div>{programs?.length?<div className="horizontal-rail content-rail">{programs.map((program)=><article className="service-card content-card" key={program.id}><small>برنامج غذائي</small><h3>{program.title_ar}</h3><p>{program.description_ar||"برنامج غذائي منشور على المنصة."}</p><div className="program-meta"><span>{program.duration_days?program.duration_days+" يوم":"المدة غير محددة"}</span><Link href="/booking">ابدأ ←</Link></div></article>)}</div>:<div className="empty-state">لا توجد برامج منشورة حالياً.</div>}</div></section>
        <section className="storefront-section"><div className="container"><div className="section-heading split"><div><span>المحتوى</span><h2>أحدث المقالات</h2></div><Link href="/articles" className="text-link">عرض المقالات ←</Link></div>{articles?.length?<div className="horizontal-rail content-rail">{articles.map((article)=><article className="service-card content-card" key={article.id}><small>{article.published_at?new Date(article.published_at).toLocaleDateString("ar-SA"):"مقال"}</small><h3>{article.title_ar}</h3><p>{article.excerpt_ar||"اقرأ المقال لمعرفة المزيد."}</p><Link href={"/articles/"+article.slug}>قراءة المقال ←</Link></article>)}</div>:<div className="empty-state">لا توجد مقالات منشورة حالياً.</div>}</div></section>
        <section className="how-section"><div className="container"><div className="section-heading centered"><span>طريقة الاستخدام</span><h2>ثلاث خطوات للبدء</h2></div><div className="steps"><div className="step"><b>01</b><div><h3>اختر الأخصائي</h3><p>استعرض الأخصائيين وتخصصاتهم.</p></div></div><div className="step"><b>02</b><div><h3>حدد الخدمة والموعد</h3><p>اختر الخدمة والموعد المتاح ثم أكمل الحجز.</p></div></div><div className="step"><b>03</b><div><h3>تابع من حسابك</h3><p>راجع حجوزاتك وبرامجك وتقدمك من حسابك.</p></div></div></div></div></section>
      </main>
    </SiteChrome>
  );
}

const categories = [
  ["التغذية العلاجية","خدمات غذائية للحالات والاحتياجات الصحية","/nutritionists"],
  ["إنقاص الوزن","خطط ومتابعة تساعدك على بناء عادات مستدامة","/programs"],
  ["التغذية الرياضية","تغذية تدعم الأداء والتعافي والأهداف الرياضية","/nutritionists"],
  ["تغذية الأطفال","إرشادات مناسبة لاحتياجات الطفل الغذائية","/nutritionists"],
  ["زيادة الوزن","خطط غذائية مخصصة للوصول إلى هدفك","/programs"],
  ["الحالات المزمنة","متابعة غذائية وفق الاحتياج الصحي","/nutritionists"],
] as const;
const services = [
  ["الاستشارات الغذائية","جلسة فردية مع أخصائي تغذية","/booking"],
  ["الخطط الغذائية","خطة تناسب هدفك ونمط حياتك","/booking"],
  ["المتابعة الغذائية","مراجعة مستمرة للتقدم وتحديث الخطة","/dashboard"],
] as const;