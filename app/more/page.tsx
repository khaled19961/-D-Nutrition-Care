import Link from "next/link";
import { SiteChrome } from "@/components/site-chrome";

const links = [
  ["حسابي","إدارة بيانات الحساب والملف الشخصي.","/dashboard"],
  ["حجوزاتي","متابعة المواعيد وحالة كل حجز.","/dashboard/appointments"],
  ["الأخصائيون","استعرض الأخصائيين والخدمات المتاحة.","/nutritionists"],
  ["البرامج الغذائية","استعرض البرامج المنشورة على المنصة.","/programs"],
  ["المقالات","محتوى غذائي وتثقيفي منشور.","/articles"],
  ["من نحن","تعرف على المنصة وطريقة عملها.","/about"],
];

const faqs = [
  ["كيف أحجز استشارة؟","اختر الأخصائي ثم الخدمة والموعد المتاح، وبعدها أكمل الحجز من حسابك."],
  ["هل أستطيع متابعة حجوزاتي؟","نعم، تظهر الحجوزات من حسابك مع حالتها وموعدها."],
  ["هل الخدمات أونلاين؟","المنصة مخصصة للرعاية الغذائية والاستشارات أونلاين. تفاصيل كل خدمة تظهر قبل إتمام الحجز."],
];

export default function MorePage() {
  return (
    <SiteChrome>
      <main>
        <section className="page-hero">
          <div className="container">
            <span>المزيد</span>
            <h1>كل ما تحتاجه في مكان واحد</h1>
            <p>الحساب والحجوزات والأخصائيون والبرامج والمحتوى والمساعدة.</p>
          </div>
        </section>

        <section>
          <div className="container">
            <div className="more-grid">
              {links.map(([title, text, href]) => (
                <Link href={href} className="more-card" key={title}>
                  <h2>{title}</h2>
                  <p>{text}</p>
                  <span>فتح الصفحة ←</span>
                </Link>
              ))}
            </div>

            <div id="location" className="info-panel">
              <span>الخدمة</span>
              <h2>الرعاية الغذائية أونلاين</h2>
              <p>الخدمة متاحة عبر المنصة أونلاين. لا يتم عرض عنوان جغرافي أو موقع فعلي ما لم تتم إضافته واعتماده للمنصة.</p>
            </div>

            <div id="faq" className="info-panel">
              <span>المساعدة</span>
              <h2>الأسئلة الشائعة</h2>
              {faqs.map(([question, answer]) => (
                <div className="faq-item" key={question}>
                  <h3>{question}</h3>
                  <p>{answer}</p>
                </div>
              ))}
            </div>

            <div id="contact" className="info-panel">
              <span>الدعم</span>
              <h2>تواصل معنا</h2>
              <p>قنوات التواصل ستظهر هنا فور اعتماد بيانات التواصل الرسمية للمنصة.</p>
            </div>

            <div id="policies" className="info-panel">
              <span>المعلومات القانونية</span>
              <h2>السياسات</h2>
              <p>تتم إضافة سياسة الخصوصية وشروط الاستخدام وسياسات الحجز بعد اعتماد النصوص القانونية النهائية.</p>
            </div>
          </div>
        </section>
      </main>
    </SiteChrome>
  );
}
