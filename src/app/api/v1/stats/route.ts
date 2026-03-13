import { NextResponse } from "next/server";
import { validateApiKey, hasScope } from "@/lib/api/validate-api-key";
import { checkRateLimit } from "@/lib/api/rate-limit";
import { getSupabaseAdminClient } from "@/lib/supabase/client-admin";

export async function GET(request: Request) {
  const apiKey = request.headers.get("X-API-Key");
  const validation = await validateApiKey(apiKey);

  if (!validation.valid) {
    return NextResponse.json(
      { error: validation.error, message: "Invalid or missing API key" },
      { status: 401 }
    );
  }

  if (!hasScope(validation.key, "stats:read")) {
    return NextResponse.json(
      { error: "INSUFFICIENT_SCOPES", required: "stats:read" },
      { status: 403 }
    );
  }

  const rateCheck = await checkRateLimit(validation.key);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: "RATE_LIMIT_EXCEEDED", retryAfter: rateCheck.retryAfter },
      { status: 429 }
    );
  }

  const admin = getSupabaseAdminClient();

  const [
    { count: totalUsers },
    { count: activeSubs },
    { data: payments },
  ] = await Promise.all([
    admin.from("users").select("id", { count: "exact", head: true }),
    admin.from("subscriptions").select("id", { count: "exact", head: true }).eq("status", "active"),
    admin.from("payments").select("amount").eq("payment_status", "paid"),
  ]);

  const totalRevenue = payments?.reduce((s, p) => s + Number(p.amount || 0), 0) ?? 0;

  return NextResponse.json({
    data: {
      totalUsers: totalUsers ?? 0,
      activeSubscriptions: activeSubs ?? 0,
      totalRevenue,
    },
  });
}
