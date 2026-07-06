import { getSupabaseAdminClient } from "@/lib/supabase/client-admin";

export type MonthlyBillingPlanRow = {
  planId: string;
  planName: string;
  users: number;
  unitPrice: number;
  subtotal: number;
};

export type DashboardMetrics = {
  totalUsers: number;
  activeSubscriptionUsers: number;
  totalRevenue: number;
  newSignupsToday: number;
  monthlyBilling: number;
  monthlyBillingUsers: number;
  monthlyBillingByPlan: MonthlyBillingPlanRow[];
};

function resolvePlanMonthlyPrice(plan: {
  monthly_price: number | null;
  price: number | null;
}): number {
  const monthly = Number(plan.monthly_price);
  const price = Number(plan.price);
  if (monthly > 0) return monthly;
  if (price > 0) return price;
  return 0;
}

async function getMonthlyBillingFromActiveUsers(
  admin: ReturnType<typeof getSupabaseAdminClient>
): Promise<{
  total: number;
  userCount: number;
  byPlan: MonthlyBillingPlanRow[];
}> {
  const [{ data: activeUsers }, { data: plans }] = await Promise.all([
    admin
      .from("users")
      .select("current_plan_id")
      .in("subscription_status", ["active", "trial"]),
    admin.from("plans").select("id, name, monthly_price, price"),
  ]);

  const planMap = new Map(
    (plans ?? []).map((plan) => [
      plan.id,
      {
        name: plan.name ?? "Plano",
        unitPrice: resolvePlanMonthlyPrice(plan),
      },
    ])
  );

  const counts = new Map<string, number>();
  for (const user of activeUsers ?? []) {
    if (!user.current_plan_id) continue;
    counts.set(
      user.current_plan_id,
      (counts.get(user.current_plan_id) ?? 0) + 1
    );
  }

  const byPlan: MonthlyBillingPlanRow[] = [];
  let total = 0;
  let userCount = 0;

  for (const [planId, users] of counts) {
    const plan = planMap.get(planId);
    const unitPrice = plan?.unitPrice ?? 0;
    const subtotal = users * unitPrice;
    total += subtotal;
    userCount += users;
    byPlan.push({
      planId,
      planName: plan?.name ?? "Plano",
      users,
      unitPrice,
      subtotal,
    });
  }

  byPlan.sort((a, b) => b.subtotal - a.subtotal);

  return { total, userCount, byPlan };
}

/** Usuários elegíveis para faturamento: status active ou trial na tabela users. */
async function countActiveBillableUsers(
  admin: ReturnType<typeof getSupabaseAdminClient>
): Promise<number> {
  const { count, error } = await admin
    .from("users")
    .select("id", { count: "exact", head: true })
    .in("subscription_status", ["active", "trial"]);

  if (error) {
    console.error("[countActiveBillableUsers]", error);
    return 0;
  }

  return count ?? 0;
}

function getStartOfTodayBrazilIso(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;

  // Meia-noite em America/Sao_Paulo
  return `${year}-${month}-${day}T00:00:00-03:00`;
}

function getStartOfMonthBrazilIso(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value;

  return `${year}-${month}-01T00:00:00-03:00`;
}

function getPaymentReferenceDate(payment: {
  paid_at: string | null;
  created_at: string | null;
}): string | null {
  return payment.paid_at ?? payment.created_at;
}

async function sumPaidPayments(
  admin: ReturnType<typeof getSupabaseAdminClient>,
  paidAfter?: string
): Promise<number> {
  let total = 0;
  let from = 0;
  const pageSize = 1000;

  while (true) {
    let query = admin
      .from("payments")
      .select("amount, paid_at, created_at")
      .eq("payment_status", "paid");

    const { data, error } = await query.range(from, from + pageSize - 1);

    if (error) {
      console.error("[sumPaidPayments]", error);
      break;
    }

    if (!data?.length) break;

    for (const row of data) {
      if (paidAfter) {
        const referenceDate = getPaymentReferenceDate(row);
        if (!referenceDate || referenceDate < paidAfter) continue;
      }
      total += Number(row.amount || 0);
    }

    if (data.length < pageSize) break;
    from += pageSize;
  }

  return total;
}

/** Métricas agregadas do dashboard admin (consultas alinhadas ao banco). */
export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const admin = getSupabaseAdminClient();
  const todayStart = getStartOfTodayBrazilIso();

  const [
    { count: totalUsers },
    { count: newSignupsToday },
    activeSubscriptionUsers,
  ] = await Promise.all([
    admin.from("users").select("id", { count: "exact", head: true }),
    admin
      .from("users")
      .select("id", { count: "exact", head: true })
      .gte("created_at", todayStart),
    countActiveBillableUsers(admin),
  ]);

  const [totalRevenue, monthlyBillingData] = await Promise.all([
    sumPaidPayments(admin),
    getMonthlyBillingFromActiveUsers(admin),
  ]);

  // Garante consistência entre card e faturamento mensal (mesma regra de usuários)
  const billableUsers = monthlyBillingData.userCount || activeSubscriptionUsers;

  return {
    totalUsers: totalUsers ?? 0,
    activeSubscriptionUsers: billableUsers,
    totalRevenue,
    newSignupsToday: newSignupsToday ?? 0,
    monthlyBilling: monthlyBillingData.total,
    monthlyBillingUsers: monthlyBillingData.userCount,
    monthlyBillingByPlan: monthlyBillingData.byPlan,
  };
}

export type FinanceMetrics = {
  totalRevenue: number;
  monthlyRevenue: number;
  monthlyBilling: number;
  monthlyBillingUsers: number;
  monthlyBillingByPlan: MonthlyBillingPlanRow[];
  activeSubscriptionUsers: number;
  canceledSubscriptions: number;
  totalUsers: number;
};

export async function getFinanceMetrics(): Promise<FinanceMetrics> {
  const admin = getSupabaseAdminClient();
  const startOfMonth = getStartOfMonthBrazilIso();

  const [
    { count: canceledSubs },
    { count: totalUsers },
    activeSubscriptionUsers,
  ] = await Promise.all([
    admin
      .from("subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("status", "canceled"),
    admin.from("users").select("id", { count: "exact", head: true }),
    countActiveBillableUsers(admin),
  ]);

  const [totalRevenue, monthlyRevenue, monthlyBillingData] = await Promise.all([
    sumPaidPayments(admin),
    sumPaidPayments(admin, startOfMonth),
    getMonthlyBillingFromActiveUsers(admin),
  ]);

  return {
    totalRevenue,
    monthlyRevenue,
    monthlyBilling: monthlyBillingData.total,
    monthlyBillingUsers: monthlyBillingData.userCount,
    monthlyBillingByPlan: monthlyBillingData.byPlan,
    activeSubscriptionUsers,
    canceledSubscriptions: canceledSubs ?? 0,
    totalUsers: totalUsers ?? 0,
  };
}
