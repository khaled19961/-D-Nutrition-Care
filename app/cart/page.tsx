import Link from "next/link";
import { SiteChrome } from "@/components/site-chrome";

export default function CartPage() {
  return <SiteChrome><main>
    <section className="page-hero"><div className="container"><span>السلة</span><h1>سلة الحجوزات والخدمات</h1><p>هذه المساحة مخصصة للعناصر التي يضيفها المستخدم قبل إتمام الحجز أو الدفع.</p></div></section>
    <section><div className="container"><div className="empty-state"><h2>السلة فارغة حالياً</h2><p>لم تتم إضافة أي خدمة أو برنامج إلى السلة.</p><Link href="/nutritionists" className="primary-btn">استعرض الأخصائيين</Link></div></div></section>
  </main></SiteChrome>;
}
