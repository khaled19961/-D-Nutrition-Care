"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SiteChrome } from "@/components/site-chrome";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type CartItem = { productId: string; slug: string; name: string; price: number; currency: string; imageUrl?: string; quantity: number };
type Customer = {
  name: string;
  phone: string;
  email: string;
  addressLine1: string;
  district: string;
  city: string;
  postalCode: string;
  deliveryNotes: string;
};

const emptyCustomer: Customer = {
  name: "", phone: "", email: "", addressLine1: "", district: "", city: "", postalCode: "", deliveryNotes: ""
};

export default function CheckoutPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [items, setItems] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState<Customer>(emptyCustomer);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    try { setItems(JSON.parse(localStorage.getItem("dnc-cart") || "[]")); } catch { setItems([]); }
    void loadUser();
    setLoading(false);
  }, []);

  async function loadUser() {
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      setCustomer(prev => ({ ...prev, email: data.user.email || "" }));
    }
  }

  function update(field: keyof Customer, value: string) {
    setCustomer(prev => ({ ...prev, [field]: value }));
  }

  async function submit() {
    if (!items.length || submitting) return;
    setSubmitting(true);
    setMessage("");

    const { data: claims } = await supabase.auth.getClaims();
    if (!claims?.claims?.sub) {
      router.push("/auth/login?next=/store/checkout");
      return;
    }

    const { data: orderId, error } = await supabase.rpc("create_store_order", {
      p_items: items.map(item => ({ productId: item.productId, quantity: item.quantity })),
      p_customer: {
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        addressLine1: customer.addressLine1,
        district: customer.district,
        city: customer.city,
        postalCode: customer.postalCode,
        deliveryNotes: customer.deliveryNotes
      }
    });

    if (error) {
      const errors: Record<string,string> = {
        insufficient_stock: "الكمية المطلوبة غير متوفرة في المخزون.",
        product_unavailable: "أحد المنتجات لم يعد متاحاً.",
        invalid_cart_item: "بيانات السلة غير صالحة.",
        invalid_quantity: "إحدى الكميات غير صالحة.",
        customer_name_required: "اكتب اسم المستلم.",
        customer_phone_required: "اكتب رقم الجوال.",
        address_required: "اكتب عنوان التوصيل.",
        city_required: "اكتب المدينة."
      };
      setMessage(errors[error.message] || "تعذر إنشاء الطلب. حاول مرة أخرى.");
      setSubmitting(false);
      return;
    }

    localStorage.removeItem("dnc-cart");
    window.dispatchEvent(new Event("dnc-cart-updated"));
    router.push(`/store/orders/${orderId}?created=1`);
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal - (subtotal / 1.15);

  return <SiteChrome><main>
    <section className="page-hero"><div className="container"><span>إتمام الطلب</span><h1>مراجعة وإتمام الطلب</h1><p>يتم التحقق من الأسعار والمخزون من قاعدة البيانات عند إنشاء الطلب.</p></div></section>
    <section className="storefront-section"><div className="container checkout-layout">
      {loading ? null : !items.length ? <div className="empty-state"><h2>لا توجد منتجات لإتمام الطلب</h2><Link href="/store" className="primary-btn">العودة إلى المتجر</Link></div> : <>
        <div className="checkout-main">
          <div className="checkout-card">
            <h2>بيانات المستلم والتوصيل</h2>
            <div className="checkout-form-grid">
              <label>اسم المستلم<input value={customer.name} onChange={e => update("name", e.target.value)} autoComplete="name" /></label>
              <label>رقم الجوال<input value={customer.phone} onChange={e => update("phone", e.target.value)} autoComplete="tel" inputMode="tel" /></label>
              <label>البريد الإلكتروني<input value={customer.email} readOnly autoComplete="email" /></label>
              <label>المدينة<input value={customer.city} onChange={e => update("city", e.target.value)} autoComplete="address-level2" /></label>
              <label>الحي<input value={customer.district} onChange={e => update("district", e.target.value)} autoComplete="address-level3" /></label>
              <label>الرمز البريدي<input value={customer.postalCode} onChange={e => update("postalCode", e.target.value)} autoComplete="postal-code" inputMode="numeric" /></label>
              <label className="checkout-full">عنوان التوصيل<input value={customer.addressLine1} onChange={e => update("addressLine1", e.target.value)} autoComplete="street-address" /></label>
              <label className="checkout-full">ملاحظات التوصيل<textarea value={customer.deliveryNotes} onChange={e => update("deliveryNotes", e.target.value)} rows={3} /></label>
            </div>
          </div>

          <div className="checkout-card">
            <h2>المنتجات</h2>
            <div className="checkout-items">{items.map(item => <div className="checkout-row" key={item.productId}><span>{item.name} × {item.quantity}</span><strong>{(item.price * item.quantity).toLocaleString("ar-SA")} {item.currency}</strong></div>)}</div>
          </div>
        </div>

        <aside className="cart-summary">
          <span>ملخص الطلب</span>
          <div className="summary-line"><span>الإجمالي الفرعي</span><strong>{subtotal.toLocaleString("ar-SA")} SAR</strong></div>
          <div className="summary-line"><span>ضريبة القيمة المضافة 15% <small>(مضمنة في الأسعار)</small></span><strong>{tax.toLocaleString("ar-SA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SAR</strong></div>
          <div className="summary-line"><span>الشحن</span><strong>يحدد لاحقاً</strong></div>
          <div className="summary-total"><span>الإجمالي</span><strong>{subtotal.toLocaleString("ar-SA")} SAR</strong></div>
          {message ? <div className="form-message error">{message}</div> : null}
          <button className="primary-btn" onClick={submit} disabled={submitting}>{submitting ? "جاري إنشاء الطلب..." : "تأكيد الطلب"}</button>
          <small>سيتم إنشاء الطلب بحالة دفع معلقة. ربط بوابة الدفع سيتم في المرحلة التالية.</small>
        </aside>
      </>}
    </div></section>
  </main></SiteChrome>;
}
