import { getSupabaseAdminClient } from "@/lib/supabase/client-admin";

export interface CreditPackForPurchase {
  id: string;
  name: string;
  credits: number;
  price: number;
}

/**
 * Busca pacote de créditos por ID para compra.
 * Retorna dados do pacote se ativo.
 */
export async function getCreditPackForPurchase(
  packId: string
): Promise<CreditPackForPurchase | null> {
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase
    .from("credit_packs")
    .select("id, name, credits, price")
    .eq("id", packId)
    .eq("is_active", true)
    .single();

  if (error || !data) {
    return null;
  }

  const price = Number(data.price);
  if (!price || price <= 0) {
    return null;
  }

  return {
    id: data.id,
    name: data.name ?? "Pacote de créditos",
    credits: Number(data.credits) || 0,
    price,
  };
}
