import { ApiKeysManager } from "@/components/admin/ApiKeysManager";
import { getSupabaseAdminClient } from "@/lib/supabase/client-admin";

export default async function AdminApiKeysPage() {
  const admin = getSupabaseAdminClient();

  const { data: apiKeys } = await admin
    .from("api_keys")
    .select("id, key_prefix, name, status, scopes, rate_limit_per_minute, created_at, last_used_at")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">API Keys</h1>
        <p className="text-muted-foreground">
          Gerencie as chaves de API para acesso externo
        </p>
      </div>
      <ApiKeysManager keys={apiKeys ?? []} />
    </div>
  );
}
