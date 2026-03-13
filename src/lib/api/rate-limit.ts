import { getSupabaseAdminClient } from "@/lib/supabase/client-admin";
import type { ApiKeyRecord } from "./validate-api-key";

export async function checkRateLimit(
  apiKey: ApiKeyRecord
): Promise<{ allowed: true } | { allowed: false; retryAfter?: number }> {
  const admin = getSupabaseAdminClient();
  const now = new Date();
  const windowStart = new Date(now);
  windowStart.setSeconds(0, 0);

  const { data: existing } = await admin
    .from("api_rate_limits")
    .select("count")
    .eq("api_key_id", apiKey.id)
    .eq("window_start", windowStart.toISOString())
    .maybeSingle();

  const currentCount = existing?.count ?? 0;
  const limit = apiKey.rate_limit_per_minute;

  if (currentCount >= limit) {
    const retryAfter = 60 - now.getSeconds();
    return { allowed: false, retryAfter };
  }

  if (existing) {
    await admin
      .from("api_rate_limits")
      .update({ count: currentCount + 1, updated_at: now.toISOString() })
      .eq("api_key_id", apiKey.id)
      .eq("window_start", windowStart.toISOString());
  } else {
    await admin.from("api_rate_limits").insert({
      api_key_id: apiKey.id,
      window_start: windowStart.toISOString(),
      count: 1,
    });
  }

  return { allowed: true };
}
