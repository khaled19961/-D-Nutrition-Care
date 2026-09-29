"use client";

import Link from "next/link";
import { useState } from "react";

type Product = {
  id: string;
  name_ar: string;
  slug: string;
  price: number;
  compare_at_price: number | null;
  currency: string;
  stock_quantity: number;
  is_new: boolean;
  is_featured: boolean;
  image_url?: string | null;
  image_alt?: string | null;
};

type Category = {
  name: string;
  slug: string;
  icon: "dumbbell" | "food" | "wellness" | "weight" | "beauty" | "sport";
};

const categoryIcons: Record<Category["icon"], React.ReactNode> = {
  dumbbell: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6M7 7v10M17 7v10M20 9v6M7 12h10" /></svg>,
  food: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4v7M8 4v7M6.5 11v9M18 4c-3 2-4 4-4 7h3v9M17 11h3" /></svg>,
  wellness: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z" /><path d="M12 9v5M9.5 11.5h5" /></svg>,
  weight: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 20h10l-1.2-11a3.8 3.8 0 0 0-7.6 0L7 20Z" /><path d="M9 9h6M12 9v3" /></svg>,
  beauty: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4h8l-1 4H9L8 4ZM10 8v12M14 8v12M7 20h10" /></svg>,
  sport: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4v16M17 4v16M4 7h6M14 7h6M4 17h6M14 17h6" /></svg>,
};

const productSections = [
  { key: "combos", title: "الكومبوهات الأكثر طلباً", href: "/store?category=best-selling-combos" },
  { key: "empower", title: "امباور نيوتريشن", href: "/store?brand=empower-nutrition" },
  { key: "pre-workout", title: "منتجات ما قبل التمرين", href: "/store?category=pre-workout" },
  { key: "vitamins", title: "الفيتامينات", href: "/store?category=vitamins" },
  { key: "proteins", title: "البروتينات", href: "/store?category=proteins" },
  { key: "amino-acids", title: "الأحماض الأمينية", href: "/store?category=amino-acids" },
  { key: "protein-snacks", title: "سناك البروتين", href: "/store?category=protein-snacks" },
  { key: "sports-equipment", title: "المعدات الرياضية", href: "/store?category=sports-equipment" },
] as const;

