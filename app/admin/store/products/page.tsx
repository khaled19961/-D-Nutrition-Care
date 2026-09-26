"use client";

import Link from "next/link";
import { useEffect,useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { AdminStoreNav } from "@/components/admin-store-nav";

type Product={id:string;name_ar:string;slug:string;sku:string|null;price:number;stock_quantity:number;is_active:boolean;is_featured:boolean;is_new:boolean};
export default function ProductsAdmin(){
 const s=createSupabaseBrowserClient();const [rows,setRows]=useState<Product[]>([]);const [msg,setMsg]=useState("");
 async function load(){const {data,error}=await s.from("store_products").select("id,name_ar,slug,sku,price,stock_quantity,is_active,is_featured,is_new").order("created_at",{ascending:false});if(error)setMsg("تعذر تحميل المنتجات");else setRows(data??[])}
 useEffect(()=>{load()},[]);
 async function toggle(id:string,field:"is_active"|"is_featured"|"is_new",value:boolean){const {error}=await s.from("store_products").update({[field]:!value,updated_at:new Date().toISOString()}).eq("id",id);if(error)setMsg("تعذر تحديث المنتج");else load()}
 return <main><AdminStoreNav/><section className="storefront-section"><div className="container"><div className="page-heading"><span>إدارة المتجر</span><h1>المنتجات</h1><p>المنتجات لا تظهر للعميل إلا بعد اعتمادها وتوفر مخزونها.</p></div><div className="admin-toolbar"><Link className="primary-btn" href="/admin/store/products/new">إضافة منتج</Link></div>{msg&&<p className="form-error">{msg}</p>}<div className="catalog-grid">{rows.map(p=><article className="catalog-card" key={p.id}><strong>{p.name_ar}</strong><small>{p.sku||"بدون SKU"} · {p.slug}</small><p>{Number(p.price).toLocaleString("ar-SA")} SAR · المخزون {p.stock_quantity}</p><span>{p.is_active?"منشور":"مسودة"} · {p.is_featured?"مميز":""} {p.is_new?"جديد":""}</span><div className="admin-actions"><Link className="text-link" href={`/admin/store/products/${p.id}`}>تعديل</Link><button className="text-link" onClick={()=>toggle(p.id,"is_active",p.is_active)}>{p.is_active?"إيقاف":"نشر"}</button><button className="text-link" onClick={()=>toggle(p.id,"is_featured",p.is_featured)}>{p.is_featured?"إلغاء التمييز":"تمييز"}</button><button className="text-link" onClick={()=>toggle(p.id,"is_new",p.is_new)}>{p.is_new?"إلغاء جديد":"وضع كجديد"}</button></div></article>)}</div></div></section></main>
}