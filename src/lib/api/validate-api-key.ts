import { createHash } from "crypto";
import { getSupabaseAdminClient } from "@/lib/supabase/client-admin";

export type ApiKeyRecord = {
  id: string;
  key_prefix: string;
  name: string;
  status: string;
  scopes: string[];
  rate_limit_per_minute: number;
  expires_at: string | null;
};

export async function validateApiKey(
  rawKey: string | null
): Promise<{ valid: true; key: ApiKeyRecord } | { valid: false; error: string }> {
  if (!rawKey || typeof rawKey !== "string") {
    return { valid: false, error: "API_KEY_MISSING" };
  }

  const trimmed = rawKey.trim();
  if (!trimmed) {
    return { valid: false, error: "API_KEY_MISSING" };
  }

  const keyHash = createHash("sha256").update(trimmed).digest("hex");

  const admin = getSupabaseAdminClient();
  const { data, error } = await admin
    .from("api_keys")
    .select("id, key_prefix, name, status, scopes, rate_limit_per_minute, expires_at")
    .eq("key_hash", keyHash)
    .maybeSingle();

  if (error || !data) {
    return { valid: false, error: "API_KEY_INVALID" };
  }

  if (data.status !== "active") {
    return { valid: false, error: "API_KEY_INACTIVE" };
  }

  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return { valid: false, error: "API_KEY_EXPIRED" };
  }

  return {
    valid: true,
    key: {
      id: data.id,
      key_prefix: data.key_prefix,
      name: data.name,
      status: data.status,
      scopes: data.scopes ?? [],
      rate_limit_per_minute: data.rate_limit_per_minute ?? 60,
      expires_at: data.expires_at,
    },
  };
}

export function hasScope(key: ApiKeyRecord, requiredScope: string): boolean {
  if (key.scopes.includes("*")) return true;
  return key.scopes.includes(requiredScope);
}
