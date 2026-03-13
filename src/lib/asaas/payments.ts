import { getTodayBrazil } from "@/utils/date";
import { asaasFetch } from "./client";

export interface CreatePaymentWithCardParams {
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

export interface AsaasPaymentResponse {
  id: string;
  dateCreated: string;
  customer: string;
  value: number;
  billingType: string;
  status: string;
}

/**
 * Cria cobrança com cartão de crédito (captura imediata).
 * Timeout 60s conforme recomendação Asaas.
 */
export async function createPaymentWithCard(
  params: CreatePaymentWithCardParams
): Promise<{ success: true; paymentId: string } | { success: false; error: string }> {
  const dueDate = getTodayBrazil();

  const body = {
    customer: params.customerId,
    billingType: "CREDIT_CARD",
    value: params.value,
    dueDate,
    description: params.description,
    externalReference: "Credito Extra Editai APP",
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
    const response = await asaasFetch<AsaasPaymentResponse>("/v3/payments", {
      method: "POST",
      body,
      timeoutMs: 60000,
    });
    return { success: true, paymentId: response.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao processar pagamento.";
    return { success: false, error: message };
  }
}

export interface CreatePaymentWithPixParams {
  customerId: string;
  value: number;
  description: string;
}

export interface AsaasPixQrCodeResponse {
  encodedImage: string;
  payload: string;
  expirationDate: string;
  description?: string;
}

/**
 * Cria cobrança PIX.
 * Retorna o ID da cobrança para obter o QR Code.
 */
export async function createPaymentWithPix(
  params: CreatePaymentWithPixParams
): Promise<{ success: true; paymentId: string } | { success: false; error: string }> {
  const dueDate = getTodayBrazil();

  const body = {
    customer: params.customerId,
    billingType: "PIX",
    value: params.value,
    dueDate,
    description: params.description,
    externalReference: "Credito Extra Editai APP",
  };

  try {
    const response = await asaasFetch<AsaasPaymentResponse>("/v3/payments", {
      method: "POST",
      body,
    });
    return { success: true, paymentId: response.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao criar cobrança PIX.";
    return { success: false, error: message };
  }
}

/**
 * Obtém QR Code PIX de uma cobrança.
 * Retorna imagem base64, payload (copia e cola) e data de expiração.
 */
export async function getPixQrCode(
  paymentId: string
): Promise<
  | { success: true; data: AsaasPixQrCodeResponse }
  | { success: false; error: string }
> {
  try {
    const response = await asaasFetch<AsaasPixQrCodeResponse>(
      `/v3/payments/${paymentId}/pixQrCode`
    );
    return { success: true, data: response };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao obter QR Code PIX.";
    return { success: false, error: message };
  }
}

/**
 * Recupera status de uma cobrança.
 */
export async function getPaymentStatus(
  paymentId: string
): Promise<
  | { success: true; status: string }
  | { success: false; error: string }
> {
  try {
    const response = await asaasFetch<AsaasPaymentResponse>(
      `/v3/payments/${paymentId}`
    );
    return { success: true, status: response.status };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao consultar cobrança.";
    return { success: false, error: message };
  }
}
