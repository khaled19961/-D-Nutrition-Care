const categories = [
  { title: "التغذية العلاجية", text: "استشارات غذائية مخصصة للحالات والاحتياجات الصحية.", href: "/nutritionists" },
  { title: "إنقاص الوزن", text: "خطط غذائية عملية تساعدك على بناء عادات صحية مستدامة.", href: "/programs" },
  { title: "التغذية الرياضية", text: "تغذية مناسبة للأداء الرياضي والتعافي وتحقيق أهدافك.", href: "/nutritionists" },
  { title: "الأخصائيون", text: "تعرّف على الأخصائيين واختر من يناسب احتياجك.", href: "/nutritionists" }
];

const services = [
  { title: "الاستشارات الغذائية", text: "جلسة مع أخصائي تغذية لفهم احتياجك ووضع خطوات مناسبة لك.", href: "/booking" },
  { title: "الخطط الغذائية", text: "خطة غذائية شخصية مبنية على هدفك ونمط حياتك وتفضيلاتك.", href: "/booking" },
  { title: "المتابعة الغذائية", text: "متابعة مستمرة مع أخصائيك لمراجعة التقدم وتحديث الخطة.", href: "/dashboard" }
];

export default function HomePage() {
  return (
    <main className="site-shell">
      <div className="top-strip">
        <div className="container top-strip-inner">
          <span>رعاية غذائية أونلاين</span>
          <span>اختر الأخصائي والخدمة والموعد المناسب لك</span>
          <a href="/auth/login">تسجيل الدخول</a>
        </div>
      </div>

      <header className="main-header">
        <div className="container header-inner">
          <a href="/" className="brand" aria-label="D-Nutrition-Care">
            <span className="brand-mark">D</span>
            <span><strong>D-Nutrition</strong><small>CARE</small></span>
          </a>

          <nav className="desktop-nav" aria-label="التنقل الرئيسي">
            <a className="active" href="/">الرئيسية</a>
            <a href="/categories">الفئات</a>
            <a href="/offers">العروض</a>
            <a href="/nutritionists">الأخصائيون</a>
            <a href="/articles">المقالات</a>
            <a href="/more">المزيد</a>
          </nav>

          <div className="header-actions">
            <a href="/auth/login" className="login-link">حسابي</a>
            <a href="/booking" className="primary-btn">احجز استشارتك</a>
          </div>
        </div>
      </header>

      <section className="promo-banner" aria-label="روابط سريعة">
        <div className="promo-track">
          <a href="/nutritionists"><strong>اختر الأخصائي المناسب لك</strong><span>استعرض الملفات والتخصصات ثم انتقل للحجز</span></a>
          <a href="/booking"><strong>احجز استشارتك أونلاين</strong><span>اختر الخدمة والموعد المتاح من المنصة</span></a>
          <a href="/programs"><strong>استكشف البرامج الغذائية</strong><span>البرامج المنشورة فعلياً على المنصة</span></a>
        </div>
      </section>

      <div className="moving-strip" aria-label="تنقل سريع">
        <div className="moving-strip-track">
          <span>رعاية غذائية أونلاين</span><span>أخصائيون وخدمات وحجوزات في مكان واحد</span><span>تابع حجوزاتك من حسابك</span>
          <span>رعاية غذائية أونلاين</span><span>أخصائيون وخدمات وحجوزات في مكان واحد</span><span>تابع حجوزاتك من حسابك</span>
        </div>
      </div>

      <div className="store-tools"><div className="container store-tools-inner"><a href="/more#location">اختر العنوان</a><form action="/nutritionists" method="get" className="site-search"><input name="q" aria-label="ابحث عن خدمة أو أخصائي" placeholder="ابحث عن خدمة أو أخصائي تغذية" /><button type="submit">بحث</button></form></div></div>

      <section className="hero">
        <div className="container hero-content">
          <span className="eyebrow">D-Nutrition-Care</span>
          <h1>رعايتك الغذائية تبدأ<br /><span>من احتياجك</span></h1>
          <p>تعرّف على خدمات التغذية، اختر الأخصائي المناسب، واحجز استشارتك أونلاين من مكان واحد.</p>
          <div className="hero-actions">
            <a href="/nutritionists" className="primary-btn large">استعرض الأخصائيين</a>
            <a href="/booking" className="secondary-btn large">احجز استشارتك</a>
          </div>
        </div>
      </section>

      <section className="feature-banner">
        <div className="container feature-banner-inner">
          <div><span className="eyebrow">ابدأ من هنا</span><h2>خدمة غذائية مصممة لتناسب هدفك</h2><p>اختر الأخصائي أو الخدمة ثم انتقل مباشرة إلى الموعد المتاح.</p></div>
          <a href="/booking" className="primary-btn large">ابدأ الحجز</a>
        </div>
      </section>
      <section className="featured-links">
        <div className="container featured-links-grid">
          <a href="/nutritionists"><span>01</span><strong>الأخصائيون</strong><small>تصفح الملفات والتخصصات</small></a>
          <a href="/programs"><span>02</span><strong>البرامج الغذائية</strong><small>البرامج المنشورة في المنصة</small></a>
          <a href="/articles"><span>03</span><strong>المقالات</strong><small>محتوى غذائي وتثقيفي</small></a>
        </div>
      </section>

      <section className="quick-categories">
        <div className="container">
          <div className="section-heading">
            <span>استكشف خدماتنا</span>
            <h2>اختر ما يناسب هدفك</h2>
          </div>
          <div className="category-grid">
            {categories.map((item) => (
              <a href={item.href} className="category-card" key={item.title}>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
                <span className="arrow">←</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="services-section">
        <div className="container">
          <div className="section-heading split">
            <div>
              <span>خدمات D-Nutrition-Care</span>
              <h2>خدمات غذائية في مكان واحد</h2>
              <p>ابدأ بالخدمة التي تحتاجها وانتقل مباشرة إلى الخطوة التالية.</p>
            </div>
            <a href="/programs" className="text-link">عرض البرامج ←</a>
          </div>

          <div className="services-grid">
            {services.map((service, index) => (
              <article className="service-card" key={service.title}>
                <span className="service-number">0{index + 1}</span>
                <h3>{service.title}</h3>
                <p>{service.text}</p>
                <a href={service.href}>ابدأ الآن ←</a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="directory-section">
        <div className="container directory-grid">
          <div>
            <span>الأخصائيون</span>
            <h2>اختر الأخصائي المناسب لك</h2>
            <p>استعرض الأخصائيين المتاحين وتعرّف على تخصصاتهم ثم انتقل إلى الحجز.</p>
            <a href="/nutritionists" className="primary-btn">استعرض الأخصائيين</a>
          </div>
          <div className="directory-list">
            <div><b>01</b><span>تخصصات غذائية متعددة</span></div>
            <div><b>02</b><span>ملفات أخصائيين حقيقية</span></div>
            <div><b>03</b><span>الحجز حسب المواعيد المتاحة</span></div>
          </div>
        </div>
      </section>

      <section className="how-section">
        <div className="container">
          <div className="section-heading centered">
            <span>طريقة الاستخدام</span>
            <h2>ابدأ رحلتك بسهولة</h2>
          </div>
          <div className="steps">
            <div className="step"><b>01</b><div><h3>اختر الأخصائي</h3><p>استعرض الأخصائيين وتخصصاتهم.</p></div></div>
            <div className="step"><b>02</b><div><h3>حدد الخدمة والموعد</h3><p>اختر الخدمة والموعد المتاح ثم أكمل الحجز.</p></div></div>
            <div className="step"><b>03</b><div><h3>ابدأ المتابعة</h3><p>تابع حجوزاتك وخطتك من حسابك.</p></div></div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container footer-grid">
          <div>
            <a href="/" className="brand footer-brand"><span className="brand-mark">D</span><span><strong>D-Nutrition</strong><small>CARE</small></span></a>
            <p>منصة للرعاية الغذائية والاستشارات والمتابعة أونلاين.</p>
          </div>
          <div><h4>الخدمات</h4><a href="/nutritionists">الأخصائيون</a><a href="/programs">البرامج</a><a href="/booking">الحجز</a></div>
          <div><h4>المحتوى</h4><a href="/articles">المقالات</a><a href="/about">من نحن</a></div>
          <div><h4>الحساب</h4><a href="/auth/login">تسجيل الدخول</a><a href="/dashboard">لوحة الحساب</a></div>
        </div>
        <div className="container footer-bottom"><span>© D-Nutrition-Care</span><span>رعاية غذائية تبدأ من احتياجك</span></div>
      </footer>

      <nav className="mobile-nav" aria-label="التنقل للجوال">
        <a className="active" href="/"><small>الرئيسية</small></a>
        <a href="/categories"><small>الفئات</small></a>
        <a href="/offers"><small>العروض</small></a>
        <a href="/cart"><small>السلة</small></a>
        <a href="/more"><small>المزيد</small></a>
      </nav>
    </main>
  );
}
