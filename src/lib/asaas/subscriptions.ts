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
    cpfCnpj: string;
    postalCode: string;
    addressNumber: string;
    addressComplement?: string | null;
    phone: string;
    mobilePhone: string;
  };
  remoteIp: string;
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
  const today = new Date();
  const nextDueDate = today.toISOString().split("T")[0];

  const body = {
    customer: params.customerId,
    billingType: "CREDIT_CARD",
    value: params.value,
    nextDueDate,
    cycle: "MONTHLY",
    description: params.description,
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
    creditCardHolderInfo: {
      name: params.creditCardHolderInfo.name.trim(),
      email: params.creditCardHolderInfo.email.trim(),
      cpfCnpj: params.creditCardHolderInfo.cpfCnpj.replace(/\D/g, ""),
      postalCode: params.creditCardHolderInfo.postalCode.replace(/\D/g, ""),
      addressNumber: params.creditCardHolderInfo.addressNumber.trim(),
      addressComplement: params.creditCardHolderInfo.addressComplement?.trim() ?? null,
      phone: params.creditCardHolderInfo.phone.replace(/\D/g, ""),
      mobilePhone: params.creditCardHolderInfo.mobilePhone.replace(/\D/g, ""),
    },
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
