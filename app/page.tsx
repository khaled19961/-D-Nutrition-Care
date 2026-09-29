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

function safeBannerHref(value: string | null) {
  const href = value?.trim();
  if (!href || href.startsWith("#")) return null;
  if (href.startsWith("/") && !href.startsWith("//")) return href;

  try {
    const parsed = new URL(href);
    return parsed.protocol === "https:" ? parsed.toString() : null;
  } catch {
    return null;
  }
}

function HomeBanner({ banner, className, loading }: { banner: Banner; className: string; loading: "eager" | "lazy" }) {
  const content = (
    <>
      <img src={banner.image_url} alt={banner.alt_ar || banner.title_ar || "عرض"} loading={loading} decoding="async" />
      {(banner.title_ar || banner.subtitle_ar) ? (
        <div className="home-main-banner-caption">
          {banner.title_ar ? <strong>{banner.title_ar}</strong> : null}
          {banner.subtitle_ar ? <span>{banner.subtitle_ar}</span> : null}
        </div>
      ) : null}
    </>
  );
  const href = safeBannerHref(banner.link_url);

  return href ? <Link href={href} className={className}>{content}</Link> : <div className={className}>{content}</div>;
}

function categoryIconFor(name: string, slug: string): "dumbbell" | "food" | "wellness" | "weight" | "beauty" | "sport" {
  const value = `${name} ${slug}`.toLowerCase();
  if (/beauty|جمال|عناية/.test(value)) return "beauty";
  if (/weight|وزن/.test(value)) return "weight";
  if (/food|meal|غذاء|طعام/.test(value)) return "food";
  if (/sport|gym|equipment|رياضة|معدات/.test(value)) return "sport";
  if (/supplement|protein|مكمل|بروتين/.test(value)) return "dumbbell";
  return "wellness";
}

const homeProductSections: Array<{ key: string; title: string; categorySlug?: string; brandSlug?: string }> = [
  { key: "combos", title: "الكومبوهات الأكثر طلباً", categorySlug: "best-selling-combos" },
  { key: "empower", title: "امباور نيوتريشن", brandSlug: "empower-nutrition" },
  { key: "pre-workout", title: "منتجات ما قبل التمرين", categorySlug: "pre-workout" },
  { key: "vitamins", title: "الفيتامينات", categorySlug: "vitamins" },
  { key: "proteins", title: "البروتينات", categorySlug: "proteins" },
  { key: "amino-acids", title: "الأحماض الأمينية", categorySlug: "amino-acids" },
  { key: "protein-snacks", title: "سناك البروتين", categorySlug: "protein-snacks" },
  { key: "sports-equipment", title: "المعدات الرياضية", categorySlug: "sports-equipment" },
];

