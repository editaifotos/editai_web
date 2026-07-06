"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdminClient } from "@/lib/supabase/client-admin";
import { requireAdmin } from "@/lib/auth/admin";
import { logAdminAction } from "@/lib/admin/audit";
import { ADMIN_DEFAULT_RESET_PASSWORD } from "@/config/admin";
import type { AdminUserRow } from "@/lib/admin/users";
import {
  USER_EDITS_PAGE_SIZE,
  USER_EDITS_SELECT,
  type UserEditRow,
  type UserEditsPage,
} from "@/lib/admin/user-edits";

/** Lista usuários para a tabela admin. Com busca (≥2 chars), consulta todo o banco. */
export async function fetchUsersAdminList(
  search?: string,
  planId?: string
): Promise<AdminUserRow[]> {
  await requireAdmin();
  const admin = getSupabaseAdminClient();

  const term = search?.trim().replace(/,/g, "") ?? "";
  const isSearching = term.length >= 2;
  const hasPlanFilter = Boolean(planId?.trim());

  let query = admin
    .from("users")
    .select(
      "id, name, email, role, subscription_status, credits_balance, created_at, current_plan_id"
    )
    .order("created_at", { ascending: false });

  if (hasPlanFilter) {
    query = query.eq("current_plan_id", planId!.trim());
  }

  if (isSearching) {
    const pattern = `%${term}%`;
    query = query.or(`name.ilike.${pattern},email.ilike.${pattern}`).limit(100);
  } else if (hasPlanFilter) {
    query = query.limit(200);
  } else {
    query = query.limit(50);
  }

  const { data: usersData, error } = await query;
  if (error) {
    console.error("[fetchUsersAdminList]", error);
    return [];
  }

  const planIds = [
    ...new Set((usersData ?? []).map((u) => u.current_plan_id).filter(Boolean)),
  ];
  const { data: plansData } =
    planIds.length > 0
      ? await admin.from("plans").select("id, name").in("id", planIds as string[])
      : { data: [] };

  const plansMap = new Map((plansData ?? []).map((p) => [p.id, p.name]));

  return (usersData ?? []).map((u) => ({
    ...u,
    plans: u.current_plan_id
      ? { name: plansMap.get(u.current_plan_id) ?? "—" }
      : null,
  }));
}

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

export async function resetUserPassword(
  userId: string
): Promise<
  { success: true; password: string } | { success: false; error: string }
> {
  await requireAdmin();
  const admin = getSupabaseAdminClient();

  const { error } = await admin.auth.admin.updateUserById(userId, {
    password: ADMIN_DEFAULT_RESET_PASSWORD,
  });

  if (error) {
    console.error("[resetUserPassword]", error);
    return { success: false, error: error.message };
  }

  await logAdminAction("reset_password", "user", userId);
  return { success: true, password: ADMIN_DEFAULT_RESET_PASSWORD };
}

async function enrichEditsWithTaskErrors(
  admin: ReturnType<typeof getSupabaseAdminClient>,
  edits: Array<Omit<UserEditRow, "error_message" | "provider_status">>
): Promise<UserEditRow[]> {
  if (edits.length === 0) return [];

  const taskIds = [
    ...new Set(edits.map((edit) => edit.task_id).filter(Boolean)),
  ] as string[];
  const editIds = edits.map((edit) => edit.id);
  const filters: string[] = [];

  if (taskIds.length > 0) {
    filters.push(`task_id.in.(${taskIds.join(",")})`);
  }
  if (editIds.length > 0) {
    filters.push(`edit_id.in.(${editIds.join(",")})`);
  }

  if (filters.length === 0) {
    return edits.map((edit) => ({
      ...edit,
      error_message: null,
      provider_status: null,
    }));
  }

  const { data: tasks, error } = await admin
    .from("flux_tasks")
    .select("task_id, edit_id, error_message, last_provider_status")
    .or(filters.join(","));

  if (error) {
    console.error("[enrichEditsWithTaskErrors]", error);
    return edits.map((edit) => ({
      ...edit,
      error_message: null,
      provider_status: null,
    }));
  }

  const byTaskId = new Map<
    string,
    { error_message: string | null; provider_status: string | null }
  >();
  const byEditId = new Map<
    string,
    { error_message: string | null; provider_status: string | null }
  >();

  for (const task of tasks ?? []) {
    const payload = {
      error_message: task.error_message ?? null,
      provider_status: task.last_provider_status ?? null,
    };
    if (task.task_id) byTaskId.set(task.task_id, payload);
    if (task.edit_id) byEditId.set(task.edit_id, payload);
  }

  return edits.map((edit) => {
    const taskInfo =
      (edit.task_id ? byTaskId.get(edit.task_id) : undefined) ??
      byEditId.get(edit.id);

    return {
      ...edit,
      error_message: taskInfo?.error_message ?? null,
      provider_status: taskInfo?.provider_status ?? null,
    };
  });
}

export async function fetchUserEditsAdmin(
  userId: string,
  page = 1
): Promise<UserEditsPage> {
  await requireAdmin();
  const admin = getSupabaseAdminClient();

  const pageSize = USER_EDITS_PAGE_SIZE;
  const safePage = Math.max(1, Math.floor(page) || 1);
  const from = (safePage - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await admin
    .from("edits")
    .select(USER_EDITS_SELECT, { count: "exact" })
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("[fetchUserEditsAdmin]", error);
    return {
      edits: [],
      total: 0,
      page: safePage,
      pageSize,
      totalPages: 1,
    };
  }

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const edits = await enrichEditsWithTaskErrors(
    admin,
    (data ?? []) as Array<Omit<UserEditRow, "error_message" | "provider_status">>
  );

  return {
    edits,
    total,
    page: Math.min(safePage, totalPages),
    pageSize,
    totalPages,
  };
}
