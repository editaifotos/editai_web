import { FinanceDashboard } from "@/components/admin/FinanceDashboard";
import { getFinanceMetrics } from "@/lib/admin/dashboard-metrics";

export default async function AdminFinancePage() {
  const metrics = await getFinanceMetrics();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Financeiro</h1>
        <p className="text-muted-foreground">
          Dashboard financeiro e métricas
        </p>
      </div>
      <FinanceDashboard
        metrics={{
          totalRevenue: metrics.totalRevenue,
          monthlyRevenue: metrics.monthlyRevenue,
          monthlyBilling: metrics.monthlyBilling,
          monthlyBillingUsers: metrics.monthlyBillingUsers,
          monthlyBillingByPlan: metrics.monthlyBillingByPlan,
          activeSubscriptions: metrics.activeSubscriptionUsers,
          canceledSubscriptions: metrics.canceledSubscriptions,
          totalUsers: metrics.totalUsers,
        }}
      />
    </div>
  );
}
