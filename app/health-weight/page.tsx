"use client";

import { useMemo, useState } from "react";
import { SiteChrome } from "@/components/site-chrome";

export default function HealthWeightPage() {
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const bmi = useMemo(() => {
    const w = Number(weight);
    const h = Number(height) / 100;
    if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return null;
    const value = w / (h * h);
    if (value < 10 || value > 80) return null;
    return Math.round(value * 10) / 10;
  }, [weight, height]);
  const range = bmi == null ? null : bmi < 18.5 ? "أقل من النطاق المرجعي" : bmi < 25 ? "ضمن النطاق المرجعي" : bmi < 30 ? "أعلى من النطاق المرجعي" : "أعلى من النطاق المرجعي بشكل أكبر";
  return (
    <SiteChrome>
      <main>
        <section className="page-hero"><div className="container"><span>أداة إرشادية</span><h1>حساب الوزن الصحي</h1><p>أدخل الوزن والطول لحساب مؤشر كتلة الجسم فقط. النتيجة إرشادية وليست تشخيصاً طبياً أو بديلاً عن استشارة مختص.</p></div></section>
        <section className="storefront-section"><div className="container health-weight-layout">
          <form className="health-weight-card" onSubmit={(e)=>e.preventDefault()}>
            <label>الوزن بالكيلوجرام<input type="number" min="1" max="500" step="0.1" value={weight} onChange={(e)=>setWeight(e.target.value)} /></label>
            <label>الطول بالسنتيمتر<input type="number" min="50" max="250" step="0.1" value={height} onChange={(e)=>setHeight(e.target.value)} /></label>
            <button className="primary-btn" type="submit" disabled={bmi === null}>احسب</button>
          </form>
          <div className="health-weight-result" aria-live="polite">
            <span>مؤشر كتلة الجسم</span>
            <strong>{bmi ?? "—"}</strong>
            <p>{range ?? "أدخل قيماً صحيحة ضمن النطاقات الظاهرة."}</p>
            <small>هذا المؤشر أداة إرشادية عامة ولا يمثل تشخيصاً طبياً.</small>
          </div>
        </div></section>
      </main>
    </SiteChrome>
  );
}
