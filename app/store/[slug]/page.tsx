import { notFound } from "next/navigation";
import Link from "next/link";
import { SiteChrome } from "@/components/site-chrome";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { StoreCartButton } from "@/components/store-cart-button";

export const revalidate = 60;

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: product, error } = await supabase
    .from("store_products")
    .select("id,name_ar,slug,description_ar,price,compare_at_price,currency,stock_quantity,brand_id,store_product_images(id,image_url,alt_ar,sort_order)")
    .eq("slug", slug)
    .eq("is_active", true)
    .gt("stock_quantity", 0)
    .maybeSingle();

  if (error || !product) notFound();

  const brand = product.brand_id
    ? (await supabase.from("store_brands").select("name_ar,slug").eq("id", product.brand_id).eq("is_active", true).maybeSingle()).data
    : null;
  const images = [...(product.store_product_images ?? [])].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
  );
  const discount = product.compare_at_price && product.compare_at_price > product.price
    ? Math.round((1 - product.price / product.compare_at_price) * 100)
    : null;

  return (
    <SiteChrome>
      <main>
        <section className="storefront-section">
          <div className="container product-detail">
            <div>
              {images.length ? (
                <div className="product-gallery">
                  {images.map((image) => (
                    <img key={image.id} src={image.image_url} alt={image.alt_ar || product.name_ar} />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <h2>صور المنتج غير متوفرة</h2>
                  <p>لم تتم إضافة صور حقيقية لهذا المنتج بعد.</p>
                </div>
              )}
            </div>
            <article className="product-detail-info">
              {brand ? <Link href={`/store?brand=${brand.slug}`}>{brand.name_ar}</Link> : <span>المتجر</span>}
              <h1>{product.name_ar}</h1>
              {product.description_ar ? <p>{product.description_ar}</p> : null}
              <div className="product-price">
                <strong>{Number(product.price).toLocaleString("ar-SA")} {product.currency}</strong>
                {product.compare_at_price ? <del>{Number(product.compare_at_price).toLocaleString("ar-SA")} {product.currency}</del> : null}
              </div>
              {discount ? <small>خصم {discount}%</small> : null}
              <p>متوفر حالياً: {product.stock_quantity} قطعة</p>
              <StoreCartButton item={{
                productId: product.id,
                slug: product.slug,
                name: product.name_ar,
                price: Number(product.price),
                currency: product.currency,
                imageUrl: images[0]?.image_url
              }} />
            </article>
          </div>
        </section>
      </main>
    </SiteChrome>
  );
}
