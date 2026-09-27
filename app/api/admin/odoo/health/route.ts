import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isOdooConfigured, odooHealthCheck } from "@/lib/odoo/client";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: claims } = await supabase.auth.getClaims();

  if (!claims?.claims?.sub) {
    return NextResponse.json({ error: "غير مصرح." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role,is_active")
    .eq("id", claims.claims.sub)
    .maybeSingle();

  if (!profile?.is_active || !["admin", "super_admin"].includes(profile.role)) {
    return NextResponse.json({ error: "غير مصرح." }, { status: 403 });
  }

  if (!isOdooConfigured()) {
    return NextResponse.json({
      configured: false,
      connected: false,
      message: "إعدادات Odoo غير موجودة في بيئة التشغيل.",
    });
  }

  try {
    await odooHealthCheck();
    return NextResponse.json({
      configured: true,
      connected: true,
      message: "تم الاتصال بـ Odoo بنجاح.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        configured: true,
        connected: false,
        message:
          error instanceof Error
            ? error.message
            : "تعذر الاتصال بـ Odoo.",
      },
      { status: 502 },
    );
  }
}
