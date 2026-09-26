import Link from "next/link";
import { SiteChrome } from "@/components/site-chrome";
import { HomeStorefront } from "@/components/home-storefront";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const revalidate = 60;

type Banner = {
  id: string;
  image_url: string;
  alt_ar: string;
  title_ar: string | null;
  subtitle_ar: string | null;
  link_url: string | null;
};

const homeCategories = [
  { name: "مكملات الرياضيين", slug: "supplements", icon: "dumbbell" as const },
  { name: "الجمال والعناية", slug: "beauty", icon: "beauty" as const },
  { name: "التحكم في الوزن", slug: "weight-control", icon: "weight" as const },
  { name: "الصحة والعافية", slug: "health-wellness", icon: "wellness" as const },
  { name: "الأغذية الصحية", slug: "healthy-food", icon: "food" as const },
  { name: "معدات رياضية", slug: "sports-equipment", icon: "sport" as const },
];

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();

  const [{ data: banners }, { data: products }, { data: beautyCategory }] = await Promise.all([
    supabase.from("site_banners").select("id,image_url,alt_ar,title_ar,subtitle_ar,link_url").eq("is_active", true).order("sort_order", { ascending: true }).order("created_at", { ascending: false }),
    supabase.from("store_products").select("id,name_ar,slug,price,compare_at_price,currency,stock_quantity,is_featured,is_new,store_product_images(image_url,alt_ar,sort_order)").eq("is_active", true).gt("stock_quantity", 0).eq("is_featured", true).order("created_at", { ascending: false }).limit(8),
    supabase.from("store_categories").select("id").eq("slug", "beauty").eq("is_active", true).maybeSingle(),
  ]);

  let beautyProducts: any[] = [];
  if (beautyCategory?.id) {
    const { data: categoryLinks } = await supabase.from("store_product_categories").select("product_id").eq("category_id", beautyCategory.id);
    const ids = (categoryLinks ?? []).map((item) => item.product_id);
    if (ids.length) {
      const { data } = await supabase
        .from("store_products")
        .select("id,name_ar,slug,price,compare_at_price,currency,stock_quantity,is_featured,is_new,store_product_images(image_url,alt_ar,sort_order)")
        .eq("is_active", true)
        .gt("stock_quantity", 0)
        .in("id", ids)
        .order("created_at", { ascending: false })
        .limit(8);
      beautyProducts = data ?? [];
    }
  }

  const normalizeProducts = (items: any[]) => items.map((product) => {
    const image = [...(product.store_product_images ?? [])].sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))[0];
    return {
      id: product.id,
      name_ar: product.name_ar,
      slug: product.slug,
      price: Number(product.price),
      compare_at_price: product.compare_at_price == null ? null : Number(product.compare_at_price),
      currency: product.currency || "SAR",
      stock_quantity: product.stock_quantity,
      is_new: Boolean(product.is_new),
      is_featured: Boolean(product.is_featured),
      image_url: image?.image_url ?? null,
      image_alt: image?.alt_ar ?? null,
    };
  });

  const activeBanners = (banners ?? []) as Banner[];
  const firstBanner = activeBanners[0];

  return (
    <SiteChrome>
      <main>
        <section className="hero-storefront" aria-label="البنر الرئيسي">
          <div className="container">
            {firstBanner ? (
              <Link href={firstBanner.link_url || "#"} className="home-main-banner">
                <img src={firstBanner.image_url} alt={firstBanner.alt_ar || firstBanner.title_ar || "البنر الرئيسي"} fetchPriority="high" decoding="async" />
                {(firstBanner.title_ar || firstBanner.subtitle_ar) && (
                  <div className="home-main-banner-caption">
                    {firstBanner.title_ar ? <strong>{firstBanner.title_ar}</strong> : null}
                    {firstBanner.subtitle_ar ? <span>{firstBanner.subtitle_ar}</span> : null}
                  </div>
                )}
              </Link>
            ) : (
              <div className="hero-banner-empty"><div><span>ابدأ رحلتك الصحية</span><h1>منتجات مختارة لصحتك وعافيتك</h1><p>تصفح المنتجات والعروض من مكان واحد.</p></div></div>
            )}
          </div>
        </section>
        <HomeStorefront products={normalizeProducts((products ?? []) as any[])} beautyProducts={normalizeProducts(beautyProducts)} categories={homeCategories} />
      </main>
    </SiteChrome>
  );
}
