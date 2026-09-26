import Link from "next/link";
import { SiteChrome } from "@/components/site-chrome";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const revalidate = 60;

type Nutritionist = {
  id: string;
  full_name: string | null;
  years_experience: number | null;
  bio: string | null;
  consultation_fee: number | null;
  currency: string | null;
};

type Program = {
  id: string;
  title_ar: string;
  description_ar: string | null;
  duration_days: number | null;
};

type Article = {
  id: string;
  title_ar: string;
  slug: string;
  excerpt_ar: string | null;
  published_at: string | null;
};

const categories = [
  ["التغذية العلاجية", "خدمات غذائية للحالات والاحتياجات الصحية", "/nutritionists"],
  ["إنقاص الوزن", "خطط ومتابعة تساعدك على بناء عادات مستدامة", "/programs"],
  ["التغذية الرياضية", "تغذية تدعم الأداء والتعافي والأهداف الرياضية", "/nutritionists"],
  ["تغذية الأطفال", "إرشادات مناسبة لاحتياجات الطفل الغذائية", "/nutritionists"],
  ["زيادة الوزن", "خطط غذائية مخصصة للوصول إلى هدفك", "/programs"],
  ["الحالات المزمنة", "متابعة غذائية وفق الاحتياج الصحي", "/nutritionists"],
];

