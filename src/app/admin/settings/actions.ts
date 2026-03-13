"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdminClient } from "@/lib/supabase/client-admin";
import { requireAdmin } from "@/lib/auth/admin";

export async function addWhitelistEmail(email: string) {
  await requireAdmin();
  const admin = getSupabaseAdminClient();

  await admin.from("admin_email_whitelist").insert({
    email: email.toLowerCase().trim(),
  });

  revalidatePath("/admin/settings");
}

export async function removeWhitelistEmail(id: string) {
  await requireAdmin();
  const admin = getSupabaseAdminClient();

  await admin.from("admin_email_whitelist").delete().eq("id", id);

  revalidatePath("/admin/settings");
}
