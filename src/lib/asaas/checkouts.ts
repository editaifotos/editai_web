import { env } from "@/utils/env";
import { asaasFetch } from "./client";
import type { AsaasCheckoutResponse } from "@/types/checkout";

export interface CreateCheckoutParams {
  customerId: string;
  customerData?: {
    name: string;
    cpfCnpj: string;
    email: string;
    phone: string;
  };
  planName: string;
  value: number;
  planId?: string;
}

/**
 * Cria checkout com assinatura recorrente mensal no Asaas.
 * Retorna a URL do checkout para redirecionamento.
 */
export async function createSubscriptionCheckout(
  params: CreateCheckoutParams
): Promise<string> {
  const baseUrl = env.appUrl || "http://localhost:3000";
  const base = baseUrl.replace(/\/$/, "");
  const planParam = params.planId
    ? `&planId=${encodeURIComponent(params.planId)}`
    : "";
  const successUrl = `${base}/finalizeCheckout`;
  const cancelUrl = `${base}/recuseCheckout?reason=canceled${planParam}`;
  const expiredUrl = `${base}/recuseCheckout?reason=expired${planParam}`;

  const nextDueDate = new Date();
  nextDueDate.setDate(1);
  nextDueDate.setMonth(nextDueDate.getMonth() + 1);

  const endDate = new Date(nextDueDate);
  endDate.setFullYear(endDate.getFullYear() + 1);

  const body: Record<string, unknown> = {
    billingTypes: ["CREDIT_CARD"],
    chargeTypes: ["RECURRENT"],
    minutesToExpire: 30,
    callback: {
      successUrl,
      cancelUrl,
      expiredUrl,
    },
    customer: params.customerId,
    items: [
      {
        name: params.planName,
        description: "Assinatura mensal",
        quantity: 1,
        value: params.value,
      },
    ],
    subscription: {
      cycle: "MONTHLY",
      nextDueDate: nextDueDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    },
  };

  const response = await asaasFetch<AsaasCheckoutResponse>("/v3/checkouts", {
    method: "POST",
    body,
  });

  if (!response.link) {
    throw new Error("Asaas não retornou URL do checkout");
  }

  return response.link;
}
