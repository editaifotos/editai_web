import { asaasFetch } from "./client";
import type { AsaasCustomerListResponse } from "@/types/checkout";

export interface CreateCustomerParams {
  name: string;
  cpfCnpj?: string;
  email: string;
  phone: string;
  foreignCustomer?: boolean;
}

export interface AsaasCustomerCreated {
  id: string;
  name: string;
  email: string;
  cpfCnpj: string;
}

/**
 * Busca cliente no Asaas por email.
 * Retorna o primeiro cliente encontrado ou null se não existir.
 */
export async function findCustomerByEmail(email: string): Promise<string | null> {
  const trimmed = email.trim();
  if (!trimmed) return null;
  const response = await asaasFetch<AsaasCustomerListResponse>(
    `/v3/customers?email=${encodeURIComponent(trimmed)}&limit=1`
  );

  if (response.totalCount === 0 || !response.data?.length) {
    return null;
  }

  return response.data[0].id;
}

/**
 * Cria cliente no Asaas.
 * Retorna o ID do cliente criado.
 */
export async function createCustomer(
  params: CreateCustomerParams
): Promise<string> {
  const phoneDigits = params.phone.replace(/\D/g, "");
  const body: Record<string, unknown> = {
    name: params.name.trim(),
    email: params.email.trim(),
    phone: phoneDigits,
    mobilePhone: phoneDigits,
    notificationDisabled: true,
  };

  if (params.foreignCustomer) {
    body.foreignCustomer = true;
    // Cliente estrangeiro: sem CPF/CNPJ conforme orientação Asaas
  } else {
    const cpfDigits = (params.cpfCnpj ?? "").replace(/\D/g, "");
    if (!cpfDigits) {
      throw new Error("CPF/CNPJ é obrigatório para clientes não estrangeiros.");
    }
    body.cpfCnpj = cpfDigits;
  }

  const response = await asaasFetch<AsaasCustomerCreated>("/v3/customers", {
    method: "POST",
    body,
  });

  return response.id;
}

/**
 * Obtém ou cria cliente no Asaas por email.
 * Retorna o ID do cliente (existente ou recém-criado).
 */
export async function getOrCreateCustomer(
  params: CreateCustomerParams
): Promise<string> {
  const existingId = await findCustomerByEmail(params.email);
  if (existingId) {
    return existingId;
  }
  return createCustomer(params);
}
