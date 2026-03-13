import { MetricCard } from "@/components/admin/MetricCard";
import { getSupabaseAdminClient } from "@/lib/supabase/client-admin";
import { Users, CreditCard, DollarSign, UserPlus } from "lucide-react";

export default async function AdminDashboardPage() {
  const admin = getSupabaseAdminClient();

  const [
    { count: totalUsers },
    { count: activeSubscriptions },
    { data: revenueData },
    { count: newSignupsToday },
  ] = await Promise.all([
    admin.from("users").select("id", { count: "exact", head: true }),
    admin
      .from("subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
    admin
      .from("payments")
      .select("amount")
      .eq("payment_status", "paid"),
    admin
      .from("users")
      .select("id", { count: "exact", head: true })
      .gte("created_at", new Date().toISOString().split("T")[0]),
  ]);

  const totalRevenue =
    revenueData?.reduce((sum, p) => sum + Number(p.amount || 0), 0) ?? 0;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral do sistema EditAI
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total de Usuários"
          value={totalUsers ?? 0}
          icon={Users}
        />
        <MetricCard
          label="Assinaturas Ativas"
          value={activeSubscriptions ?? 0}
          icon={CreditCard}
        />
        <MetricCard
          label="Receita Total"
          value={formatCurrency(totalRevenue)}
          icon={DollarSign}
        />
        <MetricCard
          label="Novos Cadastros Hoje"
          value={newSignupsToday ?? 0}
          icon={UserPlus}
        />
      </div>

      <div className="admin-card-glass rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Bem-vindo ao painel admin</h2>
        <p className="text-muted-foreground">
          Use o menu lateral para navegar entre Usuários, Planos, Pagamentos,
          Financeiro, API Keys e Configurações.
        </p>
      </div>
    </div>
  );
}
