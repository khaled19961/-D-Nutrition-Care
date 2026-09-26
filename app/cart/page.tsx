"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SiteChrome } from "@/components/site-chrome";

type CartItem = { productId: string; slug: string; name: string; price: number; currency: string; imageUrl?: string; quantity: number };

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  function load() {
    try { setItems(JSON.parse(localStorage.getItem("dnc-cart") || "[]")); } catch { setItems([]); }
    setReady(true);
  }
  useEffect(() => {
    load();
    window.addEventListener("dnc-cart-updated", load);
    return () => window.removeEventListener("dnc-cart-updated", load);
  }, []);

  const total = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);
  function update(id: string, quantity: number) {
    const next = items.map(x => x.productId === id ? { ...x, quantity: Math.max(1, quantity) } : x);
    setItems(next); localStorage.setItem("dnc-cart", JSON.stringify(next));
  }
  function remove(id: string) {
    const next = items.filter(x => x.productId !== id);
    setItems(next); localStorage.setItem("dnc-cart", JSON.stringify(next));
  }

  return <SiteChrome><main>
    <section className="page-hero"><div className="container"><span>السلة</span><h1>سلة المشتريات</h1><p>راجع المنتجات والكميات قبل إتمام الطلب.</p></div></section>
    <section className="storefront-section"><div className="container cart-layout">
      {!ready ? null : items.length ? <>
        <div className="cart-list">{items.map(item => <article className="cart-row" key={item.productId}>
          {item.imageUrl ? <img src={item.imageUrl} alt="" /> : <div className="cart-image-empty">—</div>}
          <div><h2><Link href={`/store/${item.slug}`}>{item.name}</Link></h2><strong>{item.price.toLocaleString("ar-SA")} {item.currency}</strong></div>
          <div className="cart-quantity"><button onClick={() => update(item.productId, item.quantity - 1)} disabled={item.quantity <= 1}>−</button><span>{item.quantity}</span><button onClick={() => update(item.productId, item.quantity + 1)}>+</button></div>
          <button className="cart-remove" onClick={() => remove(item.productId)}>إزالة</button>
        </article>)}</div>
        <aside className="cart-summary"><span>الإجمالي</span><strong>{total.toLocaleString("ar-SA")} {items[0]?.currency || "SAR"}</strong><Link href="/store/checkout" className="primary-btn">متابعة لإتمام الطلب</Link><small>سيتم التحقق من السعر والمخزون عند إنشاء الطلب.</small></aside>
      </> : <div className="empty-state"><h2>السلة فارغة حالياً</h2><p>أضف منتجاً متاحاً من المتجر ليظهر هنا.</p><Link href="/store" className="primary-btn">تصفح المتجر</Link></div>}
    </div></section>
  </main></SiteChrome>;
}
