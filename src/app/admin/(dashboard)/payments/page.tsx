import { Suspense } from "react";
import { PaymentsTable } from "@/components/admin/PaymentsTable";
import { getSupabaseAdminClient } from "@/lib/supabase/client-admin";

type PageProps = { searchParams: Promise<{ userId?: string }> };

export default async function AdminPaymentsPage({ searchParams }: PageProps) {
  const admin = getSupabaseAdminClient();
  const { userId: filterUserId } = await searchParams;

  let query = admin
    .from("payments")
    .select("id, user_id, amount, payment_status, payment_method, paid_at, created_at")
    .order("created_at", { ascending: false });

  if (filterUserId) {
    query = query.eq("user_id", filterUserId);
  } else {
    query = query.limit(100);
  }

  const { data: paymentsData } = await query;

  const userIds = [...new Set((paymentsData ?? []).map((p) => p.user_id))];
  const idsToFetch = filterUserId
    ? [...new Set([...userIds, filterUserId])]
    : userIds;
  const { data: usersData } =
    idsToFetch.length > 0
      ? await admin.from("users").select("id, email, name").in("id", idsToFetch)
      : { data: [] };

  const usersMap = new Map((usersData ?? []).map((u) => [u.id, u]));
  const payments = (paymentsData ?? []).map((p) => ({
    ...p,
    users: usersMap.get(p.user_id) ?? null,
  }));

  const usersForFilter = Array.from(usersMap.values())
    .map((u) => ({
      id: u.id,
      label: u.name || u.email || u.id,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pagamentos</h1>
        <p className="text-muted-foreground">
          Histórico de pagamentos dos usuários
        </p>
      </div>
      <Suspense fallback={<div className="rounded-md border h-64 animate-pulse bg-muted/20" />}>
        <PaymentsTable
          payments={payments ?? []}
          users={usersForFilter}
          initialUserId={filterUserId}
        />
      </Suspense>
    </div>
  );
}
