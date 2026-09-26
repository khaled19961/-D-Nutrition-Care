"use client";

import { FormEvent, useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type Setting = { setting_key: string; setting_value: unknown };
type Banner = { id: string; image_url: string; alt_ar: string; title_ar: string | null; subtitle_ar: string | null; link_url: string | null; sort_order: number; is_active: boolean };
type BannerDraft = { title_ar: string; subtitle_ar: string; alt_ar: string; link_url: string };

const settingFields = [
  ["site_name","اسم الموقع"],
  ["site_url","رابط الموقع"],
  ["site_logo_url","رابط الشعار"],
  ["site_tagline","وصف الموقع"],
] as const;

export default function StoreSettingsPage() {
  const [settings,setSettings]=useState<Record<string,string>>({});
  const [banners,setBanners]=useState<Banner[]>([]);
  const [file,setFile]=useState<File|null>(null);
  const [logoFile,setLogoFile]=useState<File|null>(null);
  const [banner,setBanner]=useState({title_ar:"",subtitle_ar:"",alt_ar:"",link_url:""});
  const [drafts,setDrafts]=useState<Record<string,BannerDraft>>({});
  const [savingBanner,setSavingBanner]=useState<string|null>(null);
  const [message,setMessage]=useState("");
  const [error,setError]=useState("");

  async function load(){
    setError("");
    try {
      const supabase=createSupabaseBrowserClient();
      const [s,b] = await Promise.all([
        supabase.from("site_settings").select("setting_key,setting_value"),
        supabase.from("site_banners").select("*").order("sort_order",{ascending:true}).order("created_at",{ascending:true})
      ]);
      if(s.error) throw new Error(s.error.message);
      if(b.error) throw new Error(b.error.message);
      const loadedBanners=(b.data ?? []) as Banner[];
      setBanners(loadedBanners);
      setDrafts(Object.fromEntries(loadedBanners.map(item=>[item.id,{title_ar:item.title_ar??"",subtitle_ar:item.subtitle_ar??"",alt_ar:item.alt_ar??"",link_url:item.link_url??""}])));
      setSettings(Object.fromEntries((s.data??[]).map((x:Setting)=>[x.setting_key,String(x.setting_value??"").replace(/^"|"$/g,"")])));
    } catch {
      setError("تعذر تحميل بيانات البنرات. أعد تحديث الصفحة.");
    }
  }

  useEffect(()=>{load()},[]);

  async function saveSettings(e:FormEvent){
    e.preventDefault(); setMessage(""); setError("");
    const supabase=createSupabaseBrowserClient();
    const {data:{user}}=await supabase.auth.getUser();
    if(!user){setError("يجب تسجيل الدخول.");return;}
    if(logoFile){
      const formData=new FormData();
      formData.append("file",logoFile);
      const response=await fetch("/api/admin/site-assets/upload",{method:"POST",body:formData});
      const result=await response.json().catch(()=>({}));
      if(!response.ok){setError(result?.error||"تعذر رفع صورة الشعار.");return;}
      settings.site_logo_url=result.url;
      setLogoFile(null);
    }
    for(const [key] of settingFields){
      const {error}=await supabase.from("site_settings").upsert({setting_key:key,setting_value:JSON.stringify(settings[key]??""),updated_by:user.id,updated_at:new Date().toISOString()},{onConflict:"setting_key"});
      if(error){setError(error.message);return;}
    }
    setMessage("تم حفظ إعدادات الموقع.");
  }

  async function addBanner(e:FormEvent){
    e.preventDefault(); setMessage(""); setError("");
    if(!file){setError("اختر صورة البنر أولاً.");return;}
    if(!["image/png","image/jpeg","image/webp"].includes(file.type)){setError("صيغة الصورة غير مدعومة. استخدم PNG أو JPG أو WEBP.");return;}
    if(file.size > 8 * 1024 * 1024){setError("حجم الصورة أكبر من 8 ميجابايت.");return;}
    setMessage("جاري رفع صورة البنر...");
    const formData=new FormData();
    formData.append("file",file);
    formData.append("title_ar",banner.title_ar);
    formData.append("subtitle_ar",banner.subtitle_ar);
    formData.append("alt_ar",banner.alt_ar);
    formData.append("link_url",banner.link_url);
    const response=await fetch("/api/admin/banners/upload",{method:"POST",body:formData});
    const result=await response.json().catch(()=>({}));
    if(!response.ok){setError(result?.error||"تعذر رفع البنر.");setMessage("");return;}
    setFile(null);setBanner({title_ar:"",subtitle_ar:"",alt_ar:"",link_url:""});setMessage("تمت إضافة البنر.");await load();
  }

  function changeDraft(id:string,patch:Partial<BannerDraft>){
    setDrafts(current=>({...current,[id]:{...current[id],...patch}}));
  }

  async function saveBanner(id:string){
    const draft=drafts[id];
    if(!draft) return;
    setSavingBanner(id); setError(""); setMessage("");
    const supabase=createSupabaseBrowserClient();
    const {error}=await supabase.from("site_banners").update({
      title_ar:draft.title_ar.trim()||null,
      subtitle_ar:draft.subtitle_ar.trim()||null,
      alt_ar:draft.alt_ar.trim()||"بنر الموقع",
      link_url:draft.link_url.trim()||null
    }).eq("id",id);
    setSavingBanner(null);
    if(error){setError(error.message);return;}
    setMessage("تم حفظ تعديلات البنر.");
    await load();
  }

  async function toggleBanner(id:string,isActive:boolean){
    const supabase=createSupabaseBrowserClient();
    const {error}=await supabase.from("site_banners").update({is_active:isActive}).eq("id",id);
    if(error){setError(error.message);return;}
    await load();
  }

  async function moveBanner(id:string,direction:-1|1){
    const index=banners.findIndex(item=>item.id===id);
    const targetIndex=index+direction;
    if(index<0||targetIndex<0||targetIndex>=banners.length) return;
    const current=banners[index];
    const target=banners[targetIndex];
    const supabase=createSupabaseBrowserClient();
    const [first,second]=await Promise.all([
      supabase.from("site_banners").update({sort_order:target.sort_order}).eq("id",current.id),
      supabase.from("site_banners").update({sort_order:current.sort_order}).eq("id",target.id)
    ]);
    if(first.error||second.error){setError(first.error?.message||second.error?.message||"تعذر تغيير ترتيب البنرات.");return;}
    await load();
  }

  async function removeBanner(id:string){
    if(!confirm("حذف هذا البنر؟")) return;
    const supabase=createSupabaseBrowserClient();
    const item=banners.find(x=>x.id===id);
    const {error}=await supabase.from("site_banners").delete().eq("id",id);
    if(error){setError(error.message);return;}
    if(item?.image_url.includes("/site-assets/")){
      const path=item.image_url.split("/site-assets/")[1];
      if(path) await supabase.storage.from("site-assets").remove([decodeURIComponent(path)]);
    }
    await load();
  }

  return <main className="container py-10">
    <div className="page-heading"><span>تعديل المتجر</span><h1>إعدادات الموقع والبنرات</h1><p>كل الإعدادات الأساسية قابلة للتعديل من هنا بدون تعديل الكود.</p></div>
    <div className="admin-settings-grid">
      <form onSubmit={saveSettings} className="admin-panel">
        <h2>بيانات الموقع</h2>
        <div className="admin-form">
          {settingFields.map(([key,label])=><label key={key}>{label}<input value={settings[key]??""} onChange={e=>setSettings({...settings,[key]:e.target.value})}/></label>)}
          <label>رفع صورة الشعار<input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={e=>setLogoFile(e.target.files?.[0]??null)}/></label>
        </div>
        <button className="primary-btn">حفظ الإعدادات</button>
      </form>

      <form onSubmit={addBanner} className="admin-panel">
        <h2>إضافة بنر</h2>
        <div className="admin-form">
          <label>صورة البنر<input type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>setFile(e.target.files?.[0]??null)} required/></label>
          <label>عنوان البنر<input value={banner.title_ar} onChange={e=>setBanner({...banner,title_ar:e.target.value})} placeholder="عنوان اختياري"/></label>
          <label>الوصف<input value={banner.subtitle_ar} onChange={e=>setBanner({...banner,subtitle_ar:e.target.value})} placeholder="وصف اختياري"/></label>
          <label>النص البديل<input value={banner.alt_ar} onChange={e=>setBanner({...banner,alt_ar:e.target.value})} placeholder="وصف الصورة"/></label>
          <label>رابط عند الضغط<input value={banner.link_url} onChange={e=>setBanner({...banner,link_url:e.target.value})} placeholder="/booking"/></label>
        </div>
        <button className="primary-btn">رفع وإضافة البنر</button>
      </form>
    </div>

    {(error||message)&&<p className={error?"form-error":"form-success"}>{error||message}</p>}

    <section className="admin-panel banner-manager">
      <div className="section-heading split"><div><span>البنرات الحالية</span><h2>إدارة البنرات</h2></div></div>
      <div className="banner-admin-list">
        {banners.map((item,index)=>{
          const draft=drafts[item.id]??{title_ar:item.title_ar??"",subtitle_ar:item.subtitle_ar??"",alt_ar:item.alt_ar??"",link_url:item.link_url??""};
          return <article className="banner-admin-item" key={item.id}>
            <img src={item.image_url} alt={draft.alt_ar||"بنر الموقع"} loading="lazy" decoding="async"/>
            <div className="banner-admin-fields">
              <input value={draft.title_ar} placeholder="عنوان البنر" onChange={e=>changeDraft(item.id,{title_ar:e.target.value})}/>
              <input value={draft.subtitle_ar} placeholder="وصف البنر" onChange={e=>changeDraft(item.id,{subtitle_ar:e.target.value})}/>
              <input value={draft.alt_ar} placeholder="النص البديل" onChange={e=>changeDraft(item.id,{alt_ar:e.target.value})}/>
              <input value={draft.link_url} placeholder="الرابط عند الضغط" onChange={e=>changeDraft(item.id,{link_url:e.target.value})}/>
              <div className="admin-actions">
                <button type="button" onClick={()=>moveBanner(item.id,-1)} disabled={index===0}>↑</button>
                <button type="button" onClick={()=>moveBanner(item.id,1)} disabled={index===banners.length-1}>↓</button>
                <button type="button" onClick={()=>saveBanner(item.id)} disabled={savingBanner===item.id}>{savingBanner===item.id?"جاري الحفظ":"حفظ التعديل"}</button>
                <button type="button" onClick={()=>toggleBanner(item.id,!item.is_active)}>{item.is_active?"إخفاء":"إظهار"}</button>
                <button type="button" onClick={()=>removeBanner(item.id)} className="danger-btn">حذف</button>
              </div>
            </div>
          </article>
        })}
        {!banners.length&&<div className="empty-state">لا توجد بنرات بعد. أضف أول بنر من النموذج أعلاه.</div>}
      </div>
    </section>
  </main>;
}