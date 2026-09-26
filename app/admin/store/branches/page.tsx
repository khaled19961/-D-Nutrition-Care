"use client";
import {useEffect,useState} from "react";
import {createSupabaseBrowserClient} from "@/lib/supabase/browser";
import {AdminStoreNav} from "@/components/admin-store-nav";
type R={id:string;name_ar:string;address_ar:string|null;phone:string|null;is_active:boolean};
export default function Branches(){
 const s=createSupabaseBrowserClient();const [rows,setRows]=useState<R[]>([]);const [f,setF]=useState({name_ar:"",name_en:"",address_ar:"",phone:""});const [msg,setMsg]=useState("");
 async function load(){const {data,error}=await s.from("store_branches").select("*").order("name_ar");if(error)setMsg("تعذر تحميل الفروع");else setRows(data??[])}
 useEffect(()=>{load()},[]);
 async function add(e:React.FormEvent){e.preventDefault();const {error}=await s.from("store_branches").insert({name_ar:f.name_ar.trim(),name_en:f.name_en.trim()||f.name_ar.trim(),address_ar:f.address_ar.trim()||null,phone:f.phone.trim()||null,is_active:false});if(error)setMsg("تعذر إنشاء الفرع");else{setF({name_ar:"",name_en:"",address_ar:"",phone:""});load()}}
 async function toggle(r:R){const {error}=await s.from("store_branches").update({is_active:!r.is_active,updated_at:new Date().toISOString()}).eq("id",r.id);if(error)setMsg("تعذر تحديث الحالة");else load()}
 return <main><AdminStoreNav/><section className="storefront-section"><div className="container"><div className="page-heading"><span>إدارة المتجر</span><h1>الفروع</h1><p>إدارة الفروع والعناوين المعتمدة.</p></div><form onSubmit={add} className="admin-form"><input required placeholder="اسم الفرع" value={f.name_ar} onChange={e=>setF({...f,name_ar:e.target.value})}/><input placeholder="الاسم بالإنجليزية" value={f.name_en} onChange={e=>setF({...f,name_en:e.target.value})}/><input placeholder="العنوان" value={f.address_ar} onChange={e=>setF({...f,address_ar:e.target.value})}/><input placeholder="الهاتف" value={f.phone} onChange={e=>setF({...f,phone:e.target.value})}/><button className="primary-btn">إضافة فرع</button></form>{msg&&<p className="form-error">{msg}</p>}<div className="catalog-grid">{rows.map(r=><article className="catalog-card" key={r.id}><strong>{r.name_ar}</strong>{r.address_ar&&<p>{r.address_ar}</p>}{r.phone&&<p>{r.phone}</p>}<span>{r.is_active?"منشور":"موقوف"}</span><button className="text-link" onClick={()=>toggle(r)}>{r.is_active?"إيقاف":"نشر"}</button></article>)}</div></div></section></main>;
}