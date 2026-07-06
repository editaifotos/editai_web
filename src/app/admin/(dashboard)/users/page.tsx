import { UsersTable } from "@/components/admin/UsersTable";
import { fetchUsersAdminList } from "@/app/admin/users/actions";
import { getSupabaseAdminClient } from "@/lib/supabase/client-admin";

type PageProps = { searchParams: Promise<{ plan?: string }> };

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const { plan: planId } = await searchParams;
  const users = await fetchUsersAdminList(undefined, planId);

  let planName: string | null = null;
  if (planId) {
    const admin = getSupabaseAdminClient();
    const { data: plan } = await admin
      .from("plans")
      .select("name")
      .eq("id", planId)
      .maybeSingle();
    planName = plan?.name ?? null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Usuários</h1>
        <p className="text-muted-foreground">
          {planName
            ? `Filtrando pelo plano ${planName}`
            : "Gerencie os usuários do sistema"}
        </p>
      </div>
      <UsersTable users={users ?? []} planFilterId={planId} planFilterName={planName} />
    </div>
  );
}
