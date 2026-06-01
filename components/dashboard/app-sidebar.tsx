"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { getNavByRole, APP_NAME } from "@/lib/constants";
import { useRole, roleConfig } from "@/contexts/role-context";
import {
  LayoutDashboard,
  Server,
  ClipboardList,
  Calendar,
  Package,
  ShoppingCart,
  Building2,
  BarChart3,
  Settings,
  Wrench,
  ChevronLeft,
  ChevronRight,
  Users,
  Shield,
  FileText,
  CalendarClock,
  CheckSquare,
  History,
  Archive,
  FileInput,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Server,
  ClipboardList,
  Calendar,
  Package,
  ShoppingCart,
  Building2,
  BarChart3,
  Settings,
  Users,
  Shield,
  FileText,
  CalendarClock,
  CheckSquare,
  History,
  Wrench,
  Archive,
  FileInput,
  CheckCircle,
};

interface AppSidebarProps {
  className?: string;
}

export function AppSidebar({ className }: AppSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { role } = useRole();
  
  const navItems = getNavByRole(role);
  const config = roleConfig[role];

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300",
        collapsed ? "w-[70px]" : "w-[260px]",
        className
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary">
            <Wrench className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold text-sidebar-foreground">{APP_NAME}</span>
          )}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Role Badge */}
      {!collapsed && (
        <div className="border-b border-sidebar-border px-4 py-3">
          <div className="rounded-lg bg-sidebar-accent/50 px-3 py-2">
            <p className="text-xs font-medium text-sidebar-foreground/60">Current Role</p>
            <p className="text-sm font-semibold text-sidebar-primary">{config.label}</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const Icon = iconMap[item.icon];
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              {Icon && <Icon className="h-5 w-5 shrink-0" />}
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sidebar-accent">
            <span className="text-sm font-medium text-sidebar-accent-foreground">{config.initials}</span>
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-sidebar-foreground">{config.userName}</p>
              <p className="truncate text-xs text-sidebar-foreground/60">{config.label}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
