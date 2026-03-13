import { requireAdminAndGetUser } from "@/lib/auth/admin";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adminUser = await requireAdminAndGetUser();

  return (
    <AdminShell
      userEmail={adminUser.email}
      userName={adminUser.name ?? undefined}
      userAvatar={adminUser.avatarUrl ?? undefined}
    >
      {children}
    </AdminShell>
  );
}
