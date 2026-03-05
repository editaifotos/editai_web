"use client";

import { createBrowserClient } from "@supabase/ssr";
import { supabaseConfig } from "@/config/supabase";

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseBrowserClient() {
  if (!browserClient) {
    browserClient = createBrowserClient(supabaseConfig.url, supabaseConfig.anonKey);
  }

  return browserClient;
}

