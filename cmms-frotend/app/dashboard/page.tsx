"use client";

import { useRole, roleConfig } from "@/contexts/role-context";
import { AdminDashboard } from "@/components/dashboard/dashboards/admin-dashboard";
import { MaintenanceManagerDashboard } from "@/components/dashboard/dashboards/maintenance-manager-dashboard";
import { SupervisorDashboard } from "@/components/dashboard/dashboards/supervisor-dashboard";
import { TechnicianDashboard } from "@/components/dashboard/dashboards/technician-dashboard";
import { InventoryManagerDashboard } from "@/components/dashboard/dashboards/inventory-manager-dashboard";
import { PurchaseManagerDashboard } from "@/components/dashboard/dashboards/purchase-manager-dashboard";

export default function DashboardPage() {
  const { role } = useRole();

  const renderDashboard = () => {
    switch (role) {
      case "admin":
        return <AdminDashboard />;
      case "maintenance_manager":
        return <MaintenanceManagerDashboard />;
      case "supervisor":
        return <SupervisorDashboard />;
      case "technician":
        return <TechnicianDashboard />;
      case "inventory_manager":
        return <InventoryManagerDashboard />;
      case "purchase_manager":
        return <PurchaseManagerDashboard />;
      default:
        return <AdminDashboard />;
    }
  };

  return renderDashboard();
}
