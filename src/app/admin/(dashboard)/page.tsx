import { MetricCard } from "@/components/admin/MetricCard";
import { getDashboardMetrics } from "@/lib/admin/dashboard-metrics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, CreditCard, DollarSign, UserPlus, TrendingUp } from "lucide-react";

export default async function AdminDashboardPage() {
  const metrics = await getDashboardMetrics();

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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <MetricCard
          label="Total de Usuários"
          value={metrics.totalUsers}
          icon={Users}
        />
        <MetricCard
          label="Usuários ativos / trial"
          value={metrics.activeSubscriptionUsers}
          subtitle="Mesma base do faturamento mensal"
          icon={CreditCard}
        />
        <MetricCard
          label="Faturamento Mensal Estimado"
          value={formatCurrency(metrics.monthlyBilling)}
          subtitle={`${metrics.monthlyBillingUsers} usuários ativos/trial × planos`}
          icon={TrendingUp}
        />
        <MetricCard
          label="Receita Total"
          value={formatCurrency(metrics.totalRevenue)}
          subtitle="Pagamentos confirmados (histórico)"
          icon={DollarSign}
        />
        <MetricCard
          label="Novos Cadastros Hoje"
          value={metrics.newSignupsToday}
          icon={UserPlus}
        />
      </div>

      {metrics.monthlyBillingByPlan.length > 0 && (
        <Card className="admin-card-glass border-0 ring-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">
              Composição do faturamento mensal
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Usuários com status active ou trial, agrupados pelo plano atual
            </p>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plano</TableHead>
                  <TableHead className="text-right">Usuários</TableHead>
                  <TableHead className="text-right">Preço mensal</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.monthlyBillingByPlan.map((row) => (
                  <TableRow key={row.planId}>
                    <TableCell className="font-medium">{row.planName}</TableCell>
                    <TableCell className="text-right">{row.users}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(row.unitPrice)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(row.subtotal)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell className="font-semibold">Total</TableCell>
                  <TableCell className="text-right font-semibold">
                    {metrics.monthlyBillingUsers}
                  </TableCell>
                  <TableCell />
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(metrics.monthlyBilling)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

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
