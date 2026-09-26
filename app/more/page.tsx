import Link from "next/link";
import { SiteChrome } from "@/components/site-chrome";

const links = [
  ["حسابي","إدارة بيانات الحساب والحجوزات.","/dashboard"],
  ["حجوزاتي","متابعة المواعيد والحجوزات الحالية.","/dashboard/appointments"],
  ["الأخصائيون","اختيار الأخصائي المناسب.","/nutritionists"],
  ["البرامج الغذائية","استعراض البرامج المنشورة.","/programs"],
  ["المقالات","محتوى غذائي وتثقيفي.","/articles"],
  ["من نحن","التعرف على D-Nutrition-Care.","/about"],
  ["تواصل معنا","طرق التواصل والدعم.","#contact"],
  ["الأسئلة الشائعة","إجابات عن الخدمة والحجز.","#faq"]
];

export default function MorePage() {
  return <SiteChrome><main>
    <section className="moving-strip"><div className="moving-strip-track"><span>الحساب والحجوزات</span><span>الأخصائيون والبرامج</span><span>المقالات والمعلومات المساعدة</span><span>الحساب والحجوزات</span><span>الأخصائيون والبرامج</span><span>المقالات والمعلومات المساعدة</span></div></section><section className="page-hero"><div className="container"><span>المزيد</span><h1>كل ما تحتاجه في مكان واحد</h1><p>روابط الحساب والخدمات والمحتوى والمعلومات المساعدة.</p></div></section>
    <section><div className="container"><div className="more-grid">{links.map(([title,text,href]) => <Link href={href} className="more-card" key={title}><h2>{title}</h2><p>{text}</p><span>فتح الصفحة ←</span></Link>)}</div>
      <div id="faq" className="info-panel"><h2>الأسئلة الشائعة</h2><p>الحجز يتم من خلال اختيار الأخصائي والخدمة والموعد المتاح ثم إكمال خطوات الحجز من حسابك.</p></div>
      <div id="contact" className="info-panel"><h2>تواصل معنا</h2><p>يمكن إضافة قنوات التواصل الفعلية للمنصة هنا عند اعتمادها. لا يتم عرض بيانات اتصال تجريبية.</p></div>
      <div id="policies" className="info-panel"><h2>السياسات</h2><p>تُضاف سياسات الخصوصية وشروط الاستخدام وسياسات الحجز بعد اعتماد نصوصها النهائية.</p></div>
    </div></section>
  </main></SiteChrome>;
}
