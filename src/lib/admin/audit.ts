import { headers } from "next/headers";
import { getSupabaseAdminClient } from "@/lib/supabase/client-admin";
import { getAdminUser } from "@/lib/auth/admin";

export async function logAdminAction(
  action: string,
  resource: string,
  resourceId?: string
) {
  const adminUser = await getAdminUser();
  if (!adminUser) return;

  const headersList = await headers();
  const forwarded = headersList.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ?? headersList.get("x-real-ip") ?? null;
  const userAgent = headersList.get("user-agent");

  const admin = getSupabaseAdminClient();
  await admin.from("admin_access_logs").insert({
    user_id: adminUser.id,
    action,
    resource,
    resource_id: resourceId ?? null,
    ip_address: ip,
    user_agent: userAgent,
  });
}
