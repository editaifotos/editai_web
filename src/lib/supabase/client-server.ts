import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabaseConfig } from "@/config/supabase";

/**
 * Cliente Supabase para Server Actions e Route Handlers.
 * Permite leitura e escrita de cookies (refresh de sessão).
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseConfig.url, supabaseConfig.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set({ name, value, ...options })
        );
      },
    },
  });
}

/**
 * Cliente Supabase somente leitura para Server Components.
 * Não modifica cookies (evita erro "Cookies can only be modified in a Server Action").
 * Use em páginas/layouts. Para Server Actions, use createSupabaseServerClient.
 */
export async function createSupabaseServerClientReadOnly() {
  const cookieStore = await cookies();

  return createServerClient(supabaseConfig.url, supabaseConfig.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      // setAll omitido - Server Components não podem modificar cookies
    },
  });
}

