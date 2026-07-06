import { PlansList } from "@/components/admin/PlansList";
import { getSupabaseAdminClient } from "@/lib/supabase/client-admin";

export default async function AdminPlansPage() {
  const admin = getSupabaseAdminClient();

  const [{ data: plans }, { data: users }] = await Promise.all([
    admin
      .from("plans")
      .select(
        "id, name, description, price, monthly_price, yearly_price, duration_months, is_active, add_credit, credit_referral, max_stored_photos, photo_expiration_days, credit_expiration_days, link_payment, created_at"
      )
      .order("is_active", { ascending: false })
      .order("name"),
    admin.from("users").select("current_plan_id"),
  ]);

  const planUserCounts = new Map<string, number>();
  for (const user of users ?? []) {
    if (!user.current_plan_id) continue;
    planUserCounts.set(
      user.current_plan_id,
      (planUserCounts.get(user.current_plan_id) ?? 0) + 1
    );
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
