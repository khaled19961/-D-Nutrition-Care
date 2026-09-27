import { SiteChrome } from "@/components/site-chrome";
import HealthWeightCalculator from "@/components/health-weight-calculator";

export default function HealthWeightPage() {
  return (
    <SiteChrome>
      <main>
        <section className="page-hero"><div className="container"><span>أداة إرشادية</span><h1>حساب الوزن الصحي</h1><p>أدخل الوزن والطول لحساب مؤشر كتلة الجسم فقط. النتيجة إرشادية وليست تشخيصاً طبياً أو بديلاً عن استشارة مختص.</p></div></section>
        <section className="storefront-section"><HealthWeightCalculator /></section>
      </main>
    </SiteChrome>
  );
}
