import { MetricCard } from "./MetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { MonthlyBillingPlanRow } from "@/lib/admin/dashboard-metrics";
import { DollarSign, CreditCard, Users, XCircle, TrendingUp } from "lucide-react";

type Metrics = {
  totalRevenue: number;
  monthlyRevenue: number;
  monthlyBilling: number;
  monthlyBillingUsers: number;
  monthlyBillingByPlan: MonthlyBillingPlanRow[];
  activeSubscriptions: number;
  canceledSubscriptions: number;
  totalUsers: number;
};

export function FinanceDashboard({ metrics }: { metrics: Metrics }) {
  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
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
          label="Receita Recebida no Mês"
          value={formatCurrency(metrics.monthlyRevenue)}
          subtitle="Pagamentos paid neste mês (created_at)"
          icon={DollarSign}
        />
        <MetricCard
          label="Usuários ativos / trial"
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

      {metrics.monthlyBillingByPlan.length > 0 && (
        <Card className="admin-card-glass border-0 ring-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">
              Composição do faturamento mensal
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Projeção com base nos usuários active/trial e preço mensal do plano
              atual
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
    </div>
  );
}
