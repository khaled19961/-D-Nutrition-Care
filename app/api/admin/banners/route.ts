import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;

  if (!userId) return NextResponse.json({ error: "انتهت جلسة الإدارة. أعد تسجيل الدخول." }, { status: 401 });

  const { data: profile, error: profileError } = await supabase
    .from("profiles").select("role,is_active").eq("id", userId).maybeSingle();

  if (profileError || !profile || !profile.is_active || !["admin","super_admin"].includes(profile.role)) {
    return NextResponse.json({ error: "لا تملك صلاحية إدارة البنرات." }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("site_banners").select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ banners: data ?? [] }, {
    headers: { "Cache-Control": "private, no-store" }
  });
}
