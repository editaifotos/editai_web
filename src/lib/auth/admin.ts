import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/client-server";
import { getSupabaseAdminClient } from "@/lib/supabase/client-admin";

/**
 * Verifica se o email está na whitelist de admins autorizados.
 * Usa admin client pois admin_email_whitelist tem RLS restritivo.
 */
export async function isEmailWhitelisted(email: string): Promise<boolean> {
  const admin = getSupabaseAdminClient();
  const { data, error } = await admin
    .from("admin_email_whitelist")
    .select("id")
    .eq("email", email.toLowerCase().trim())
    .maybeSingle();

  return !error && !!data;
}

/**
 * Verifica se o usuário atual é um administrador autorizado.
 * Condições: role=admin E email na whitelist.
 */
export async function isAdmin(): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user?.email) {
    return false;
  }

  const admin = getSupabaseAdminClient();
  const { data: userData, error } = await admin
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error || !userData || userData.role !== "admin") {
    return false;
  }

  return isEmailWhitelisted(user.email);
}

export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  isAdmin: true;
}

/**
 * Obtém o usuário admin atual.
 * Retorna null se não autenticado, não for admin ou não estiver na whitelist.
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user?.email) {
    return null;
  }

  const admin = getSupabaseAdminClient();
  const { data: userData, error } = await admin
    .from("users")
    .select("role, name, avatar_url")
    .eq("id", user.id)
    .single();

  if (error || !userData || userData.role !== "admin") {
    return null;
  }

  const whitelisted = await isEmailWhitelisted(user.email);
  if (!whitelisted) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: userData.name ?? null,
    avatarUrl: userData.avatar_url ?? null,
    isAdmin: true,
  };
}

/**
 * Protege uma rota admin.
 * Redireciona para /admin/login se não for admin autorizado.
 */
export async function requireAdmin(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/admin/login");
  }

  const admin = getSupabaseAdminClient();
  const { data: userData, error } = await admin
    .from("users")
    .select("role, email")
    .eq("id", user.id)
    .single();

  if (error || !userData) {
    redirect("/admin/login?error=not_found");
  }

  if (userData.role !== "admin") {
    redirect("/admin/login?error=not_admin");
  }

  const whitelisted = await isEmailWhitelisted(
    userData.email ?? user.email ?? ""
  );
  if (!whitelisted) {
    redirect("/admin/login?error=not_whitelisted");
  }
}
