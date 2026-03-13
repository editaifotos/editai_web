import { FinanceDashboard } from "@/components/admin/FinanceDashboard";
import { getSupabaseAdminClient } from "@/lib/supabase/client-admin";

export default async function AdminFinancePage() {
  const admin = getSupabaseAdminClient();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [
    { data: paidPayments },
    { data: monthlyPayments },
    { count: activeSubs },
    { count: canceledSubs },
    { count: totalUsers },
  ] = await Promise.all([
    admin.from("payments").select("amount").eq("payment_status", "paid"),
    admin
      .from("payments")
      .select("amount")
      .eq("payment_status", "paid")
      .gte("paid_at", startOfMonth),
    admin.from("subscriptions").select("id", { count: "exact", head: true }).eq("status", "active"),
    admin.from("subscriptions").select("id", { count: "exact", head: true }).eq("status", "canceled"),
    admin.from("users").select("id", { count: "exact", head: true }),
  ]);

  const totalRevenue = paidPayments?.reduce((s, p) => s + Number(p.amount || 0), 0) ?? 0;
  const monthlyRevenue = monthlyPayments?.reduce((s, p) => s + Number(p.amount || 0), 0) ?? 0;

  const metrics = {
    totalRevenue,
    monthlyRevenue,
    activeSubscriptions: activeSubs ?? 0,
    canceledSubscriptions: canceledSubs ?? 0,
    totalUsers: totalUsers ?? 0,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Financeiro</h1>
        <p className="text-muted-foreground">
          Dashboard financeiro e métricas
        </p>
      </div>
      <FinanceDashboard metrics={metrics} />
    </div>
  );
}
