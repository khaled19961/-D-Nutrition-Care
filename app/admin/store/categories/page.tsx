"use client";

import { useEffect,useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { AdminStoreNav } from "@/components/admin-store-nav";

type Row={id:string;name_ar:string;name_en:string;slug:string;description_ar:string|null;is_active:boolean;sort_order:number};

export default function CategoriesAdmin(){
 const supabase=createSupabaseBrowserClient();
 const [rows,setRows]=useState<Row[]>([]);
 const [form,setForm]=useState({name_ar:"",name_en:"",slug:"",description_ar:"",sort_order:"0"});
 const [msg,setMsg]=useState("");
 async function load(){const {data,error}=await supabase.from("store_categories").select("*").order("sort_order").order("name_ar");if(error)setMsg("تعذر تحميل الفئات");else setRows(data??[])}
 useEffect(()=>{load()},[]);
 async function add(e:React.FormEvent){e.preventDefault();setMsg("");const {error}=await supabase.from("store_categories").insert({name_ar:form.name_ar.trim(),name_en:form.name_en.trim()||form.name_ar.trim(),slug:form.slug.trim(),description_ar:form.description_ar.trim()||null,sort_order:Number(form.sort_order)||0});if(error)setMsg("تعذر حفظ الفئة. تحقق من البيانات وعدم تكرار الرابط.");else{setForm({name_ar:"",name_en:"",slug:"",description_ar:"",sort_order:"0"});load()}}
 async function toggle(r:Row){const {error}=await supabase.from("store_categories").update({is_active:!r.is_active,updated_at:new Date().toISOString()}).eq("id",r.id);if(error)setMsg("تعذر تحديث الحالة");else load()}
 return <main><AdminStoreNav/><section className="storefront-section"><div className="container"><div className="page-heading"><span>إدارة المتجر</span><h1>الفئات</h1><p>إضافة وإدارة الفئات الحقيقية التي تظهر في المتجر.</p></div><form onSubmit={add} className="admin-form"><input required placeholder="اسم الفئة بالعربية" value={form.name_ar} onChange={e=>setForm({...form,name_ar:e.target.value})}/><input placeholder="الاسم بالإنجليزية" value={form.name_en} onChange={e=>setForm({...form,name_en:e.target.value})}/><input required placeholder="slug" value={form.slug} onChange={e=>setForm({...form,slug:e.target.value})}/><input placeholder="الوصف" value={form.description_ar} onChange={e=>setForm({...form,description_ar:e.target.value})}/><input type="number" placeholder="الترتيب" value={form.sort_order} onChange={e=>setForm({...form,sort_order:e.target.value})}/><button className="primary-btn">إضافة فئة</button></form>{msg&&<p className="form-error">{msg}</p>}<div className="catalog-grid">{rows.map(r=><article className="catalog-card" key={r.id}><strong>{r.name_ar}</strong><small>{r.slug}</small><span>{r.is_active?"منشورة":"موقوفة"}</span><button className="text-link" onClick={()=>toggle(r)}>{r.is_active?"إيقاف النشر":"نشر"}</button></article>)}</div></div></section></main>
}