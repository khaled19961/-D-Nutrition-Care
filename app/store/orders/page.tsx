import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteChrome } from "@/components/site-chrome";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const revalidate = 30;

export default async function StoreOrdersPage() {
  const supabase = await createSupabaseServerClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims?.sub) redirect("/auth/login?next=/store/orders");

  const { data: orders, error } = await supabase
    .from("store_orders")
    .select("id,status,payment_status,total,currency,created_at,store_order_items(product_name_ar,unit_price,quantity,line_total)")
    .order("created_at", { ascending: false })
    .limit(50);

  const labels: Record<string,string> = {
    pending: "قيد المراجعة", confirmed: "مؤكد", processing: "قيد التجهيز",
    shipped: "تم الشحن", completed: "مكتمل", cancelled: "ملغي"
  };

  return <SiteChrome><main>
    <section className="page-hero"><div className="container"><span>الطلبات</span><h1>طلباتي</h1><p>تظهر هنا الطلبات المرتبطة بحسابك فقط.</p></div></section>
    <section className="storefront-section"><div className="container">
      {error ? <div className="empty-state"><h2>تعذر تحميل الطلبات</h2><p>حاول تحديث الصفحة مرة أخرى.</p></div> :
      orders?.length ? <div className="orders-list">{orders.map(order => <article className="order-card" key={order.id}>
        <div className="order-card-head"><div><small>رقم الطلب</small><strong>{order.id.slice(0, 8).toUpperCase()}</strong></div><span>{labels[order.status] || order.status}</span></div>
        <div className="order-items">{order.store_order_items?.map((item) => <div key={item.product_name_ar + item.quantity}><span>{item.product_name_ar} × {item.quantity}</span><strong>{Number(item.line_total).toLocaleString("ar-SA")} {order.currency}</strong></div>)}</div>
        <div className="order-total"><span>الإجمالي</span><strong>{Number(order.total).toLocaleString("ar-SA")} {order.currency}</strong></div>
      </article>)}</div> :
      <div className="empty-state"><h2>لا توجد طلبات حتى الآن</h2><p>بعد إتمام طلب من المتجر سيظهر هنا.</p><Link href="/store" className="primary-btn">الذهاب إلى المتجر</Link></div>}
    </div></section>
  </main></SiteChrome>;
}