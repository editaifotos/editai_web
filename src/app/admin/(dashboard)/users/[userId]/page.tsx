import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { getSupabaseAdminClient } from "@/lib/supabase/client-admin";
import { UserProfileForm } from "@/components/admin/UserProfileForm";

export default async function AdminUserProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const admin = getSupabaseAdminClient();

  const [userResult, subscriptionResult, plansResult, editStatsResult, recentEditsResult] =
    await Promise.all([
      admin
        .from("users")
        .select(
          "id, name, email, role, subscription_status, credits_balance, created_at, current_plan_id, trial_ends_at"
        )
        .eq("id", userId)
        .single(),
      admin
        .from("subscriptions")
        .select("id, plan_id, status, started_at, ends_at, canceled_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      admin.from("plans").select("id, name").eq("is_active", true),
      admin.rpc("get_user_edit_stats", { p_user_id: userId }),
      admin
        .from("edits")
        .select(
          "id, operation_type, status, created_at, prompt_text_original, prompt_text, image_url, edit_category, edit_goal, credits_used"
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

  const { data: user, error } = userResult;

  if (error || !user) {
    notFound();
  }

  const { data: subscription } = subscriptionResult;
  const { data: plans } = plansResult;
  const { data: editStats } = editStatsResult;
  const { data: recentEdits } = recentEditsResult ?? { data: [] };

  const { data: plan } = user.current_plan_id
    ? await admin.from("plans").select("id, name").eq("id", user.current_plan_id).single()
    : { data: null };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/users">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="size-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Perfil do usuário</h1>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
      </div>
      <UserProfileForm
        user={user}
        subscription={subscription ?? null}
        plan={plan}
        plans={plans ?? []}
        editStats={editStats ?? null}
        recentEdits={recentEdits ?? []}
      />
    </div>
  );
}
