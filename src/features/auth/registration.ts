import { getSupabaseAdminClient } from "@/lib/supabase/client-admin";

type CompleteRegistrationInput = {
  userId: string;
  name: string;
  referralCode?: string | null;
};

type CompleteRegistrationResult =
  | { success: true }
  | { success: false; error: string };

/**
 * Executado server-side após o Supabase Auth criar o usuário.
 *
 * Responsabilidades:
 * 1. Atualiza o nome na tabela public.users (criada pelo trigger de auth)
 * 2. Se referralCode fornecido, busca o usuário que indicou
 * 3. Vincula referred_by no novo usuário
 * 4. Cria linha na tabela referrals
 */
export async function completeRegistration({
  userId,
  name,
  referralCode,
}: CompleteRegistrationInput): Promise<CompleteRegistrationResult> {
  const supabase = getSupabaseAdminClient();

  try {
    let referrerId: string | null = null;

    // Passo 1 — Buscar quem indicou (se referralCode fornecido)
    if (referralCode) {
      const { data: referrer, error: referrerError } = await supabase
        .from("users")
        .select("id")
        .eq("referral_code", referralCode)
        .single();

      if (referrerError && referrerError.code !== "PGRST116") {
        // PGRST116 = nenhuma linha encontrada — ignora e prossegue sem indicação
        console.error("[registration] Erro ao buscar referrer:", referrerError);
      }

      if (referrer) {
        referrerId = referrer.id as string;
      }
    }

    // Passo 2 — Atualizar nome (e referred_by se houver indicador)
    const updatePayload: Record<string, string | null> = { name };
    if (referrerId) {
      updatePayload.referred_by = referrerId;
    }

    const { error: updateError } = await supabase
      .from("users")
      .update(updatePayload)
      .eq("id", userId);

    if (updateError) {
      console.error("[registration] Erro ao atualizar usuário:", updateError);
      return { success: false, error: "Erro ao salvar dados do usuário." };
    }

    // Passo 3 — Inserir na tabela referrals (se houver indicador)
    if (referrerId) {
      const { error: referralError } = await supabase
        .from("referrals")
        .insert({
          referrer_user_id: referrerId,
          referred_user_id: userId,
        });

      if (referralError) {
        // Falha não-crítica: conta já foi criada; loga mas não interrompe
        console.error("[registration] Erro ao criar referral:", referralError);
      }
    }

    return { success: true };
  } catch (err) {
    console.error("[registration] Erro inesperado:", err);
    return { success: false, error: "Erro interno no servidor." };
  }
}
