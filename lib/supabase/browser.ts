import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseKey, getSupabaseUrl } from "@/lib/supabase/config";

export function createSupabaseBrowserClient() {
  return createBrowserClient(getSupabaseUrl(), getSupabaseKey(), {
    auth: {
      flowType: "pkce",
      detectSessionInUrl: true,
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}
