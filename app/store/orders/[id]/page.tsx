import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { SiteChrome } from "@/components/site-chrome";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function StoreOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims?.sub) redirect(`/auth/login?next=/store/orders/${id}`);

  const { data: order, error } = await supabase
    .from("store_orders")
    .select("id,status,payment_status,currency,subtotal,shipping_fee,discount_amount,tax_rate,tax_amount,total,customer_name,customer_phone,customer_email,address_line1,district,city,postal_code,delivery_notes,created_at,store_order_items(product_name_ar,unit_price,quantity,line_total)")
    .eq("id", id)
    .maybeSingle();

  if (error || !order) notFound();

  const labels: Record<string,string> = { pending: "قيد المراجعة", confirmed: "مؤكد", processing: "قيد التجهيز", shipped: "تم الشحن", completed: "مكتمل", cancelled: "ملغي" };

  return <SiteChrome><main>
    <section className="page-hero"><div className="container"><span>تفاصيل الطلب</span><h1>طلب #{order.id.slice(0, 8).toUpperCase()}</h1><p>{labels[order.status] || order.status}</p></div></section>
    <section className="storefront-section"><div className="container checkout-layout">
      <div className="checkout-main">
        <div className="checkout-card"><h2>المنتجات</h2>{order.store_order_items?.map((item) => <div className="checkout-row" key={item.product_name_ar + item.quantity}><span>{item.product_name_ar} × {item.quantity}</span><strong>{Number(item.line_total).toLocaleString("ar-SA")} {order.currency}</strong></div>)}</div>
        <div className="checkout-card"><h2>بيانات التوصيل</h2><p><strong>{order.customer_name}</strong></p><p>{order.customer_phone} · {order.customer_email || ""}</p><p>{order.address_line1}{order.district ? `، ${order.district}` : ""}، {order.city}{order.postal_code ? `، ${order.postal_code}` : ""}</p>{order.delivery_notes ? <p>{order.delivery_notes}</p> : null}</div>
      </div>
      <aside className="cart-summary"><span>ملخص الطلب</span><div className="summary-line"><span>الإجمالي الفرعي</span><strong>{Number(order.subtotal).toLocaleString("ar-SA")} {order.currency}</strong></div><div className="summary-line"><span>الضريبة ({Number(order.tax_rate)}%)</span><strong>{Number(order.tax_amount).toLocaleString("ar-SA", {minimumFractionDigits:2,maximumFractionDigits:2})} {order.currency}</strong></div><div className="summary-line"><span>الشحن</span><strong>{Number(order.shipping_fee).toLocaleString("ar-SA")} {order.currency}</strong></div><div className="summary-total"><span>الإجمالي</span><strong>{Number(order.total).toLocaleString("ar-SA")} {order.currency}</strong></div><p>{order.payment_status === "paid" ? "تم الدفع" : "الدفع معلق"}</p><Link href="/store/orders" className="primary-btn">العودة إلى الطلبات</Link></aside>
    </div></section>
  </main></SiteChrome>;
}
