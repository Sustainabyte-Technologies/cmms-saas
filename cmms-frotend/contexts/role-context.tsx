"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { UserRole } from "@/types";

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  userName: string;
  userEmail: string;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const roleConfig: Record<UserRole, { 
  label: string; 
  dashboardTitle: string;
  description: string;
  initials: string;
  userName: string;
  userEmail: string;
}> = {
  admin: {
    label: "Admin",
    dashboardTitle: "Admin Dashboard",
    description: "Full system oversight and user management",
    initials: "AD",
    userName: "Admin User",
    userEmail: "admin@company.com",
  },
  maintenance_manager: {
    label: "Maintenance Manager",
    dashboardTitle: "Maintenance Manager Dashboard",
    description: "Oversee maintenance operations and team performance",
    initials: "MM",
    userName: "Mike Johnson",
    userEmail: "mike.johnson@company.com",
  },
  supervisor: {
    label: "Supervisor",
    dashboardTitle: "Supervisor Dashboard",
    description: "Monitor work orders and manage technicians",
    initials: "SV",
    userName: "Sarah Chen",
    userEmail: "sarah.chen@company.com",
  },
  technician: {
    label: "Technician",
    dashboardTitle: "Technician Dashboard",
    description: "View and execute assigned tasks",
    initials: "TC",
    userName: "Tom Williams",
    userEmail: "tom.williams@company.com",
  },
  inventory_manager: {
    label: "Inventory Manager",
    dashboardTitle: "Inventory Manager Dashboard",
    description: "Manage stock levels and spare parts",
    initials: "IM",
    userName: "Emily Davis",
    userEmail: "emily.davis@company.com",
  },
  purchase_manager: {
    label: "Purchase Manager",
    dashboardTitle: "Purchase Manager Dashboard",
    description: "Handle procurement and vendor management",
    initials: "PM",
    userName: "David Brown",
    userEmail: "david.brown@company.com",
  },
};

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>("admin");

  const value = {
    role,
    setRole,
    userName: roleConfig[role].userName,
    userEmail: roleConfig[role].userEmail,
  };

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}
