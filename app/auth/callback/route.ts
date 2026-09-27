import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function safeNextPath(value: string | null) {
  if (!value) return "/dashboard";
  if (!value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  return value;
}

function redirectError(url: URL, code: string, next: string | null) {
  const isRecovery = next === "/auth/reset-password";
  const target = isRecovery ? "/auth/reset-password" : "/auth/login";
  const result = new URL(target, url.origin);
  result.searchParams.set("error", code);
  if (isRecovery) result.searchParams.set("recovery", "1");
  return NextResponse.redirect(result);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const nextRaw = url.searchParams.get("next");
  const next = safeNextPath(nextRaw);

  const providerError =
    url.searchParams.get("error_description") ||
    url.searchParams.get("error");

  if (providerError) {
    return redirectError(url, "auth_callback", nextRaw);
  }

  const supabase = await createSupabaseServerClient();

  // PKCE links, including password recovery, return a one-time code.
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return redirectError(url, "auth_callback", nextRaw);

    if (next === "/auth/reset-password") {
      const recoveryUrl = new URL(next, url.origin);
      recoveryUrl.searchParams.set("recovery", "1");
      return NextResponse.redirect(recoveryUrl);
    }

    return NextResponse.redirect(new URL(next, url.origin));
  }

  // Custom email templates may use TokenHash instead of ConfirmationURL.
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });
    if (error) return redirectError(url, "auth_callback", nextRaw);

    if (next === "/auth/reset-password") {
      const recoveryUrl = new URL(next, url.origin);
      recoveryUrl.searchParams.set("recovery", "1");
      return NextResponse.redirect(recoveryUrl);
    }

    return NextResponse.redirect(new URL(next, url.origin));
  }

  return redirectError(url, "missing_code", nextRaw);
}
