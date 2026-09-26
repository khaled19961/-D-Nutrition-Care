import { SiteChrome } from "@/components/site-chrome";
import { createSupabaseServerClient } from "@/lib/supabase/server";
export const revalidate=60;
export default async function BranchesPage(){
 const supabase=await createSupabaseServerClient();
 const {data,error}=await supabase.from("store_branches").select("id,name_ar,address_ar,phone,opening_hours,latitude,longitude").eq("is_active",true).order("name_ar");
 return <SiteChrome><main><section className="page-hero"><div className="container"><span>الفروع</span><h1>فروعنا</h1><p>الفروع المعتمدة والمسجلة في بيانات المتجر.</p></div></section><section className="storefront-section"><div className="container">{error?<div className="empty-state"><h2>تعذر تحميل الفروع</h2></div>:data?.length?<div className="catalog-grid">{data.map(b=><article className="catalog-card" key={b.id}><strong>{b.name_ar}</strong>{b.address_ar?<p>{b.address_ar}</p>:null}{b.phone?<p>{b.phone}</p>:null}</article>)}</div>:<div className="empty-state"><h2>لا توجد فروع منشورة</h2></div>}</div></section></main></SiteChrome>}