const heroLinks = [
  { href: "/nutritionists", eyebrow: "الرعاية الغذائية", title: "تعرّف على الأخصائيين", icon: "✦" },
  { href: "/booking", eyebrow: "خطوتك القادمة", title: "استكشف الحجز", icon: "↗" },
];

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();

  const [{ data: banners }, { data: allProducts }, { data: categories }, { data: brands }] = await Promise.all([
    supabase.from("site_banners").select("id,image_url,alt_ar,title_ar,subtitle_ar,link_url").eq("is_active", true).order("sort_order", { ascending: true }).order("created_at", { ascending: false }),
    supabase
      .from("store_products")
      .select("id,name_ar,slug,price,compare_at_price,currency,stock_quantity,is_featured,is_new,brand_id,store_product_images(image_url,alt_ar,sort_order),store_product_categories(category_id)")
      .eq("is_active", true)
      .gt("stock_quantity", 0)
      .order("created_at", { ascending: false })
      .limit(100),
    supabase.from("store_categories").select("id,name_ar,slug").eq("is_active", true),
    supabase.from("store_brands").select("id,name_ar,slug").eq("is_active", true),
  ]);

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

  const rawProducts = (allProducts ?? []) as any[];
  const normalizedAll = normalizeProducts(rawProducts);
  const categoryIdBySlug = new Map((categories ?? []).map((item) => [item.slug, item.id]));
  const brandIdBySlug = new Map((brands ?? []).map((item) => [item.slug, item.id]));
  const displayCategories = (categories ?? []).slice(0, 6).map((category) => ({
    name: category.name_ar,
    slug: category.slug,
    icon: categoryIconFor(category.name_ar, category.slug),
  }));

  const productsByCategory = (slug: string) => {
    const categoryId = categoryIdBySlug.get(slug);
    if (!categoryId) return [];
    return normalizeProducts(rawProducts.filter((product) =>
      (product.store_product_categories ?? []).some((link: any) => link.category_id === categoryId)
    ).slice(0, 8));
  };

  const productsByBrand = (slug: string) => {
    const brandId = brandIdBySlug.get(slug);
    if (!brandId) return [];
    return normalizeProducts(rawProducts.filter((product) => product.brand_id === brandId).slice(0, 8));
  };

  const featuredProducts = normalizedAll.filter((product) => product.is_featured).slice(0, 8);
  const sectionProducts = Object.fromEntries(homeProductSections.map((section) => [
    section.key,
    section.brandSlug ? productsByBrand(section.brandSlug) : productsByCategory(section.categorySlug!),
  ]));

  const activeBanners = ((banners ?? []) as Banner[]).filter((banner) => Boolean(banner.image_url?.trim()));
  const sideBanners = activeBanners.slice(1, 3);
  const additionalBanners = activeBanners.slice(3, 10);

  return (
    <SiteChrome>
      <main>
        <section className="hero-storefront" aria-label="الواجهة الرئيسية">
          <div className="container">
            {activeBanners.length ? (
              <>
                <div className="home-hero-layout">
                  <div className="home-hero-side">
                    {sideBanners.map((banner) => (
                      <HomeBanner key={banner.id} banner={banner} className="home-hero-side-banner" loading="lazy" />
                    ))}
                    {heroLinks.slice(0, Math.max(0, 2 - sideBanners.length)).map((item) => (
                      <Link href={item.href} className="home-hero-side-cta" key={item.href}>
                        <span>{item.icon}</span>
                        <small>{item.eyebrow}</small>
                        <strong>{item.title}</strong>
                      </Link>
                    ))}
                  </div>
                  <div className="home-hero-main">
                    <HomeBanner banner={activeBanners[0]} className="home-hero-main-banner" loading="eager" />
                  </div>
                </div>
                {additionalBanners.length ? (
                  <div className="home-extra-banner-rail" aria-label="عروض إضافية">
                    {additionalBanners.map((banner) => <HomeBanner key={banner.id} banner={banner} className="home-extra-banner" loading="lazy" />)}
                  </div>
                ) : null}
              </>
            ) : (
              <div className="hero-banner-empty">
                <div className="hero-banner-copy">
                  <span>مرحباً بك في D-Nutrition Care</span>
                  <h1>رعاية غذائية أقرب لأسلوب حياتك</h1>
                  <p>اكتشف خدمات أخصائيي التغذية، واستكشف المتجر بخيارات تناسب احتياجك.</p>
                  <div className="hero-banner-actions">
                    <Link href="/nutritionists" className="primary-btn large">تعرّف على الأخصائيين</Link>
                    <Link href="/store" className="secondary-btn large">تصفح المتجر</Link>
                  </div>
                </div>
                <div className="hero-banner-art" aria-hidden="true">
                  <span className="hero-banner-orbit hero-banner-orbit-one" />
                  <span className="hero-banner-orbit hero-banner-orbit-two" />
                  <span className="hero-banner-brand-mark">D</span>
                  <span className="hero-banner-star">✦</span>
                </div>
              </div>
            )}
          </div>
        </section>

        <HomeStorefront
          products={featuredProducts}
          beautyProducts={productsByCategory("beauty").filter((product) => !product.is_featured)}
          categories={displayCategories}
          productSections={sectionProducts}
        />
      </main>
    </SiteChrome>
  );
}
