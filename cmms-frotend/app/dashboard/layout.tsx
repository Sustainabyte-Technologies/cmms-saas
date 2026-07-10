"use client";

import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { AppNavbar } from "@/components/dashboard/app-navbar";
import { RoleProvider } from "@/contexts/role-context";
import { Suspense } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleProvider>
      <div className="min-h-screen bg-secondary flex flex-col">
        {/* Top Navbar */}
        <AppNavbar />

        <div className="flex flex-1">
          {/* Sidebar - Hidden on mobile, shown via sheet */}
          <div className="hidden lg:block shrink-0">
            <Suspense fallback={<div className="w-[260px] bg-sidebar animate-pulse h-[calc(100vh-80px)] border-r border-sidebar-border" />}>
              <AppSidebar />
            </Suspense>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <main className="p-4 lg:p-6">{children}</main>
          </div>
        </div>
      </div>
    </RoleProvider>
  );
}
