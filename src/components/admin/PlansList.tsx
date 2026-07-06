import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

type Plan = {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  monthly_price: number | null;
  yearly_price: number | null;
  duration_months: number | null;
  is_active: boolean;
  add_credit: number | null;
  credit_referral: number | null;
  max_stored_photos: number | null;
  photo_expiration_days: number | null;
  credit_expiration_days: number | null;
  link_payment: string | null;
  created_at: string;
};

function formatCurrency(value: number | null | undefined) {
  if (value == null || Number.isNaN(Number(value))) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value));
}

function resolveCheckoutPrice(plan: Plan) {
  const monthly = Number(plan.monthly_price);
  const price = Number(plan.price);
  if (monthly > 0) return monthly;
  if (price > 0) return price;
  return 0;
}

export function PlansList({
  plans,
  planUserCounts,
}: {
  plans: Plan[];
  planUserCounts: Map<string, number>;
}) {
  if (plans.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Nenhum plano cadastrado.</p>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {plans.map((plan) => {
        const checkoutPrice = resolveCheckoutPrice(plan);
        const tableMonthly = Number(plan.monthly_price);
        const promotionalPrice = Number(plan.price);
        const showPromotionalPrice =
          promotionalPrice > 0 &&
          tableMonthly > 0 &&
          promotionalPrice !== tableMonthly;

        return (
          <Card key={plan.id}>
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <div className="space-y-2">
                <h3 className="font-semibold">{plan.name}</h3>
                <Badge variant={plan.is_active ? "default" : "secondary"}>
                  {plan.is_active ? "Ativo" : "Inativo"}
                </Badge>
                {plan.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {plan.description}
                  </p>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-muted-foreground">Valor checkout: </span>
                  <span className="font-medium">
                    {formatCurrency(checkoutPrice)}
                  </span>
                </p>
                {plan.monthly_price != null && (
                  <p>
                    <span className="text-muted-foreground">Preço mensal: </span>
                    {formatCurrency(Number(plan.monthly_price))}
                  </p>
                )}
                {showPromotionalPrice && (
                  <p>
                    <span className="text-muted-foreground">Preço alternativo: </span>
                    {formatCurrency(promotionalPrice)}
                  </p>
                )}
                {plan.yearly_price != null && Number(plan.yearly_price) > 0 && (
                  <p>
                    <span className="text-muted-foreground">Anual: </span>
                    {formatCurrency(Number(plan.yearly_price))}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <p>Créditos: {plan.add_credit ?? "—"}</p>
                <p>Indicação: {plan.credit_referral ?? "—"}</p>
                <p>Fotos: {plan.max_stored_photos ?? "—"}</p>
                <p>
                  Exp. créditos:{" "}
                  {plan.credit_expiration_days != null
                    ? `${plan.credit_expiration_days}d`
                    : "—"}
                </p>
              </div>

              <p className="font-medium">
                {planUserCounts.get(plan.id) ?? 0} usuários com este plano
              </p>

              {plan.link_payment && (
                <p className="text-xs text-muted-foreground truncate">
                  Link: {plan.link_payment}
                </p>
              )}

              <Link href={`/admin/users?plan=${plan.id}`}>
                <Button variant="outline" size="sm">
                  Ver usuários
                  <ChevronRight className="size-4 ml-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
