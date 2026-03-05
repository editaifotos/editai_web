import { env } from "@/utils/env";

export const supabaseConfig = {
  url: env.supabaseUrl,
  anonKey: env.supabaseAnonKey,
  serviceRoleKey: env.supabaseServiceRoleKey
};

