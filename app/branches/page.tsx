import { SiteChrome } from "@/components/site-chrome";
import { CatalogEmpty } from "@/components/catalog-empty";

export default function BranchesPage() {
  return <SiteChrome><CatalogEmpty eyebrow="الفروع" title="فروعنا" description="تعرض الصفحة الفروع المسجلة والمعتمدة فقط مع بيانات العنوان وساعات العمل والإحداثيات عند توفرها." /></SiteChrome>;
}
