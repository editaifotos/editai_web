import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

type Plan = {
  id: string;
  name: string;
  monthly_price: number;
  yearly_price: number | null;
  is_active: boolean;
};

export function PlansList({
  plans,
  planUserCounts,
}: {
  plans: Plan[];
  planUserCounts: Map<string, number>;
}) {
  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {plans.map((plan) => (
        <Card key={plan.id}>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <h3 className="font-semibold">{plan.name}</h3>
              <Badge variant={plan.is_active ? "default" : "secondary"}>
                {plan.is_active ? "Ativo" : "Inativo"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Mensal: {formatCurrency(Number(plan.monthly_price))}
            </p>
            {plan.yearly_price != null && (
              <p className="text-sm text-muted-foreground">
                Anual: {formatCurrency(Number(plan.yearly_price))}
              </p>
            )}
            <p className="font-medium">
              {planUserCounts.get(plan.id) ?? 0} usuários ativos
            </p>
            <Link href={`/admin/users?plan=${plan.id}`}>
              <Button variant="outline" size="sm">
                Ver usuários
                <ChevronRight className="size-4 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
