import {
  getOrCreateCustomer,
  type CreateCustomerParams,
} from "@/lib/asaas/customers";
import { createSubscriptionWithCard } from "@/lib/asaas/subscriptions";
import { getPlanForCheckout } from "./plan-service";
import {
  isValidCardExpiry,
  isValidCardNumber,
  isValidCep,
  isValidCpf,
  isValidCvv,
  isValidEmail,
  isValidName,
  isValidPhone,
  normalizeCep,
  normalizeCpf,
  normalizePhone,
} from "@/utils/validation";

export interface CreateCheckoutInput {
  planId: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  foreignCustomer?: boolean;
  creditCard: {
    holderName: string;
    number: string;
    expiry: string;
    ccv: string;
  };
  address: {
    postalCode: string;
    number: string;
    complement?: string | null;
  };
  remoteIp: string;
}

export interface CreateCheckoutResult {
  success: true;
}

export interface CreateCheckoutError {
  success: false;
  error: string;
}

export type CreateCheckoutOutput = CreateCheckoutResult | CreateCheckoutError;

export async function createCheckout(
  input: CreateCheckoutInput
): Promise<CreateCheckoutOutput> {
  const name = input.name?.trim() ?? "";
  const email = input.email?.trim() ?? "";
  const phone = input.phone ?? "";
  const cpf = input.cpf ?? "";
  const planId = input.planId ?? "";
  const card = input.creditCard;
  const address = input.address;

  if (!isValidName(name)) {
    return { success: false, error: "Nome inválido. Informe entre 2 e 200 caracteres." };
  }
  if (!isValidEmail(email)) {
    return { success: false, error: "E-mail inválido." };
  }
  if (!isValidPhone(phone)) {
    return { success: false, error: "Telefone inválido. Informe 10 ou 11 dígitos." };
  }
  const isForeign = !!input.foreignCustomer;
  if (!isForeign && !isValidCpf(cpf)) {
    return { success: false, error: "CPF inválido." };
  }
  if (!planId || typeof planId !== "string") {
    return { success: false, error: "Plano não informado." };
  }

  if (!isValidCardNumber(card?.number ?? "")) {
    return { success: false, error: "Número do cartão inválido." };
  }
  if (!isValidCardExpiry(card?.expiry ?? "")) {
    return { success: false, error: "Validade do cartão inválida." };
  }
  if (!isValidCvv(card?.ccv ?? "")) {
    return { success: false, error: "CVV inválido." };
  }
  if (!card?.holderName?.trim() || card.holderName.trim().length < 2) {
    return { success: false, error: "Nome no cartão inválido." };
  }
  if (!isValidCep(address?.postalCode ?? "")) {
    return { success: false, error: "CEP inválido." };
  }
  if (!address?.number?.trim()) {
    return { success: false, error: "Número do endereço é obrigatório." };
  }

  const plan = await getPlanForCheckout(planId);
  if (!plan) {
    return { success: false, error: "Plano não encontrado ou inativo." };
  }

  const cpfDigits = isForeign ? "" : normalizeCpf(cpf);
  const phoneDigits = normalizePhone(phone);
  const cepDigits = normalizeCep(address.postalCode);

  const expiryDigits = (card.expiry ?? "").replace(/\D/g, "");
  const expiryMonth = expiryDigits.slice(0, 2);
  const expiryYear = expiryDigits.slice(2);

  const customerParams: CreateCustomerParams = {
    name,
    cpfCnpj: isForeign ? undefined : cpfDigits,
    email,
    phone: phoneDigits,
    foreignCustomer: isForeign ? true : undefined,
  };

  const customerId = await getOrCreateCustomer(customerParams);

  const result = await createSubscriptionWithCard({
    customerId,
    value: plan.value,
    description: plan.name,
    foreignCustomer: isForeign,
    creditCard: {
      holderName: card.holderName.trim(),
      number: card.number.replace(/\D/g, ""),
      expiryMonth,
      expiryYear,
      ccv: card.ccv.replace(/\D/g, ""),
    },
    creditCardHolderInfo: {
      name,
      email,
      cpfCnpj: cpfDigits || undefined,
      postalCode: cepDigits,
      addressNumber: address.number.trim(),
      addressComplement: address.complement?.trim() ?? null,
      phone: phoneDigits,
      mobilePhone: phoneDigits,
    },
    remoteIp: input.remoteIp || "127.0.0.1",
  });

  if (!result.success) {
    return { success: false, error: result.error };
  }

  return { success: true };
}
