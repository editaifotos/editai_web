"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdminClient } from "@/lib/supabase/client-admin";
import { requireAdmin } from "@/lib/auth/admin";
import { logAdminAction } from "@/lib/admin/audit";

export async function updateUser(userId: string, formData: FormData) {
  await requireAdmin();
  const admin = getSupabaseAdminClient();

  const name = formData.get("name") as string | null;
  const email = formData.get("email") as string | null;

  const updates: Record<string, unknown> = {};
  if (name !== null && name !== undefined) updates.name = name;
  if (email !== null && email !== undefined) updates.email = email;

  if (Object.keys(updates).length === 0) return;

  await admin.from("users").update(updates).eq("id", userId);
  await logAdminAction("update", "user", userId);
  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/admin/users");
}

export async function updateUserPlan(userId: string, planId: string) {
  await requireAdmin();
  const admin = getSupabaseAdminClient();

  await admin.from("users").update({ current_plan_id: planId }).eq("id", userId);

  const { data: existing } = await admin
    .from("subscriptions")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();

  if (existing) {
    await admin
      .from("subscriptions")
      .update({ plan_id: planId })
      .eq("id", existing.id);
  } else {
    await admin.from("subscriptions").insert({
      user_id: userId,
      plan_id: planId,
      status: "active",
    });
  }

  await logAdminAction("update_plan", "user", userId);
  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/admin/users");
}

export async function updateUserStatus(userId: string, status: string) {
  await requireAdmin();
  const admin = getSupabaseAdminClient();

  const validStatuses = ["active", "canceled", "expired", "trial", "trialing"];
  if (!validStatuses.includes(status)) {
    return { error: "Status inválido" };
  }

  const { error } = await admin
    .from("users")
    .update({ subscription_status: status })
    .eq("id", userId);

  if (error) {
    console.error("[updateUserStatus]", error);
    return { error: error.message };
  }

  if (status === "canceled") {
    await admin
      .from("subscriptions")
      .update({ status: "canceled", canceled_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("status", "active");
  }

  await logAdminAction("update_status", "user", userId);
  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/admin/users");
  return { success: true };
}

/** Server Action para uso direto no form action - recebe FormData */
export async function updateUserStatusFromForm(userId: string, formData: FormData) {
  const status = formData.get("status");
  if (typeof status !== "string" || !status.trim()) {
    return { error: "Selecione um status" };
  }
  return updateUserStatus(userId, status.trim());
}

export async function resetUserPassword(userId: string) {
  await requireAdmin();
  const admin = getSupabaseAdminClient();

  const { data: userRow } = await admin.from("users").select("email").eq("id", userId).single();
  const email = userRow?.email;
  if (!email) return;

  const { data } = await admin.auth.admin.generateLink({
    type: "recovery",
    email,
  });

  if (data?.properties?.action_link) {
    // Em produção, o Supabase envia o email automaticamente
    return { link: data.properties.action_link };
  }
}
