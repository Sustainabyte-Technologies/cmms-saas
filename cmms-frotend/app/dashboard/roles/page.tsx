import { Metadata } from "next";
import RoleManagementDashboard from "@/components/dashboard/role-management-dashboard";

export const metadata: Metadata = {
  title: "Role Management | CMMS Dashboard",
  description: "Enterprise Role Management Dashboard — hierarchy, permissions, user assignments and workload intelligence.",
};

export default function RolesPage() {
  return <RoleManagementDashboard />;
}
