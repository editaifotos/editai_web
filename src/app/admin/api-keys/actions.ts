"use server";

import { randomBytes } from "crypto";
import { createHash } from "crypto";
import { revalidatePath } from "next/cache";
import { getSupabaseAdminClient } from "@/lib/supabase/client-admin";
import { requireAdmin } from "@/lib/auth/admin";

function generateApiKey(): string {
  const prefix = "ed_";
  const random = randomBytes(32).toString("hex");
  return `${prefix}${random}`;
}

export async function createApiKey(
  name: string,
  scopes: string[]
): Promise<{ key: string } | null> {
  await requireAdmin();
  const admin = getSupabaseAdminClient();

  const rawKey = generateApiKey();
  const keyHash = createHash("sha256").update(rawKey).digest("hex");
  const keyPrefix = rawKey.slice(0, 11);

  await admin.from("api_keys").insert({
    key_hash: keyHash,
    key_prefix: keyPrefix,
    name,
    scopes: scopes.length > 0 ? scopes : ["users:read", "stats:read"],
    status: "active",
    rate_limit_per_minute: 60,
    environment: "production",
  });

  revalidatePath("/admin/api-keys");
  return { key: rawKey };
}

export async function revokeApiKey(id: string) {
  await requireAdmin();
  const admin = getSupabaseAdminClient();

  await admin
    .from("api_keys")
    .update({ status: "inactive", revoked_at: new Date().toISOString() })
    .eq("id", id);

  revalidatePath("/admin/api-keys");
}
