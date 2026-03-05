import { createClient } from "@supabase/supabase-js";
import { supabaseConfig } from "@/config/supabase";

/**
 * Cliente Supabase com service role key.
 * Contorna o RLS — usar APENAS em server-side (API Routes, Server Actions).
 * Nunca expor no browser.
 */
export function getSupabaseAdminClient() {
  return createClient(supabaseConfig.url, supabaseConfig.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
