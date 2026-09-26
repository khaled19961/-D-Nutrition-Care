const categories = [
  { icon: "🥗", title: "التغذية العلاجية", text: "استشارات وخطط غذائية تناسب حالتك وأهدافك." },
  { icon: "⚖️", title: "إنقاص الوزن", text: "برنامج عملي يساعدك على الوصول لوزن صحي بطريقة مستدامة." },
  { icon: "💪", title: "التغذية الرياضية", text: "خطط تغذية تدعم أداءك الرياضي وتعافي جسمك." },
  { icon: "👩‍⚕️", title: "أخصائيون متخصصون", text: "اختر الأخصائي المناسب واحجز موعدك بسهولة." }
];

const services = [
  { title: "استشارة غذائية", text: "جلسة فردية مع أخصائي تغذية لفهم احتياجك ووضع خطوات واضحة." },
  { title: "خطة غذائية شخصية", text: "خطة مرنة مبنية على هدفك ونمط حياتك وتفضيلاتك الغذائية." },
  { title: "متابعة وتقييم", text: "تابع قياساتك وتقدمك وعدّل خطتك مع أخصائيك بشكل مستمر." }
];

const offers = [
  { badge: "الأكثر طلباً", title: "استشارة + خطة غذائية", text: "ابدأ بخطتك المناسبة لهدفك وتابع تقدمك من مكان واحد." },
  { badge: "ابدأ اليوم", title: "تقييم غذائي شامل", text: "تعرّف على احتياجاتك الغذائية والخطوات المناسبة لك." },
  { badge: "متابعة", title: "برنامج متابعة شهرية", text: "متابعة منتظمة تساعدك على الاستمرار وتحقيق أهدافك." }
];

