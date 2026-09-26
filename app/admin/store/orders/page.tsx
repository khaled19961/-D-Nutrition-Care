"use client";
import {useEffect,useState} from "react";
import {createSupabaseBrowserClient} from "@/lib/supabase/browser";
import {AdminStoreNav} from "@/components/admin-store-nav";
type R={id:string;status:string;payment_status:string;total:number;currency:string;created_at:string};
const statuses=[["pending","قيد المراجعة"],["confirmed","مؤكد"],["processing","قيد التجهيز"],["shipped","تم الشحن"],["completed","مكتمل"],["cancelled","ملغي"]] as const;
const payments=[["pending","معلق"],["paid","مدفوع"],["failed","فشل"],["refunded","مسترد"]] as const;
export default function Orders(){
 const s=createSupabaseBrowserClient();const [rows,setRows]=useState<R[]>([]);const [msg,setMsg]=useState("");
 async function load(){const {data,error}=await s.from("store_orders").select("id,status,payment_status,total,currency,created_at").order("created_at",{ascending:false}).limit(100);if(error)setMsg("تعذر تحميل الطلبات");else setRows(data??[])}
 useEffect(()=>{load()},[]);
 async function update(id:string,field:"status"|"payment_status",value:string){const {error}=await s.from("store_orders").update({[field]:value,updated_at:new Date().toISOString()}).eq("id",id);if(error)setMsg("تعذر تحديث الطلب");else load()}
 return <main><AdminStoreNav/><section className="storefront-section"><div className="container"><div className="page-heading"><span>إدارة المتجر</span><h1>الطلبات</h1><p>متابعة الطلبات الفعلية وتحديث حالتها من الإدارة.</p></div>{msg&&<p className="form-error">{msg}</p>}{rows.length?<div className="admin-list">{rows.map(r=><article className="admin-panel" key={r.id}><strong>طلب {r.id.slice(0,8)}</strong><p>{new Date(r.created_at).toLocaleString("ar-SA")} · {Number(r.total).toLocaleString("ar-SA")} {r.currency}</p><div className="admin-form"><label>حالة الطلب<select value={r.status} onChange={e=>update(r.id,"status",e.target.value)}>{statuses.map(([v,l])=><option value={v} key={v}>{l}</option>)}</select></label><label>حالة الدفع<select value={r.payment_status} onChange={e=>update(r.id,"payment_status",e.target.value)}>{payments.map(([v,l])=><option value={v} key={v}>{l}</option>)}</select></label></div></article>)}</div>:<div className="empty-state"><h2>لا توجد طلبات</h2><p>ستظهر هنا الطلبات التي ينشئها العملاء فعلياً.</p></div>}</div></section></main>;
}