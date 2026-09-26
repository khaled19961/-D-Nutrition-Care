import Link from "next/link";
import { SiteChrome } from "@/components/site-chrome";

const categories = [
  ["التغذية العلاجية","استشارات غذائية مخصصة للحالات والاحتياجات الصحية.","/nutritionists"],
  ["إنقاص الوزن","خطط غذائية عملية تساعدك على بناء عادات صحية مستدامة.","/programs"],
  ["التغذية الرياضية","تغذية مناسبة للأداء الرياضي والتعافي وتحقيق أهدافك.","/nutritionists"],
  ["تغذية الأطفال","إرشادات غذائية مناسبة لاحتياجات الأطفال.","/nutritionists"],
];

const services = [
  ["الاستشارات الغذائية","جلسة مع أخصائي تغذية لفهم احتياجك ووضع خطوات مناسبة لك.","/booking"],
  ["الخطط الغذائية","خطة غذائية شخصية مبنية على هدفك ونمط حياتك وتفضيلاتك.","/booking"],
  ["المتابعة الغذائية","متابعة مستمرة مع أخصائيك لمراجعة التقدم وتحديث الخطة.","/dashboard"],
];

const promos = [
  ["اختر الأخصائي المناسب لك","استعرض الملفات والتخصصات ثم انتقل للحجز.","/nutritionists"],
  ["احجز استشارتك أونلاين","اختر الخدمة والموعد المتاح من المنصة.","/booking"],
  ["استكشف البرامج الغذائية","تصفح البرامج المنشورة فعلياً على المنصة.","/programs"],
];

export default function HomePage() {
  return (
    <SiteChrome>
      <main>
        <section className="promo-banner" aria-label="روابط سريعة">
          <div className="promo-track">
            {[...promos, ...promos].map(([title,text,href], index) => (
              <Link href={href} key={title + index}><strong>{title}</strong><span>{text}</span></Link>
            ))}
          </div>
        </section>

        <div className="store-tools">
          <div className="container store-tools-inner">
            <form action="/nutritionists" method="get" className="site-search">
              <input name="q" aria-label="ابحث عن خدمة أو أخصائي" placeholder="ابحث عن خدمة أو أخصائي تغذية" />
              <button type="submit">بحث</button>
            </form>
          </div>
        </div>

        <section className="hero">
          <div className="container hero-content">
            <span className="eyebrow">D-Nutrition-Care</span>
            <h1>رعايتك الغذائية تبدأ<br /><span>من احتياجك</span></h1>
            <p>تعرّف على خدمات التغذية، اختر الأخصائي المناسب، واحجز استشارتك أونلاين من مكان واحد.</p>
            <div className="hero-actions">
              <Link href="/nutritionists" className="primary-btn large">استعرض الأخصائيين</Link>
              <Link href="/booking" className="secondary-btn large">احجز استشارتك</Link>
            </div>
          </div>
        </section>

        <section className="quick-categories">
          <div className="container">
            <div className="section-heading">
              <span>الفئات</span>
              <h2>اختر المجال المناسب لاحتياجك</h2>
            </div>
            <div className="category-grid">
              {categories.map(([title,text,href]) => <Link href={href} className="category-card" key={title}><div><h3>{title}</h3><p>{text}</p></div><span className="arrow">←</span></Link>)}
            </div>
          </div>
        </section>

        <section className="services-section">
          <div className="container">
            <div className="section-heading split">
              <div><span>خدمات D-Nutrition-Care</span><h2>خدمات غذائية في مكان واحد</h2><p>ابدأ بالخدمة التي تحتاجها وانتقل مباشرة إلى الخطوة التالية.</p></div>
              <Link href="/programs" className="text-link">عرض البرامج ←</Link>
            </div>
            <div className="services-grid">
              {services.map(([title,text,href], index) => <article className="service-card" key={title}><span className="service-number">0{index + 1}</span><h3>{title}</h3><p>{text}</p><Link href={href}>ابدأ الآن ←</Link></article>)}
            </div>
          </div>
        </section>

        <section className="feature-banner">
          <div className="container feature-banner-inner">
            <div><span className="eyebrow">ابدأ من هنا</span><h2>خدمة غذائية مصممة لتناسب هدفك</h2><p>اختر الأخصائي أو الخدمة ثم انتقل مباشرة إلى الموعد المتاح.</p></div>
            <Link href="/booking" className="primary-btn large">ابدأ الحجز</Link>
          </div>
        </section>

        <section className="featured-links">
          <div className="container featured-links-grid">
            <Link href="/nutritionists"><span>01</span><strong>الأخصائيون</strong><small>تصفح الملفات والتخصصات</small></Link>
            <Link href="/programs"><span>02</span><strong>البرامج الغذائية</strong><small>البرامج المنشورة في المنصة</small></Link>
            <Link href="/articles"><span>03</span><strong>المقالات</strong><small>محتوى غذائي وتثقيفي</small></Link>
          </div>
        </section>

        <section className="directory-section">
          <div className="container directory-grid">
            <div><span>الأخصائيون</span><h2>اختر الأخصائي المناسب لك</h2><p>استعرض الأخصائيين وتعرّف على تخصصاتهم ثم انتقل إلى الحجز.</p><Link href="/nutritionists" className="primary-btn">استعرض الأخصائيين</Link></div>
            <div className="directory-list"><div><b>01</b><span>تخصصات غذائية متعددة</span></div><div><b>02</b><span>ملفات أخصائيين حقيقية</span></div><div><b>03</b><span>الحجز حسب المواعيد المتاحة</span></div></div>
          </div>
        </section>

        <section className="how-section">
          <div className="container">
            <div className="section-heading centered"><span>طريقة الاستخدام</span><h2>ابدأ رحلتك بسهولة</h2></div>
            <div className="steps">
              <div className="step"><b>01</b><div><h3>اختر الأخصائي</h3><p>استعرض الأخصائيين وتخصصاتهم.</p></div></div>
              <div className="step"><b>02</b><div><h3>حدد الخدمة والموعد</h3><p>اختر الخدمة والموعد المتاح ثم أكمل الحجز.</p></div></div>
              <div className="step"><b>03</b><div><h3>ابدأ المتابعة</h3><p>تابع حجوزاتك وخطتك من حسابك.</p></div></div>
            </div>
          </div>
        </section>
      </main>
    </SiteChrome>
  );
}
