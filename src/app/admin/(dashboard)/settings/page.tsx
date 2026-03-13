import { WhitelistManager } from "@/components/admin/WhitelistManager";
import { getSupabaseAdminClient } from "@/lib/supabase/client-admin";

export default async function AdminSettingsPage() {
  const admin = getSupabaseAdminClient();

  const { data: whitelist } = await admin
    .from("admin_email_whitelist")
    .select("id, email, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Whitelist de emails autorizados ao painel admin
        </p>
      </div>
      <WhitelistManager emails={whitelist ?? []} />
    </div>
  );
}
