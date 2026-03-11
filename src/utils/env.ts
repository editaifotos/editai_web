export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  nodeEnv: process.env.NODE_ENV ?? "development",
  appEnv: process.env.APP_ENV ?? "local",
  asaasApiKey: process.env.ASAAS_API_KEY ?? "",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "",
};

