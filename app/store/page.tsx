import Link from "next/link";
import { SiteChrome } from "@/components/site-chrome";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type StoreSearchParams = { brand?: string; category?: string; featured?: string; q?: string };
type StoreProduct = {
  id: string;
  name_ar: string;
  slug: string;
  description_ar: string | null;
  price: number;
  compare_at_price: number | null;
  currency: string;
  is_new: boolean;
  store_product_images: Array<{ image_url: string; alt_ar: string | null; sort_order: number | null }>;
};

export default async function StorePage({ searchParams }: { searchParams: Promise<StoreSearchParams> }) {
  const params = await searchParams;
  const queryText = (params.q ?? "").trim().replace(/[%_]/g, "").slice(0, 80);
  const categorySlug = params.category?.trim() ?? "";
  const brandSlug = params.brand?.trim() ?? "";
  const supabase = await createSupabaseServerClient();

  let filterError = false;
  let unresolvedFilter = false;
  let categoryProductIds: string[] | null = null;
  let brandId: string | null = null;

  if (categorySlug) {
    const { data: category, error } = await supabase
      .from("store_categories")
      .select("id")
      .eq("slug", categorySlug)
      .eq("is_active", true)
      .maybeSingle();
    if (error) filterError = true;
    else if (!category) unresolvedFilter = true;
    else {
      const { data: links, error: linksError } = await supabase
        .from("store_product_categories")
        .select("product_id")
        .eq("category_id", category.id);
      if (linksError) filterError = true;
      else categoryProductIds = (links ?? []).map((link) => link.product_id);
    }
  }

  if (brandSlug) {
    const { data: brand, error } = await supabase
      .from("store_brands")
      .select("id")
      .eq("slug", brandSlug)
      .eq("is_active", true)
      .maybeSingle();
    if (error) filterError = true;
    else if (!brand) unresolvedFilter = true;
    else brandId = brand.id;
  }

  let products: StoreProduct[] = [];
  let productError = filterError;
  const categoryHasNoProducts = categorySlug && categoryProductIds?.length === 0;

  if (!filterError && !unresolvedFilter && !categoryHasNoProducts) {
    let productQuery = supabase
      .from("store_products")
      .select("id,name_ar,slug,description_ar,price,compare_at_price,currency,stock_quantity,is_new,is_featured,store_product_images(image_url,alt_ar,sort_order)")
      .eq("is_active", true)
      .gt("stock_quantity", 0);

    if (brandId) productQuery = productQuery.eq("brand_id", brandId);
    if (categoryProductIds) productQuery = productQuery.in("id", categoryProductIds);
    if (params.featured === "true") productQuery = productQuery.eq("is_featured", true);
    if (queryText) productQuery = productQuery.ilike("name_ar", `%${queryText}%`);

    const result = await productQuery
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(24);
    productError = Boolean(result.error);
    products = (result.data ?? []) as StoreProduct[];
  }

  const hasFilters = Boolean(queryText || categorySlug || brandSlug || params.featured === "true");
  const emptyTitle = hasFilters ? "ما لقينا منتجات مطابقة" : "لا توجد منتجات منشورة حالياً";
  const emptyDescription = hasFilters
    ? "جرّب كلمة بحث ثانية أو امسح الفلاتر وشوف المنتجات المتاحة."
    : "ما فيه منتجات منشورة ومتاحة حالياً. تقدر ترجع للمتجر لاحقاً أو تتعرف على الأخصائيين.";

  return (
    <SiteChrome>
      <main>
        <section className="page-hero store-page-hero">
          <div className="container">
            <span>متجر D-Nutrition</span>
            <h1>{queryText ? "نتائج البحث" : "منتجات التغذية والعناية"}</h1>
            <p>{queryText ? `نتائج البحث عن «${queryText}»` : "تصفح المنتجات المنشورة والمتوفرة فعلياً في الكتالوج."}</p>
            <form action="/store" method="get" className="store-search-form">
              <input name="q" defaultValue={queryText} aria-label="ابحث عن منتج" placeholder="ابحث عن منتج بالاسم" />
              <button type="submit">بحث</button>
            </form>
          </div>
        </section>
        <section className="storefront-section">
          <div className="container">
            {productError ? (
              <div className="empty-state"><h2>تعذر تحميل المنتجات</h2><p>حاول تحديث الصفحة مرة ثانية.</p></div>
            ) : products.length ? (
              <div className="product-grid">
                {products.map((product) => {
                  const image = [...(product.store_product_images ?? [])].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))[0];
                  const discount = product.compare_at_price && product.compare_at_price > product.price
                    ? Math.round((1 - product.price / product.compare_at_price) * 100)
                    : null;
                  return (
                    <article className="product-card" key={product.id}>
                      <Link href={`/store/${product.slug}`} className="product-image" aria-label={`عرض ${product.name_ar}`}>
                        {image?.image_url ? <img src={image.image_url} alt={image.alt_ar || product.name_ar} loading="lazy" /> : <span className="product-image-placeholder">الصورة غير متوفرة</span>}
                      </Link>
                      <div className="product-card-body">
                        <div className="product-badges">{product.is_new ? <small>جديد</small> : null}{discount ? <small>خصم {discount}%</small> : null}</div>
                        <h2><Link href={`/store/${product.slug}`}>{product.name_ar}</Link></h2>
                        {product.description_ar ? <p>{product.description_ar}</p> : null}
                        <div className="product-price">
                          <strong>{Number(product.price).toLocaleString("ar-SA")} {product.currency || "SAR"}</strong>
                          {product.compare_at_price && product.compare_at_price > product.price
                            ? <del>{Number(product.compare_at_price).toLocaleString("ar-SA")} {product.currency || "SAR"}</del>
                            : null}
                        </div>
                        <Link href={`/store/${product.slug}`} className="primary-btn">عرض المنتج</Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="store-empty-panel">
                <span className="store-empty-icon" aria-hidden="true">⌕</span>
                <h2>{unresolvedFilter ? "القسم المطلوب غير موجود" : emptyTitle}</h2>
                <p>{unresolvedFilter ? "تأكد من الرابط أو اختر فئة ثانية من أقسام المتجر." : emptyDescription}</p>
                <div className="store-empty-actions">
                  {hasFilters ? <Link href="/store" className="primary-btn">عرض كل المنتجات</Link> : null}
                  <Link href="/nutritionists" className="secondary-btn">تعرّف على الأخصائيين</Link>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </SiteChrome>
  );
}
