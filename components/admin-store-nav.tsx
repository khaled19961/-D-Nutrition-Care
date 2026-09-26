import Link from "next/link";

const items = [
  ["/admin/store/categories","الفئات"],
  ["/admin/store/brands","العلامات التجارية"],
  ["/admin/store/products","المنتجات"],
  ["/admin/store/bundles","الباقات"],
  ["/admin/store/branches","الفروع"],
  ["/admin/store/orders","الطلبات"],
] as const;

export function AdminStoreNav(){
  return <nav className="section-nav"><div className="container section-nav-inner">{items.map(([href,label])=><Link href={href} key={href}>{label}</Link>)}</div></nav>;
}