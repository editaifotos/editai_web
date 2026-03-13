import { UsersTable } from "@/components/admin/UsersTable";
import { getSupabaseAdminClient } from "@/lib/supabase/client-admin";

export default async function AdminUsersPage() {
  const admin = getSupabaseAdminClient();

  const { data: usersData } = await admin
    .from("users")
    .select("id, name, email, role, subscription_status, credits_balance, created_at, current_plan_id")
    .order("created_at", { ascending: false })
    .limit(50);

  const planIds = [...new Set((usersData ?? []).map((u) => u.current_plan_id).filter(Boolean))];
  const { data: plansData } =
    planIds.length > 0
      ? await admin.from("plans").select("id, name").in("id", planIds as string[])
      : { data: [] };

  const plansMap = new Map((plansData ?? []).map((p) => [p.id, p.name]));
  const users = (usersData ?? []).map((u) => ({
    ...u,
    plans: u.current_plan_id ? { name: plansMap.get(u.current_plan_id) ?? "—" } : null,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Usuários</h1>
        <p className="text-muted-foreground">
          Gerencie os usuários do sistema
        </p>
      </div>
      <UsersTable users={users ?? []} />
    </div>
  );
}
