const DEFAULT_SUPABASE_URL = "https://mhmbtlirintgcabscptj.supabase.co";
const DEFAULT_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_F7HJAJzIOziy9ImGhlOqCg_3J_4q07o";

export function getSupabaseUrl() {
  const raw =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    DEFAULT_SUPABASE_URL;

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
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    DEFAULT_SUPABASE_PUBLISHABLE_KEY;

  return key;
}
