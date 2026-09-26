import Link from "next/link";
import { SiteChrome } from "@/components/site-chrome";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const revalidate = 60;

export default async function StorePage({ searchParams }: { searchParams: Promise<{ brand?: string; category?: string }> }) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  const categoryId = params.category ? (await supabase.from("store_categories").select("id").eq("slug", params.category).eq("is_active", true).maybeSingle()).data?.id : null;
  const brandId = params.brand ? (await supabase.from("store_brands").select("id").eq("slug", params.brand).eq("is_active", true).maybeSingle()).data?.id : null;
  const categoryId = params.category ? (await supabase.from("store_categories").select("id").eq("slug", params.category).eq("is_active", true).maybeSingle()).data?.id : null;
  const categoryProductIds = categoryId ? (await supabase.from("store_product_categories").select("product_id").eq("category_id", categoryId)).data?.map((x) => x.product_id) : null;
  const { data: products, error } = await supabase
    .from("store_products")
    .select("id,name_ar,slug,description_ar,price,compare_at_price,currency,stock_quantity,is_featured,is_new,store_product_images(image_url,alt_ar,sort_order)")
    .eq("is_active", true)
    .gt("stock_quantity", 0)
    .eq(brandId ? "brand_id" : "id", brandId || "00000000-0000-0000-0000-000000000000")\n    .in("id", categoryProductIds ?? ["00000000-0000-0000-0000-000000000000"])
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(24);
  return (
    <SiteChrome>
      <main>
        <section className="page-hero"><div className="container"><span>المتجر</span><h1>منتجات التغذية والعناية</h1><p>تظهر هنا المنتجات المنشورة والمتوفرة فعلياً في الكتالوج.</p></div></section>
        <section className="storefront-section"><div className="container">
          {error ? <div className="empty-state"><h2>تعذر تحميل المنتجات</h2><p>حاول تحديث الصفحة مرة أخرى.</p></div> :
          products?.length ? <div className="product-grid">{products.map((product) => {
            const image = [...(product.store_product_images ?? [])].sort((a,b)=>(a.sort_order ?? 0)-(b.sort_order ?? 0))[0];
            const discount = product.compare_at_price && product.compare_at_price > product.price ? Math.round((1 - product.price / product.compare_at_price) * 100) : null;
            return <article className="product-card" key={product.id}>
              <Link href={`/store/${product.slug}`} className="product-image">{image?.image_url ? <img src={image.image_url} alt={image.alt_ar || product.name_ar} /> : <span>صورة المنتج غير متوفرة</span>}</Link>
              <div className="product-card-body">
                <div className="product-badges">{product.is_new ? <small>جديد</small> : null}{discount ? <small>خصم {discount}%</small> : null}</div>
                <h2><Link href={`/store/${product.slug}`}>{product.name_ar}</Link></h2>
                {product.description_ar ? <p>{product.description_ar}</p> : null}
                <div className="product-price"><strong>{Number(product.price).toLocaleString("ar-SA")} {product.currency}</strong>{product.compare_at_price ? <del>{Number(product.compare_at_price).toLocaleString("ar-SA")} {product.currency}</del> : null}</div>
                <Link href={`/store/${product.slug}`} className="primary-btn">عرض المنتج</Link>
              </div>
            </article>;
          })}</div> :
          <div className="empty-state"><h2>لا توجد منتجات منشورة حالياً</h2><p>لن تظهر منتجات في المتجر قبل اعتمادها وإتاحتها من الإدارة.</p></div>}
        </div></section>
      </main>
    </SiteChrome>
  );
}
