import { notFound } from "next/navigation";
import { SiteChrome } from "@/components/site-chrome";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const revalidate = 60;

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: product, error } = await supabase
    .from("store_products")
    .select("id,name_ar,slug,description_ar,price,compare_at_price,currency,stock_quantity,store_product_images(image_url,alt_ar,sort_order)")
    .eq("slug", slug)
    .eq("is_active", true)
    .gt("stock_quantity", 0)
    .maybeSingle();

  if (error || !product) notFound();

  const images = [...(product.store_product_images ?? [])].sort((a,b)=>(a.sort_order ?? 0)-(b.sort_order ?? 0));
  return <SiteChrome><main><section className="storefront-section"><div className="container product-detail">
    <div className="product-gallery">{images.length ? images.map((image) => <img key={image.image_url} src={image.image_url} alt={image.alt_ar || product.name_ar} />) : <div className="empty-state">صورة المنتج غير متوفرة</div>}</div>
    <div className="product-detail-info"><span>متوفر حالياً</span><h1>{product.name_ar}</h1>{product.description_ar ? <p>{product.description_ar}</p> : null}<div className="product-price"><strong>{Number(product.price).toLocaleString("ar-SA")} {product.currency}</strong>{product.compare_at_price ? <del>{Number(product.compare_at_price).toLocaleString("ar-SA")} {product.currency}</del> : null}</div><button className="primary-btn" disabled>أضف إلى السلة</button><small>سيتم تفعيل الشراء بعد ربط السلة بخدمة الطلب والدفع المعتمدة.</small></div>
  </div></section></main></SiteChrome>;
}
