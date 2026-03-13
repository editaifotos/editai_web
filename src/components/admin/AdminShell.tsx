"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { AdminHeader } from "./AdminHeader";

interface AdminShellProps {
  children: React.ReactNode;
  userEmail?: string;
  userName?: string;
  userAvatar?: string;
}

export function AdminShell({
  children,
  userEmail,
  userName,
  userAvatar,
}: AdminShellProps) {
  return (
    <SidebarProvider className="admin-layout">
      <AppSidebar
        userEmail={userEmail}
        userName={userName}
        userAvatar={userAvatar}
      />
      <SidebarInset>
        <AdminHeader
          userEmail={userEmail}
          userName={userName}
          userAvatar={userAvatar}
        />
        <div className="flex flex-1 flex-col overflow-auto bg-gradient-to-br from-background to-muted/20 p-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
