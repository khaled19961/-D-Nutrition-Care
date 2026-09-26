import { SiteChrome } from "@/components/site-chrome";
import { CatalogEmpty } from "@/components/catalog-empty";

export default function StorePage() {
  return (
    <SiteChrome>
      <CatalogEmpty
        eyebrow="المتجر"
        title="المتجر"
        description="كتالوج المنتجات سيعرض المنتجات والأسعار والتوفر المسجل في النظام نفسه، مع منع إضافة المنتجات غير المتوفرة إلى السلة."
      />
    </SiteChrome>
  );
}
