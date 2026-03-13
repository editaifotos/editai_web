import { getSupabaseAdminClient } from "@/lib/supabase/client-admin";

export interface PlanForCheckout {
  name: string;
  value: number;
}

/**
 * Busca plano por ID para uso no checkout.
 * Retorna nome e valor mensal (monthly_price ou price como fallback).
 */
export async function getPlanForCheckout(
  planId: string
): Promise<PlanForCheckout | null> {
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase
    .from("plans")
    .select("name, monthly_price, price")
    .eq("id", planId)
    .eq("is_active", true)
    .single();

  if (error || !data) {
    return null;
  }

  const monthlyPrice = Number(data.monthly_price);
  const fallbackPrice = Number(data.price);
  const value = monthlyPrice > 0 ? monthlyPrice : fallbackPrice;

  if (!value || value <= 0) {
    return null;
  }

  return {
    name: data.name ?? "Plano",
    value,
  };
}
