"use client";

import { useEffect,useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { AdminStoreNav } from "@/components/admin-store-nav";

type Row={id:string;name_ar:string;name_en:string;slug:string;logo_url:string|null;is_active:boolean};

export default function BrandsAdmin(){
 const supabase=createSupabaseBrowserClient();const [rows,setRows]=useState<Row[]>([]);const [f,setF]=useState({name_ar:"",name_en:"",slug:"",logo_url:""});const [msg,setMsg]=useState("");
 async function load(){const {data,error}=await supabase.from("store_brands").select("*").order("name_ar");if(error)setMsg("تعذر تحميل العلامات التجارية");else setRows(data??[])}
 useEffect(()=>{load()},[]);
 async function add(e:React.FormEvent){e.preventDefault();const {error}=await supabase.from("store_brands").insert({name_ar:f.name_ar.trim(),name_en:f.name_en.trim()||f.name_ar.trim(),slug:f.slug.trim(),logo_url:f.logo_url.trim()||null});if(error)setMsg("تعذر الحفظ. تحقق من البيانات وعدم تكرار الرابط.");else{setF({name_ar:"",name_en:"",slug:"",logo_url:""});load()}}
 async function toggle(r:Row){const {error}=await supabase.from("store_brands").update({is_active:!r.is_active,updated_at:new Date().toISOString()}).eq("id",r.id);if(error)setMsg("تعذر تحديث الحالة");else load()}
 return <main><AdminStoreNav/><section className="storefront-section"><div className="container"><div className="page-heading"><span>إدارة المتجر</span><h1>العلامات التجارية</h1><p>إدارة العلامات التي تظهر في الكتالوج.</p></div><form onSubmit={add} className="admin-form"><input required placeholder="اسم العلامة بالعربية" value={f.name_ar} onChange={e=>setF({...f,name_ar:e.target.value})}/><input placeholder="الاسم بالإنجليزية" value={f.name_en} onChange={e=>setF({...f,name_en:e.target.value})}/><input required placeholder="slug" value={f.slug} onChange={e=>setF({...f,slug:e.target.value})}/><input type="url" placeholder="رابط الشعار الحقيقي" value={f.logo_url} onChange={e=>setF({...f,logo_url:e.target.value})}/><button className="primary-btn">إضافة علامة</button></form>{msg&&<p className="form-error">{msg}</p>}<div className="catalog-grid">{rows.map(r=><article className="catalog-card" key={r.id}>{r.logo_url&&<img src={r.logo_url} alt={r.name_ar}/>}<strong>{r.name_ar}</strong><small>{r.slug}</small><span>{r.is_active?"منشورة":"موقوفة"}</span><button className="text-link" onClick={()=>toggle(r)}>{r.is_active?"إيقاف النشر":"نشر"}</button></article>)}</div></div></section></main>
}