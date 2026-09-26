import Link from "next/link";
import { SiteChrome } from "@/components/site-chrome";

const categories = [
  ["التغذية العلاجية","استشارات غذائية للحالات والاحتياجات الصحية المختلفة."],
  ["إنقاص الوزن","متابعة غذائية تساعدك على بناء عادات صحية قابلة للاستمرار."],
  ["التغذية الرياضية","تغذية مخصصة للأداء الرياضي والتعافي وتحقيق الأهداف."],
  ["تغذية الأطفال","إرشاد غذائي مناسب لاحتياجات الطفل ومراحل نموه."],
  ["زيادة الوزن","خطط غذائية منظمة لرفع المدخول الغذائي بطريقة مناسبة."],
  ["التغذية للحالات المزمنة","متابعة غذائية مرتبطة بالاحتياجات الصحية الموصى بها."],
  ["الاستشارات العامة","تقييم احتياجك الغذائي والبدء بخطوات عملية."],
  ["الأخصائيون","تصفح الأخصائيين المتاحين واختيار الموعد المناسب."]
];

export default function CategoriesPage() {
  return <SiteChrome><main>
    <section className="page-hero"><div className="container"><span>الفئات</span><h1>اختر مجال الرعاية الغذائية الذي يناسبك</h1><p>تصفح الخدمات حسب الهدف أو الاحتياج ثم انتقل مباشرة إلى الأخصائي والحجز.</p></div></section>
    <section><div className="container"><div className="category-grid">
      {categories.map(([title,text]) => <Link href={title === "الأخصائيون" ? "/nutritionists" : "/booking"} className="category-card" key={title}><div><h3>{title}</h3><p>{text}</p></div><span className="arrow">←</span></Link>)}
    </div></div></section>
  </main></SiteChrome>;
}
