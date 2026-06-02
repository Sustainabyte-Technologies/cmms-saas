"use client";

import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { AppNavbar } from "@/components/dashboard/app-navbar";
import { RoleProvider } from "@/contexts/role-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleProvider>
      <div className="min-h-screen bg-secondary">
        {/* Sidebar - Hidden on mobile, shown via sheet */}
        <div className="hidden lg:block">
          <AppSidebar />
        </div>

        {/* Main Content */}
        <div className="lg:pl-[260px]">
          <AppNavbar />
          <main className="p-4 lg:p-6">{children}</main>
        </div>
      </div>
    </RoleProvider>
  );
}
