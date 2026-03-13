import { env } from "@/utils/env";

function getRequiredEnv(key: string, value: string | undefined): string {
  if (!value || value.trim() === "") {
    throw new Error(
      `Variável de ambiente "${key}" não está configurada. ` +
        "Crie um arquivo .env.local com NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
        "Obtenha os valores em: https://supabase.com/dashboard/project/_/settings/api"
    );
  }
  return value;
}

export const supabaseConfig = {
  url: getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL", env.supabaseUrl),
  anonKey: getRequiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", env.supabaseAnonKey),
  serviceRoleKey: env.supabaseServiceRoleKey,
};

