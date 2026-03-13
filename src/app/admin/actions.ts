"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/client-server";
import { isAdmin, requireAdmin } from "@/lib/auth/admin";
import { getSupabaseAdminClient } from "@/lib/supabase/client-admin";

export async function login(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    redirect("/admin/login?error=missing_fields");
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) {
    redirect(`/admin/login?error=invalid_credentials`);
  }

  if (!data.user) {
    redirect("/admin/login?error=invalid_credentials");
  }

  const userIsAdmin = await isAdmin();

  if (!userIsAdmin) {
    await supabase.auth.signOut();
    redirect("/admin/login?error=not_authorized");
  }

  revalidatePath("/", "layout");
  redirect("/admin");
}

export async function logout() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/admin/login");
}

export type UserSearchResult = { id: string; label: string };

export async function searchUsersAdmin(query: string): Promise<UserSearchResult[]> {
  await requireAdmin();
  if (!query || query.trim().length < 2) return [];

  const admin = getSupabaseAdminClient();
  const term = query.trim().replace(/,/g, ""); // evita quebra no .or()
  const pattern = `%${term}%`;

  const { data, error } = await admin
    .from("users")
    .select("id, name, email")
    .or(`name.ilike.${pattern},email.ilike.${pattern}`)
    .limit(20);

  if (error) return [];

  return (data ?? []).map((u) => ({
    id: u.id,
    label: u.name || u.email || u.id,
  }));
}
