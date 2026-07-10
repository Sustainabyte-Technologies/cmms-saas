"use client";

import React, { useState } from "react";
import { useRole } from "@/contexts/role-context";
import { AdminDashboard } from "@/components/dashboard/dashboards/admin-dashboard";
import { MaintenanceManagerDashboard } from "@/components/dashboard/dashboards/maintenance-manager-dashboard";
import { SiteInchargeDashboard } from "@/components/dashboard/dashboards/site-incharge-dashboard";
import { SupervisorDashboard } from "@/components/dashboard/dashboards/supervisor-dashboard";
import { TechnicianDashboard } from "@/components/dashboard/dashboards/technician-dashboard";
import { InventoryManagerDashboard } from "@/components/dashboard/dashboards/inventory-manager-dashboard";
import { PurchaseManagerDashboard } from "@/components/dashboard/dashboards/purchase-manager-dashboard";

// Import other views (without FutureSmartViews)
import {
  OperationsView,
  AssetView,
  WorkOrderView,
  PreventiveMaintenanceView,
  InventoryView,
  PurchaseVendorView,
  AnalyticsReportsView,
  SustainabilityView,
} from "@/components/dashboard/dashboard-views";

// Import Lucide icons
import {
  Sparkles,
  BarChart3,
  Activity,
  Factory,
  ClipboardList,
  Clock,
  Package,
  ShoppingCart,
  LineChart,
  Leaf,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardViewItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const DASHBOARD_VIEWS: DashboardViewItem[] = [
  { id: "executive", label: "📊 Executive View", icon: BarChart3 },
  { id: "operations", label: "⚙️ Operations View", icon: Activity },
  { id: "asset", label: "🏭 Asset View", icon: Factory },
  { id: "work_order", label: "🔧 Work Order View", icon: ClipboardList },
  { id: "preventive_maintenance", label: "📅 Preventive Maint.", icon: Clock },
  { id: "inventory", label: "📦 Inventory View", icon: Package },
  { id: "purchase_vendor", label: "🛒 Purchase & Vendor", icon: ShoppingCart },
  { id: "analytics_reports", label: "📈 Analytics & Reports", icon: LineChart },
  { id: "sustainability", label: "🌱 Sustainability View", icon: Leaf },
];

export default function DashboardPage() {
  const { role } = useRole();
  const [activeViewId, setActiveViewId] = useState("executive");

  const renderExecutiveView = () => {
    switch (role) {
      case "admin": return <AdminDashboard />;
      case "customer_manager": return <MaintenanceManagerDashboard />;
      case "site_incharge": return <SiteInchargeDashboard />;
      case "supervisor": return <SupervisorDashboard />;
      case "technician": return <TechnicianDashboard />;
      case "inventory_manager": return <InventoryManagerDashboard />;
      case "purchase_manager": return <PurchaseManagerDashboard />;
      default: return <AdminDashboard />;
    }
  };

  const renderActiveViewContent = () => {
    switch (activeViewId) {
      case "executive":
        return renderExecutiveView();
      case "operations":
        return <OperationsView />;
      case "asset":
        return <AssetView />;
      case "work_order":
        return <WorkOrderView />;
      case "preventive_maintenance":
        return <PreventiveMaintenanceView />;
      case "inventory":
        return <InventoryView />;
      case "purchase_vendor":
        return <PurchaseVendorView />;
      case "analytics_reports":
        return <AnalyticsReportsView />;
      case "sustainability":
        return <SustainabilityView />;
      default:
        return renderExecutiveView();
    }
  };

  return (
    <div className="space-y-6">
      {/* CSS Utility for hiding scrollbar */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Horizontal Navigation Section */}
      <div className="border-b border-border bg-card -mx-4 -mt-4 p-4 lg:-mx-6 lg:-mt-6 shrink-0 shadow-xs">
        <div className="w-full">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                Smart CMMS Views
              </h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Switch between dedicated operational dashboard layouts
              </p>
            </div>
          </div>

          {/* Horizontally scrollable buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
            {DASHBOARD_VIEWS.map((v) => {
              const Icon = v.icon;
              const isActive = activeViewId === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => setActiveViewId(v.id)}
                  className={cn(
                    "flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all shrink-0 select-none",
                    isActive
                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                      : "bg-background border-border text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{v.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dashboard View Content */}
      <div className="w-full">
        {renderActiveViewContent()}
      </div>
    </div>
  );
}
