export type AdminUserRow = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  subscription_status: string;
  credits_balance: number;
  created_at: string;
  current_plan_id: string | null;
  plans: { name: string } | null;
};