export function HomeStorefront({
  products,
  beautyProducts,
  categories,
  productSections: sectionProducts,
}: {
  products: Product[];
  beautyProducts: Product[];
  categories: Category[];
  productSections: Record<string, Product[]>;
}) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [added, setAdded] = useState<string | null>(null);

  function toggleFavorite(productId: string) {
    setFavorites((current) => current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId]);
  }

  function addToCart(product: Product) {
    try {
      const raw = localStorage.getItem("dnc-cart");
      const parsed = raw ? JSON.parse(raw) : [];
      const cart = Array.isArray(parsed) ? parsed : [];
      const existing = cart.find((item) => item?.productId === product.id);
      if (existing) existing.quantity = Number(existing.quantity || 0) + 1;
      else cart.push({
        productId: product.id,
        slug: product.slug,
        name: product.name_ar,
        price: Number(product.price),
        currency: product.currency || "SAR",
        imageUrl: product.image_url || undefined,
        quantity: 1,
      });
      localStorage.setItem("dnc-cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("dnc-cart-updated"));
      setAdded(product.id);
      window.setTimeout(() => setAdded(null), 1400);
    } catch {
      setAdded(null);
    }
  }

  function ProductCard({ product }: { product: Product }) {
    const discount = product.compare_at_price && product.compare_at_price > product.price
      ? Math.round((1 - Number(product.price) / Number(product.compare_at_price)) * 100)
      : null;
    const isFavorite = favorites.includes(product.id);

    return (
      <article className="home-product-card">
        <div className="home-product-media">
          <Link href={`/store/${product.slug}`} className="home-product-image" aria-label={`عرض ${product.name_ar}`}>
            {product.image_url ? (
              <img src={product.image_url} alt={product.image_alt || product.name_ar} loading="lazy" decoding="async" />
            ) : (
              <span className="home-product-placeholder" aria-label="الصورة غير متوفرة">
                <svg viewBox="0 0 48 48" aria-hidden="true"><rect x="11" y="8" width="26" height="32" rx="5" /><path d="M17 17h14M17 24h14M17 31h8" /></svg>
                <small>الصورة غير متوفرة</small>
              </span>
            )}
          </Link>
          <div className="home-product-badges">
            {discount ? <span className="discount-badge">خصم {discount}%</span> : null}
            {product.is_new ? <span className="shipping-badge">وصل حديثاً</span> : null}
          </div>
          <button type="button" className={`home-favorite ${isFavorite ? "is-favorite" : ""}`} aria-label={isFavorite ? "إزالة من المفضلة" : "إضافة إلى المفضلة"} onClick={() => toggleFavorite(product.id)}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 8.8c0 5.5-8.8 10.3-8.8 10.3S3.2 14.3 3.2 8.8A4.7 4.7 0 0 1 12 6.1a4.7 4.7 0 0 1 8.8 2.7Z" /></svg>
          </button>
        </div>
        <div className="home-product-body">
          <Link href={`/store/${product.slug}`} className="home-product-name">{product.name_ar}</Link>
          <div className="home-product-price">
            <strong>{Number(product.price).toLocaleString("ar-SA")} {product.currency || "SAR"}</strong>
            {product.compare_at_price && product.compare_at_price > product.price
              ? <del>{Number(product.compare_at_price).toLocaleString("ar-SA")} {product.currency || "SAR"}</del>
              : null}
          </div>
          <button type="button" className="home-add-cart" onClick={() => addToCart(product)}>
            <span>{added === product.id ? "تمت الإضافة" : "أضف إلى السلة"}</span>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2l2.2 10.5h10.6L21 7H7" /><circle cx="10" cy="19" r="1.5" /><circle cx="18" cy="19" r="1.5" /></svg>
          </button>
        </div>
      </article>
    );
  }

  function ProductRail({ items }: { items: Product[] }) {
    if (!items.length) return null;
    return <div className="home-product-rail">{items.map((product) => <ProductCard key={product.id} product={product} />)}</div>;
  }

  const populatedSections = productSections
    .map((section) => ({ ...section, items: sectionProducts[section.key] ?? [] }))
    .filter((section) => section.items.length > 0);
  const hasCatalogProducts = products.length > 0 || beautyProducts.length > 0 || populatedSections.length > 0;

  return (
    <>
      {categories.length ? (
        <section className="home-category-icons" aria-label="تسوق حسب الفئة">
          <div className="container">
            <div className="home-category-rail">
              {categories.map((category) => (
                <Link href={`/store?category=${encodeURIComponent(category.slug)}`} className="home-category-item" key={category.slug}>
                  <span className="home-category-icon">{categoryIcons[category.icon]}</span>
                  <strong>{category.name}</strong>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="home-guidance-section">
        <div className="container">
          <div className="home-guidance-panel">
            <div className="home-guidance-copy">
              <span>ابدأ من احتياجك</span>
              <h2>رعاية غذائية أقرب لأسلوب حياتك</h2>
              <p>تعرّف على أخصائيي التغذية، أو استكشف خيارات المتجر من D-Nutrition Care.</p>
              <div className="home-guidance-actions">
                <Link href="/nutritionists" className="primary-btn">تعرّف على الأخصائيين</Link>
                <Link href="/store" className="secondary-btn">تصفح المتجر</Link>
              </div>
            </div>
            <div className="home-guidance-art" aria-hidden="true">
              <span className="home-guidance-orbit home-guidance-orbit-one" />
              <span className="home-guidance-orbit home-guidance-orbit-two" />
              <span className="home-guidance-mark">D</span>
              <span className="home-guidance-leaf">✦</span>
            </div>
          </div>
        </div>
      </section>

      {products.length > 0 ? (
        <section className="home-store-section">
          <div className="container">
            <div className="home-store-heading"><h2>منتجات مميزة</h2><Link href="/store">عرض الكل ←</Link></div>
            <ProductRail items={products} />
          </div>
        </section>
      ) : null}

      {beautyProducts.length > 0 ? (
        <section className="home-store-section home-beauty-section">
          <div className="container">
            <div className="home-store-heading"><h2>الجمال والعناية</h2><Link href="/store?category=beauty">عرض الكل ←</Link></div>
            <ProductRail items={beautyProducts} />
          </div>
        </section>
      ) : null}

      {populatedSections.map((section) => (
        <section className="home-store-section home-requested-section" key={section.key}>
          <div className="container">
            <div className="home-store-heading"><h2>{section.title}</h2><Link href={section.href}>عرض الكل ←</Link></div>
            <ProductRail items={section.items} />
          </div>
        </section>
      ))}

      {!hasCatalogProducts ? (
        <section className="home-empty-catalog">
          <div className="container home-empty-catalog-inner">
            <div>
              <span>المتجر</span>
              <h2>نجهّز لك خيارات مفيدة</h2>
              <p>ما فيه منتجات منشورة حالياً. تقدر تتعرف على الأخصائيين أو ترجع للمتجر لاحقاً.</p>
            </div>
            <div className="home-empty-actions">
              <Link href="/nutritionists" className="primary-btn">تعرّف على الأخصائيين</Link>
              <Link href="/store" className="secondary-btn">زيارة المتجر</Link>
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
