import Link from "next/link";
import { SiteChrome } from "@/components/site-chrome";
import { createSupabaseServerClient } from "@/lib/supabase/server";
export const revalidate=60;
export default async function BrandsPage(){
 const supabase=await createSupabaseServerClient();
 const {data,error}=await supabase.from("store_brands").select("id,name_ar,slug,logo_url").eq("is_active",true).order("name_ar");
 return <SiteChrome><main><section className="page-hero"><div className="container"><span>العلامات التجارية</span><h1>تسوق بالعلامة التجارية</h1><p>العلامات التجارية المنشورة فعلياً في المتجر.</p></div></section><section className="storefront-section"><div className="container">{error?<div className="empty-state"><h2>تعذر تحميل العلامات التجارية</h2></div>:data?.length?<div className="catalog-grid">{data.map(b=><Link className="catalog-card" href={`/store?brand=${b.slug}`} key={b.id}>{b.logo_url?<img src={b.logo_url} alt={b.name_ar}/>:null}<strong>{b.name_ar}</strong></Link>)}</div>:<div className="empty-state"><h2>لا توجد علامات تجارية منشورة</h2><p>لن تظهر علامة تجارية قبل اعتمادها من الإدارة.</p></div>}</div></section></main></SiteChrome>}
