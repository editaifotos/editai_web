import { env } from "@/utils/env";

const ASAAS_BASE_URL =
  env.nodeEnv === "production"
    ? "https://api.asaas.com"
    : "https://api-sandbox.asaas.com";

/**
 * Obtém a chave Asaas garantindo que o $ seja preservado.
 * Em alguns ambientes o $ é removido do .env — normalizamos aqui.
 */
function getAsaasApiKey(): string {
  const raw = process.env.ASAAS_API_KEY ?? env.asaasApiKey ?? "";
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new Error(
      "ASAAS_API_KEY não configurada. Adicione no .env.local com aspas simples: ASAAS_API_KEY='$aact_hmlg_xxx'"
    );
  }
  return trimmed.startsWith("$") ? trimmed : `$${trimmed}`;
}

export interface AsaasRequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  timeoutMs?: number;
}

export async function asaasFetch<T>(
  path: string,
  options: AsaasRequestOptions = {}
): Promise<T> {
  const { method = "GET", body, timeoutMs = 15000 } = options;
  const apiKey = getAsaasApiKey();

  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  headers.set("User-Agent", "Editai-Web/1.0");
  headers.set("access_token", apiKey);

  const config: RequestInit = {
    method,
    headers,
  };

  if (body && method !== "GET") {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${ASAAS_BASE_URL}${path}`, {
    ...config,
    signal: AbortSignal.timeout(timeoutMs),
  });

  const data = (await response.json().catch(() => ({}))) as
    | T
    | { errors?: Array<{ code: string; description: string }> };

  if (!response.ok) {
    const errors = (data as { errors?: Array<{ code: string; description: string }> })
      .errors;
    const message =
      errors?.[0]?.description ?? `Asaas API error: ${response.status}`;
    console.error("[Asaas]", response.status, path, errors ?? data);
    throw new Error(message);
  }

  return data as T;
}
