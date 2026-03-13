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

  if (!hasScope(validation.key, "users:read")) {
    return NextResponse.json(
      { error: "INSUFFICIENT_SCOPES", required: "users:read" },
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

  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20", 10), 100);

  const admin = getSupabaseAdminClient();
  const { data, error } = await admin
    .from("users")
    .select("id, name, email, created_at, subscription_status")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: "DATABASE_ERROR" }, { status: 500 });
  }

  return NextResponse.json({ data: data ?? [] });
}
