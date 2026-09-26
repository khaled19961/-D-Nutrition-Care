export function getSupabaseUrl() {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();

  if (!raw) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not configured.");
  }

  // Supabase clients expect the project root, not /rest/v1 or /auth/v1.
  // Normalize common misconfigurations so Cloudflare deployments do not
  // generate requests such as /rest/v1/auth/v1/token (PGRST125).
  const url = new URL(raw);
  url.pathname = url.pathname
    .replace(/\/+$/, "")
    .replace(/\/(?:rest\/v1|auth\/v1|storage\/v1)(?:\/.*)?$/, "");
  url.search = "";
  url.hash = "";

  return url.toString().replace(/\/$/, "");
}

export function getSupabaseKey() {
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!key) {
    throw new Error("Supabase publishable/anon key is not configured.");
  }

  return key;
}
