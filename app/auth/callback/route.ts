import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function safeNextPath(value: string | null) {
  if (!value) return "/dashboard";
  if (!value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  return value;
}

function loginError(url: URL, code: string) {
  return NextResponse.redirect(new URL("/auth/login?error=" + encodeURIComponent(code), url.origin));
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const next = safeNextPath(url.searchParams.get("next"));

  const supabase = await createSupabaseServerClient();

  // PKCE email links (including password recovery) return a code.
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return loginError(url, "auth_callback");
    return NextResponse.redirect(new URL(next, url.origin));
  }

  // Custom email templates can return a token hash + type instead.
  // Supporting both prevents recovery/confirmation links from falling back
  // to the login page when the template uses {{ .TokenHash }}.
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });
    if (error) return loginError(url, "auth_callback");
    return NextResponse.redirect(new URL(next, url.origin));
  }

  return loginError(url, "missing_code");
}
