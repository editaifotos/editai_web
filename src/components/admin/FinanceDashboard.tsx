import { MetricCard } from "./MetricCard";
import { DollarSign, CreditCard, Users, XCircle } from "lucide-react";

type Metrics = {
  totalRevenue: number;
  monthlyRevenue: number;
  activeSubscriptions: number;
  canceledSubscriptions: number;
  totalUsers: number;
};

export function FinanceDashboard({ metrics }: { metrics: Metrics }) {
  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Receita Total"
          value={formatCurrency(metrics.totalRevenue)}
          icon={DollarSign}
        />
        <MetricCard
          label="Receita do Mês"
          value={formatCurrency(metrics.monthlyRevenue)}
          icon={DollarSign}
        />
        <MetricCard
          label="Usuários Ativos (assinaturas)"
          value={metrics.activeSubscriptions}
          icon={CreditCard}
        />
        <MetricCard
          label="Cancelamentos"
          value={metrics.canceledSubscriptions}
          icon={XCircle}
        />
        <MetricCard
          label="Total de Usuários"
          value={metrics.totalUsers}
          icon={Users}
        />
      </div>
    </div>
  );
}
