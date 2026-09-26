import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const allowedTypes = new Set(["image/png", "image/jpeg", "image/webp", "image/svg+xml"]);
const maxSize = 4 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;

  if (!userId) return NextResponse.json({ error: "انتهت جلسة الإدارة. أعد تسجيل الدخول." }, { status: 401 });

  const { data: profile, error: profileError } = await supabase
    .from("profiles").select("role,is_active").eq("id", userId).maybeSingle();

  if (profileError || !profile || !profile.is_active || !["admin", "super_admin"].includes(profile.role)) {
    return NextResponse.json({ error: "لا تملك صلاحية رفع صورة الموقع." }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) return NextResponse.json({ error: "اختر الصورة أولاً." }, { status: 400 });
  if (!allowedTypes.has(file.type)) return NextResponse.json({ error: "صيغة الصورة غير مدعومة. استخدم PNG أو JPG أو WEBP أو SVG." }, { status: 400 });
  if (file.size > maxSize) return NextResponse.json({ error: "حجم الصورة أكبر من 4 ميجابايت." }, { status: 400 });

  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const path = `site/branding-${crypto.randomUUID()}.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const upload = await supabase.storage.from("site-assets").upload(path, bytes, {
    upsert: false,
    contentType: file.type,
    cacheControl: "3600",
  });

  if (upload.error) return NextResponse.json({ error: `فشل رفع الصورة: ${upload.error.message}` }, { status: 500 });

  const { data } = supabase.storage.from("site-assets").getPublicUrl(path);
  return NextResponse.json({ ok: true, url: data.publicUrl });
}
