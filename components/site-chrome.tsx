import Link from "next/link";
import { MainNav, MobileNav } from "@/components/navigation";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="site-shell">
      <div className="top-strip">
        <div className="container top-strip-inner">
          <Link href="/more#location">اختر العنوان</Link>
          <span>رعاية غذائية أونلاين</span>
          <span>استشارات وخطط غذائية ومتابعة</span>
          <Link href="/auth/login">حسابي</Link>
        </div>
      </div>
      <div className="moving-strip"><div className="moving-strip-track"><span>استشارات غذائية</span><span>خطط غذائية شخصية</span><span>متابعة غذائية مستمرة</span><span>محتوى غذائي موثوق</span><span>استشارات غذائية</span><span>خطط غذائية شخصية</span><span>متابعة غذائية مستمرة</span><span>محتوى غذائي موثوق</span></div></div>
      <header className="main-header">
        <div className="container header-inner">
          <Link href="/" className="brand" aria-label="D-Nutrition-Care">
            <span className="brand-mark">D</span>
            <span><strong>D-Nutrition</strong><small>CARE</small></span>
          </Link>
          <MainNav />
          <div className="header-actions">
            <Link href="/booking" className="primary-btn">احجز استشارتك</Link>
          </div>
        </div>
      </header>
      {children}
      <footer className="footer">
        <div className="container footer-grid">
          <div>
            <Link href="/" className="brand footer-brand"><span className="brand-mark">D</span><span><strong>D-Nutrition</strong><small>CARE</small></span></Link>
            <p>منصة للرعاية الغذائية والاستشارات والمتابعة أونلاين.</p>
          </div>
          <div><h4>الخدمات</h4><Link href="/categories">الفئات</Link><Link href="/nutritionists">الأخصائيون</Link><Link href="/booking">الحجز</Link></div>
          <div><h4>المحتوى</h4><Link href="/articles">المقالات</Link><Link href="/programs">البرامج</Link><Link href="/about">من نحن</Link></div>
          <div><h4>المساعدة</h4><Link href="/more#faq">الأسئلة الشائعة</Link><Link href="/more#contact">تواصل معنا</Link><Link href="/more#policies">السياسات</Link></div>
        </div>
        <div className="container footer-bottom"><span>© D-Nutrition-Care</span><span>رعاية غذائية تبدأ من احتياجك</span></div>
      </footer>
      <MobileNav />
    </div>
  );
}
