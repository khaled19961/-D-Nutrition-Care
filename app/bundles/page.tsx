import Link from "next/link";
import { SiteChrome } from "@/components/site-chrome";
import { createSupabaseServerClient } from "@/lib/supabase/server";
export const revalidate=60;
export default async function BundlesPage(){
 const supabase=await createSupabaseServerClient();
 const {data,error}=await supabase.from("store_bundles").select("id,name_ar,slug,description_ar,price,compare_at_price,currency").eq("is_active",true).order("created_at",{ascending:false});
 return <SiteChrome><main><section className="page-hero"><div className="container"><span>الباقات</span><h1>عروض الباقات</h1><p>الباقات المنشورة فعلياً في كتالوج المتجر.</p></div></section><section className="storefront-section"><div className="container">{error?<div className="empty-state"><h2>تعذر تحميل الباقات</h2></div>:data?.length?<div className="catalog-grid">{data.map(b=><article className="catalog-card" key={b.id}><strong>{b.name_ar}</strong>{b.description_ar?<p>{b.description_ar}</p>:null}<div className="product-price"><strong>{Number(b.price).toLocaleString("ar-SA")} {b.currency}</strong>{b.compare_at_price?<del>{Number(b.compare_at_price).toLocaleString("ar-SA")} {b.currency}</del>:null}</div><Link href={`/bundles/${b.slug}`} className="text-link">عرض الباقة ←</Link></article>)}</div>:<div className="empty-state"><h2>لا توجد باقات منشورة</h2></div>}</div></section></main></SiteChrome>}
