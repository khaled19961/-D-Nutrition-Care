import Link from "next/link";
import { SiteChrome } from "@/components/site-chrome";
import { createSupabaseServerClient } from "@/lib/supabase/server";
export const revalidate=60;
export default async function CategoriesPage(){
 const supabase=await createSupabaseServerClient();
 const {data,error}=await supabase.from("store_categories").select("id,name_ar,slug,description_ar").eq("is_active",true).order("sort_order").order("name_ar");
 return <SiteChrome><main><section className="page-hero"><div className="container"><span>الفئات</span><h1>تسوق حسب الفئة</h1><p>الفئات المنشورة فعلياً في كتالوج المتجر.</p></div></section><section className="storefront-section"><div className="container">{error?<div className="empty-state"><h2>تعذر تحميل الفئات</h2></div>:data?.length?<div className="category-grid">{data.map(cat=><Link href={`/store?category=${cat.slug}`} className="category-card" key={cat.id}><div><h3>{cat.name_ar}</h3>{cat.description_ar?<p>{cat.description_ar}</p>:null}</div><span className="arrow">←</span></Link>)}</div>:<div className="empty-state"><h2>لا توجد فئات متجر منشورة</h2><p>لن تظهر فئات قبل اعتمادها من الإدارة.</p></div>}</div></section></main></SiteChrome>}
