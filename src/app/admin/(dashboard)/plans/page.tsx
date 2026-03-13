import { PlansList } from "@/components/admin/PlansList";
import { getSupabaseAdminClient } from "@/lib/supabase/client-admin";

export default async function AdminPlansPage() {
  const admin = getSupabaseAdminClient();

  const [{ data: plans }, { data: subscriptions }] = await Promise.all([
    admin
      .from("plans")
      .select("id, name, monthly_price, yearly_price, is_active")
      .order("name"),
    admin
      .from("subscriptions")
      .select("id, user_id, plan_id, status")
      .eq("status", "active"),
  ]);

  const planUserCounts = new Map<string, number>();
  for (const s of subscriptions ?? []) {
    planUserCounts.set(s.plan_id, (planUserCounts.get(s.plan_id) ?? 0) + 1);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Planos</h1>
        <p className="text-muted-foreground">
          Gerencie os planos e assinaturas
        </p>
      </div>
      <PlansList plans={plans ?? []} planUserCounts={planUserCounts} />
    </div>
  );
}
