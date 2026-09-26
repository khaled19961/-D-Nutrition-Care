import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const allowedTypes = new Set(["image/png", "image/jpeg", "image/webp"]);
const maxSize = 8 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;

  if (!userId) {
    return NextResponse.json({ error: "انتهت جلسة الإدارة. أعد تسجيل الدخول." }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role,is_active")
    .eq("id", userId)
    .maybeSingle();

  if (profileError || !profile || !profile.is_active || !["admin", "super_admin"].includes(profile.role)) {
    return NextResponse.json({ error: "لا تملك صلاحية إدارة البنرات." }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "اختر صورة البنر أولاً." }, { status: 400 });
  }

  if (!allowedTypes.has(file.type)) {
    return NextResponse.json({ error: "صيغة الصورة غير مدعومة. استخدم PNG أو JPG أو WEBP." }, { status: 400 });
  }

  if (file.size > maxSize) {
    return NextResponse.json({ error: "حجم الصورة أكبر من 8 ميجابايت." }, { status: 400 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "webp";
  const path = `banners/${crypto.randomUUID()}.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const upload = await supabase.storage
    .from("site-assets")
    .upload(path, bytes, {
      upsert: false,
      contentType: file.type,
      cacheControl: "3600",
    });

  if (upload.error) {
    return NextResponse.json({ error: `فشل رفع الصورة: ${upload.error.message}` }, { status: 500 });
  }

  const { data: urlData } = supabase.storage.from("site-assets").getPublicUrl(path);

  const title_ar = String(formData.get("title_ar") || "").trim();
  const subtitle_ar = String(formData.get("subtitle_ar") || "").trim();
  const alt_ar = String(formData.get("alt_ar") || title_ar || "بنر الموقع").trim();
  const link_url = String(formData.get("link_url") || "").trim();

  const { data: lastBanner } = await supabase
    .from("site_banners")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error: insertError } = await supabase.from("site_banners").insert({
    image_url: urlData.publicUrl,
    alt_ar,
    title_ar: title_ar || null,
    subtitle_ar: subtitle_ar || null,
    link_url: link_url || null,
    sort_order: (lastBanner?.sort_order ?? -1) + 1,
    is_active: true,
  });

  if (insertError) {
    await supabase.storage.from("site-assets").remove([path]);
    return NextResponse.json({ error: `تم رفع الصورة لكن تعذر حفظ البنر: ${insertError.message}` }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
