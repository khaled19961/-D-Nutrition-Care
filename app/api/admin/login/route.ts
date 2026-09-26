import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let body: { email?: unknown; password?: unknown };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "بيانات تسجيل الدخول غير صالحة." },
      { status: 400 }
    );
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json(
      { error: "أدخل البريد الإلكتروني وكلمة المرور." },
      { status: 400 }
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { error: "إعدادات Supabase غير موجودة في بيئة التشغيل." },
      { status: 500 }
    );
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

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 401 }
    );
  }

  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