export default function HomePage() {
  return (
    <main className="site-shell">
      <div className="top-strip"><div className="container top-strip-inner"><span>🌿 صحتك تبدأ بخطوة</span><span>استشارات غذائية أونلاين بسهولة وأمان</span></div></div>
      <header className="main-header"><div className="container header-inner">
        <a href="/" className="brand"><span className="brand-mark">D</span><span><strong>D-Nutrition</strong><small>CARE</small></span></a>
        <nav className="desktop-nav" aria-label="التنقل الرئيسي"><a className="active" href="/">الرئيسية</a><a href="/nutritionists">الأخصائيون</a><a href="/programs">البرامج</a><a href="/articles">المقالات</a><a href="/about">من نحن</a></nav>
        <div className="header-actions"><a href="/auth/login" className="login-link">تسجيل الدخول</a><a href="/booking" className="primary-btn">احجز استشارتك</a></div>
      </div></header>

      <section className="hero"><div className="container hero-grid">
        <div className="hero-copy"><span className="eyebrow">رعاية غذائية تناسبك</span><h1>غذاؤك اليوم<br /><span>يصنع صحتك غداً</span></h1>
          <p>منصة متكاملة تساعدك على الوصول إلى أخصائي التغذية المناسب، الحصول على خطة غذائية شخصية، ومتابعة تقدمك في رحلة صحية واضحة.</p>
          <div className="hero-actions"><a href="/nutritionists" className="primary-btn large">اكتشف الأخصائيين <span>←</span></a><a href="/booking" className="secondary-btn large">احجز موعدك</a></div>
          <div className="trust-row"><div><strong>✓</strong><span>استشارات عن بعد</span></div><div><strong>✓</strong><span>خطط شخصية</span></div><div><strong>✓</strong><span>متابعة مستمرة</span></div></div>
        </div>
        <div className="hero-visual"><div className="hero-circle circle-one"></div><div className="hero-circle circle-two"></div>
          <div className="nutrition-card main-nutrition-card"><div className="food-visual">🥑</div><div className="nutrition-card-content"><span>رحلتك الصحية</span><strong>خطوة بخطوة نحو الأفضل</strong><div className="progress"><span></span></div><small>خطة غذائية • متابعة • نتائج</small></div></div>
          <div className="floating-card floating-top"><span>⭐</span><div><strong>أخصائيون متخصصون</strong><small>اختر من يناسب احتياجك</small></div></div>
          <div className="floating-card floating-bottom"><span>✓</span><div><strong>متابعة تقدمك</strong><small>بياناتك في مكان واحد</small></div></div>
        </div>
      </div></section>

      <section className="quick-categories"><div className="container"><div className="section-heading centered"><span>اكتشف خدماتنا</span><h2>كل ما تحتاجه لرحلتك الغذائية</h2><p>حلول غذائية عملية مصممة لتناسب أهدافك ونمط حياتك</p></div>
        <div className="category-grid">{categories.map((item)=><a href="/nutritionists" className="category-card" key={item.title}><span className="category-icon">{item.icon}</span><div><h3>{item.title}</h3><p>{item.text}</p></div><span className="arrow">←</span></a>)}</div>
      </div></section>

      <section className="services-section"><div className="container"><div className="section-heading split"><div><span>خدمات D-Nutrition-Care</span><h2>رعاية غذائية في مكان واحد</h2></div><a href="/programs" className="text-link">عرض جميع الخدمات ←</a></div>
        <div className="services-grid">{services.map((service,index)=><article className="service-card" key={service.title}><span className="service-number">0{index+1}</span><div className="service-icon">{["🥗","📋","📈"][index]}</div><h3>{service.title}</h3><p>{service.text}</p><a href="/booking">اعرف المزيد ←</a></article>)}</div>
      </div></section>

      <section className="offers-section"><div className="container"><div className="section-heading centered light"><span>ابدأ رحلتك الآن</span><h2>برامج وخدمات تناسب هدفك</h2></div>
        <div className="offer-grid">{offers.map(offer=><article className="offer-card" key={offer.title}><span className="offer-badge">{offer.badge}</span><h3>{offer.title}</h3><p>{offer.text}</p><a href="/booking">احجز الآن <span>←</span></a></article>)}</div>
      </div></section>

      <section className="how-section"><div className="container how-grid"><div className="how-copy"><span>بكل بساطة</span><h2>رحلتك الصحية تبدأ في 3 خطوات</h2><p>لا تحتاج إلى تعقيد. اختر الأخصائي، احجز موعدك، وابدأ خطتك الغذائية مع متابعة واضحة لتقدمك.</p><a href="/booking" className="primary-btn">ابدأ الآن</a></div>
        <div className="steps"><div className="step"><b>01</b><div><h3>اختر الأخصائي</h3><p>تعرّف على الأخصائيين وتخصصاتهم واختر من يناسب هدفك.</p></div></div><div className="step"><b>02</b><div><h3>احجز موعدك</h3><p>حدد الخدمة والموعد المناسب وأكمل الحجز بسهولة.</p></div></div><div className="step"><b>03</b><div><h3>تابع تقدمك</h3><p>استمر في خطتك وسجّل تقدمك مع المتابعة المستمرة.</p></div></div></div>
      </div></section>

      <footer className="footer"><div className="container footer-grid">
        <div><a href="/" className="brand footer-brand"><span className="brand-mark">D</span><span><strong>D-Nutrition</strong><small>CARE</small></span></a><p>منصة متكاملة للتغذية والاستشارات والمتابعة الصحية.</p></div>
        <div><h4>روابط مهمة</h4><a href="/nutritionists">الأخصائيون</a><a href="/programs">البرامج</a><a href="/articles">المقالات</a></div>
        <div><h4>خدمة العملاء</h4><a href="/booking">احجز استشارتك</a><a href="/about">من نحن</a><a href="/auth/login">تسجيل الدخول</a></div>
        <div><h4>ابدأ رحلتك</h4><p>احصل على الرعاية الغذائية المناسبة لك.</p><a href="/booking" className="footer-btn">احجز الآن</a></div>
      </div><div className="container footer-bottom"><span>© D-Nutrition-Care</span><span>رعاية غذائية تبدأ من احتياجك</span></div></footer>

      <nav className="mobile-nav" aria-label="التنقل للجوال"><a className="active" href="/">⌂<small>الرئيسية</small></a><a href="/nutritionists">♧<small>الأخصائيون</small></a><a href="/booking" className="mobile-book">＋<small>احجز</small></a><a href="/programs">▦<small>البرامج</small></a><a href="/auth/login">◯<small>حسابي</small></a></nav>
    </main>
  );
}
