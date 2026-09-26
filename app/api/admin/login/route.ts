import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseKey, getSupabaseUrl } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let body: { email?: unknown; password?: unknown };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "بيانات تسجيل الدخول غير صالحة." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json({ error: "أدخل البريد الإلكتروني وكلمة المرور." }, { status: 400 });
  }

  let supabaseUrl: string;
  let supabaseKey: string;

  try {
    supabaseUrl = getSupabaseUrl();
    supabaseKey = getSupabaseKey();
  } catch {
    return NextResponse.json({ error: "إعدادات Supabase غير موجودة في بيئة التشغيل." }, { status: 500 });
  }

  const response = NextResponse.json({ ok: true });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !authData.user) {
    return NextResponse.json({ error: error?.message || "تعذر تسجيل الدخول." }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role,is_active")
    .eq("id", authData.user.id)
    .maybeSingle();

  if (profileError || !profile || !profile.is_active || !["admin", "super_admin"].includes(profile.role)) {
    return NextResponse.json(
      { error: "هذا الحساب ليس لديه صلاحية دخول لوحة الإدارة." },
      { status: 403 }
    );
  }

  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
