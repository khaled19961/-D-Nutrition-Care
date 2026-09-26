"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SiteChrome } from "@/components/site-chrome";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type CartItem = { productId: string; slug: string; name: string; price: number; currency: string; imageUrl?: string; quantity: number };

export default function CheckoutPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    try { setItems(JSON.parse(localStorage.getItem("dnc-cart") || "[]")); } catch { setItems([]); }
    setLoading(false);
  }, []);

  async function submit() {
    if (!items.length || submitting) return;
    setSubmitting(true); setMessage("");
    const { data: claims } = await supabase.auth.getClaims();
    if (!claims?.claims?.sub) {
      router.push("/auth/login?next=/store/checkout");
      return;
    }
    const { data: orderId, error } = await supabase.rpc("create_store_order", {
      p_items: items.map(item => ({ productId: item.productId, quantity: item.quantity }))
    });
    if (error) {
      const errors: Record<string,string> = {
        insufficient_stock: "الكمية المطلوبة غير متوفرة في المخزون.",
        product_unavailable: "أحد المنتجات لم يعد متاحاً.",
        invalid_cart_item: "بيانات السلة غير صالحة.",
        invalid_quantity: "إحدى الكميات غير صالحة."
      };
      setMessage(errors[error.message] || "تعذر إنشاء الطلب. حاول مرة أخرى.");
      setSubmitting(false);
      return;
    }
    localStorage.removeItem("dnc-cart");
    window.dispatchEvent(new Event("dnc-cart-updated"));
    router.push(`/store/orders?created=${orderId}`);
  }

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return <SiteChrome><main>
    <section className="page-hero"><div className="container"><span>إتمام الطلب</span><h1>مراجعة الطلب</h1><p>سيتم التحقق من الأسعار والمخزون من قاعدة البيانات عند إنشاء الطلب.</p></div></section>
    <section className="storefront-section"><div className="container checkout-layout">
      {loading ? null : !items.length ? <div className="empty-state"><h2>لا توجد منتجات لإتمام الطلب</h2><Link href="/store" className="primary-btn">العودة إلى المتجر</Link></div> : <>
        <div className="checkout-items">{items.map(item => <div className="checkout-row" key={item.productId}><span>{item.name} × {item.quantity}</span><strong>{(item.price * item.quantity).toLocaleString("ar-SA")} {item.currency}</strong></div>)}</div>
        <aside className="cart-summary"><span>الإجمالي الحالي</span><strong>{total.toLocaleString("ar-SA")} {items[0]?.currency || "SAR"}</strong>{message ? <div className="form-message error">{message}</div> : null}<button className="primary-btn" onClick={submit} disabled={submitting}>{submitting ? "جاري إنشاء الطلب..." : "تأكيد إنشاء الطلب"}</button><small>الدفع الإلكتروني لم يتم ربطه بعد؛ إنشاء الطلب هنا يسجل الطلب بحالة دفع معلقة.</small></aside>
      </>}
    </div></section>
  </main></SiteChrome>;
}