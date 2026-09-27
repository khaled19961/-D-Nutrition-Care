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

function redirectWithNoStore(response: NextResponse) {
  response.headers.set("Cache-Control", "private, no-store");
  return response;
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
    return redirectWithNoStore(redirectError(url, "auth_callback", nextRaw));
  }

  try {
    const supabase = await createSupabaseServerClient();

    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        return redirectWithNoStore(redirectError(url, "auth_callback", nextRaw));
      }

      const target = new URL(next, url.origin);
      if (next === "/auth/reset-password") {
        target.searchParams.set("recovery", "1");
      }

      const forwardedHost = request.headers.get("x-forwarded-host");
      const targetOrigin =
        forwardedHost && !forwardedHost.includes(",")
          ? `https://${forwardedHost}`
          : url.origin;

      const targetUrl = new URL(target.pathname + target.search, targetOrigin);
      return redirectWithNoStore(NextResponse.redirect(targetUrl));
    }

    if (tokenHash && type) {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type,
      });
      if (error) {
        return redirectWithNoStore(redirectError(url, "auth_callback", nextRaw));
      }

      const target = new URL(next, url.origin);
      if (next === "/auth/reset-password") {
        target.searchParams.set("recovery", "1");
      }
      return redirectWithNoStore(NextResponse.redirect(target));
    }

    return redirectWithNoStore(redirectError(url, "missing_code", nextRaw));
  } catch {
    return redirectWithNoStore(redirectError(url, "auth_callback", nextRaw));
  }
}