const services = [
  ["الاستشارات الغذائية", "جلسة فردية مع أخصائي تغذية", "/booking"],
  ["الخطط الغذائية", "خطة تناسب هدفك ونمط حياتك", "/booking"],
  ["المتابعة الغذائية", "مراجعة مستمرة للتقدم وتحديث الخطة", "/dashboard"],
];

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();
  const [{ data: nutritionists }, { data: programs }, { data: articles }] = await Promise.all([
    supabase.rpc("list_public_nutritionists"),
    supabase
      .from("nutrition_programs")
      .select("id,title_ar,description_ar,duration_days")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("articles")
      .select("id,title_ar,slug,excerpt_ar,published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(6),
  ]);

  const publicNutritionists = (nutritionists as Nutritionist[] | null) ?? [];

  return (
    <SiteChrome>
      <main>
        <section className="promo-banner" aria-label="رسائل المنصة">
          <div className="promo-track">
            <Link href="/nutritionists"><strong>أخصائيون متاحون</strong><span>استعرض التخصصات والخدمات المتاحة</span></Link>
            <Link href="/programs"><strong>برامج غذائية</strong><span>تصفح البرامج المنشورة فعلياً</span></Link>
            <Link href="/articles"><strong>محتوى غذائي</strong><span>اكتشف المقالات المنشورة على المنصة</span></Link>
            <Link href="/nutritionists"><strong>أخصائيون متاحون</strong><span>استعرض التخصصات والخدمات المتاحة</span></Link>
            <Link href="/programs"><strong>برامج غذائية</strong><span>تصفح البرامج المنشورة فعلياً</span></Link>
            <Link href="/articles"><strong>محتوى غذائي</strong><span>اكتشف المقالات المنشورة على المنصة</span></Link>
          </div>
        </section>

        <div className="store-tools">
          <div className="container store-tools-inner">
            <form action="/nutritionists" method="get" className="site-search">
              <input name="q" aria-label="ابحث عن أخصائي تغذية" placeholder="ابحث عن أخصائي تغذية" />
              <button type="submit">بحث</button>
            </form>
          </div>
        </div>

        <section className="hero storefront-hero">
          <div className="container hero-content">
            <span className="eyebrow">D-Nutrition-Care</span>
            <h1>رعاية غذائية تبدأ<br /><span>من احتياجك</span></h1>
            <p>اختر الأخصائي والخدمة المناسبة لك، واستعرض البرامج والمحتوى الغذائي من منصة واحدة.</p>
            <div className="hero-actions">
              <Link href="/nutritionists" className="primary-btn large">استعرض الأخصائيين</Link>
              <Link href="/booking" className="secondary-btn large">احجز استشارتك</Link>
            </div>
          </div>
        </section>

        <section className="storefront-section">
          <div className="container">
            <div className="section-heading split">
              <div><span>الفئات</span><h2>تصفح حسب احتياجك</h2></div>
              <Link href="/categories" className="text-link">عرض الكل ←</Link>
            </div>
            <div className="horizontal-rail category-rail">
              {categories.map(([title, text, href]) => (
                <Link href={href} className="category-card storefront-card" key={title}>
                  <strong>{title}</strong><span>{text}</span><small>استكشف ←</small>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="storefront-section storefront-tinted">
          <div className="container">
            <div className="section-heading split">
              <div><span>الخدمات</span><h2>ابدأ بالخدمة التي تحتاجها</h2></div>
              <Link href="/booking" className="text-link">الحجز ←</Link>
            </div>
            <div className="horizontal-rail service-rail">
              {services.map(([title, text, href]) => (
                <Link href={href} className="service-card storefront-service" key={title}>
                  <small>خدمة</small><h3>{title}</h3><p>{text}</p><b>ابدأ الآن ←</b>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="feature-banner storefront-feature">
          <div className="container feature-banner-inner">
            <div><span className="eyebrow">الحجز أونلاين</span><h2>اختر الموعد المناسب لك</h2><p>استعرض الأخصائيين ثم اختر الخدمة والموعد المتاح وأكمل الحجز من حسابك.</p></div>
            <Link href="/booking" className="primary-btn large">ابدأ الحجز</Link>
          </div>
        </section>

        <section className="storefront-section">
          <div className="container">
            <div className="section-heading split">
              <div><span>الأخصائيون</span><h2>أخصائيون التغذية</h2></div>
              <Link href="/nutritionists" className="text-link">عرض الجميع ←</Link>
            </div>
            {publicNutritionists.length ? (
              <div className="horizontal-rail nutritionist-rail">
                {publicNutritionists.map((item) => (
                  <article className="nutritionist-card storefront-nutritionist" key={item.id}>
                    <div className="nutritionist-card-head">
                      <div className="nutritionist-avatar-fallback">{(item.full_name || "أ").slice(0, 1)}</div>
                      <div><h2>{item.full_name || "أخصائي تغذية"}</h2><p>{item.years_experience != null ? item.years_experience + " سنوات خبرة" : "الخبرة غير محددة"}</p></div>
                    </div>
                    <p className="nutritionist-bio">{item.bio || "لم تتم إضافة نبذة تعريفية بعد."}</p>
                    <div className="nutritionist-card-bottom">
                      <strong>{item.consultation_fee ?? "—"} {item.currency || "SAR"}</strong>
                      <Link href={"/nutritionists/" + item.id}>عرض الملف ←</Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-state">لا يوجد أخصائيون متاحون حالياً.</div>
            )}
          </div>
        </section>

        <section className="storefront-section storefront-tinted">
          <div className="container">
            <div className="section-heading split">
              <div><span>البرامج الغذائية</span><h2>برامج منشورة فعلياً</h2></div>
              <Link href="/programs" className="text-link">عرض البرامج ←</Link>
            </div>
            {programs?.length ? (
              <div className="horizontal-rail content-rail">
                {programs.map((program) => (
                  <article className="service-card content-card" key={program.id}>
                    <small>برنامج غذائي</small><h3>{program.title_ar}</h3><p>{program.description_ar || "برنامج غذائي منشور على المنصة."}</p>
                    <div className="program-meta"><span>{program.duration_days ? program.duration_days + " يوم" : "المدة غير محددة"}</span><Link href="/booking">ابدأ ←</Link></div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-state">لا توجد برامج منشورة حالياً.</div>
            )}
          </div>
        </section>

        <section className="storefront-section">
          <div className="container">
            <div className="section-heading split">
              <div><span>المحتوى</span><h2>أحدث المقالات</h2></div>
              <Link href="/articles" className="text-link">عرض المقالات ←</Link>
            </div>
            {articles?.length ? (
              <div className="horizontal-rail content-rail">
                {articles.map((article) => (
                  <article className="service-card content-card" key={article.id}>
                    <small>{article.published_at ? new Date(article.published_at).toLocaleDateString("ar-SA") : "مقال"}</small>
                    <h3>{article.title_ar}</h3>
                    <p>{article.excerpt_ar || "اقرأ المقال لمعرفة المزيد."}</p>
                    <Link href={"/articles/" + article.slug}>قراءة المقال ←</Link>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-state">لا توجد مقالات منشورة حالياً.</div>
            )}
          </div>
        </section>

        <section className="how-section">
          <div className="container">
            <div className="section-heading centered"><span>طريقة الاستخدام</span><h2>ثلاث خطوات للبدء</h2></div>
            <div className="steps">
              <div className="step"><b>01</b><div><h3>اختر الأخصائي</h3><p>استعرض الأخصائيين وتخصصاتهم.</p></div></div>
              <div className="step"><b>02</b><div><h3>حدد الخدمة والموعد</h3><p>اختر الخدمة والموعد المتاح ثم أكمل الحجز.</p></div></div>
              <div className="step"><b>03</b><div><h3>تابع من حسابك</h3><p>راجع حجوزاتك وبرامجك وتقدمك من حسابك.</p></div></div>
            </div>
          </div>
        </section>
      </main>
    </SiteChrome>
  );
}
