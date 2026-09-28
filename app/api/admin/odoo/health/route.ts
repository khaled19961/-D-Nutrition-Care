import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isOdooConfigured, odooHealthCheck, searchOdooProducts } from "@/lib/odoo/client";

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
    const context = await odooHealthCheck();
    const products = await searchOdooProducts();

    return NextResponse.json({
      configured: true,
      connected: true,
      api: {
        context: true,
        products_read: true,
      },
      product_count: products.length,
      user_id:
        typeof context === "object" && context !== null && "uid" in context
          ? context.uid
          : null,
      message: "تم الاتصال بـ Odoo ونجحت قراءة المنتجات.",
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
