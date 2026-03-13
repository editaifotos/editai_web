import { getTodayBrazil } from "@/utils/date";
import { asaasFetch } from "./client";

export interface CreateSubscriptionWithCardParams {
  customerId: string;
  value: number;
  description: string;
  creditCard: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
  };
  creditCardHolderInfo: {
    name: string;
    email: string;
    cpfCnpj?: string;
    postalCode: string;
    addressNumber: string;
    addressComplement?: string | null;
    phone: string;
    mobilePhone: string;
  };
  remoteIp: string;
  foreignCustomer?: boolean;
}

export interface AsaasSubscriptionResponse {
  id: string;
  object: string;
  dateCreated: string;
  customer: string;
  billingType: string;
  value: number;
  nextDueDate: string;
  cycle: string;
  description: string;
  status: string;
}

/**
 * Cria assinatura recorrente mensal com cartão de crédito.
 * Cobrança imediata (nextDueDate = hoje).
 * Timeout 60s conforme recomendação Asaas.
 */
export async function createSubscriptionWithCard(
  params: CreateSubscriptionWithCardParams
): Promise<{ success: true; subscriptionId: string } | { success: false; error: string }> {
  const nextDueDate = getTodayBrazil();

  const holder = params.creditCardHolderInfo;
  const creditCardHolderBody: Record<string, unknown> = {
    name: holder.name.trim(),
    email: holder.email.trim(),
    postalCode: holder.postalCode.replace(/\D/g, ""),
    addressNumber: holder.addressNumber.trim(),
    addressComplement: holder.addressComplement?.trim() ?? null,
    phone: holder.phone.replace(/\D/g, ""),
    mobilePhone: holder.mobilePhone.replace(/\D/g, ""),
  };
  if (!params.foreignCustomer && holder.cpfCnpj) {
    creditCardHolderBody.cpfCnpj = holder.cpfCnpj.replace(/\D/g, "");
  }

  const body = {
    customer: params.customerId,
    billingType: "CREDIT_CARD",
    value: params.value,
    nextDueDate,
    cycle: "MONTHLY",
    description: params.description,
    externalReference: "Assinatura Editai APP",
    creditCard: {
      holderName: params.creditCard.holderName.trim(),
      number: params.creditCard.number.replace(/\D/g, ""),
      expiryMonth: params.creditCard.expiryMonth.replace(/\D/g, "").padStart(2, "0"),
      expiryYear: (() => {
        const y = params.creditCard.expiryYear.replace(/\D/g, "");
        return y.length === 2 ? `20${y}` : y.slice(-4);
      })(),
      ccv: params.creditCard.ccv.replace(/\D/g, ""),
    },
    creditCardHolderInfo: creditCardHolderBody,
    remoteIp: params.remoteIp,
  };

  try {
    const response = await asaasFetch<AsaasSubscriptionResponse>(
      "/v3/subscriptions",
      {
        method: "POST",
        body,
        timeoutMs: 60000,
      }
    );
    return { success: true, subscriptionId: response.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao processar pagamento.";
    return { success: false, error: message };
  }
}
