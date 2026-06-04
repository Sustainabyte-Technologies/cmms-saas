"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { UserRole } from "@/types";
import { getDecodedTokenFromCookies, normalizeRole, getUserFromToken } from "@/lib/auth";

interface UserData {
  id: string;
  email: string;
  organizationId: string;
}

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  userName: string;
  userEmail: string;
  userData: UserData | null;
  isLoading: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const roleConfig: Record<UserRole, { 
  label: string; 
  dashboardTitle: string;
  description: string;
  initials: string;
}> = {
  admin: {
    label: "Admin",
    dashboardTitle: "Admin Dashboard",
    description: "Full system oversight and user management",
    initials: "AD",
  },
  maintenance_manager: {
    label: "Maintenance Manager",
    dashboardTitle: "Maintenance Manager Dashboard",
    description: "Oversee maintenance operations and team performance",
    initials: "MM",
  },
  supervisor: {
    label: "Supervisor",
    dashboardTitle: "Supervisor Dashboard",
    description: "Monitor work orders and manage technicians",
    initials: "SV",
  },
  technician: {
    label: "Technician",
    dashboardTitle: "Technician Dashboard",
    description: "View and execute assigned tasks",
    initials: "TC",
  },
  inventory_manager: {
    label: "Inventory Manager",
    dashboardTitle: "Inventory Manager Dashboard",
    description: "Manage stock levels and spare parts",
    initials: "IM",
  },
  purchase_manager: {
    label: "Purchase Manager",
    dashboardTitle: "Purchase Manager Dashboard",
    description: "Handle procurement and vendor management",
    initials: "PM",
  },
};

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>("admin");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadRoleFromToken = () => {
    // Try localStorage first (set during login)
    if (typeof window !== 'undefined') {
      const storedRole = localStorage.getItem('userRole');
      if (storedRole) {
        console.log("Role found in localStorage:", storedRole);
        const normalizedRole = normalizeRole(storedRole) as UserRole;
        setRole(normalizedRole);
        
        const organizationId = localStorage.getItem('organizationId');
        if (organizationId) {
          setUserData({
            id: '',
            email: '',
            organizationId,
          });
        }
        setIsLoading(false);
        return;
      }
    }

    // Fall back to decoding token from cookies
    const decodedToken = getDecodedTokenFromCookies();
    
    if (decodedToken) {
      console.log("Token found in cookies, role:", decodedToken.role);
      const normalizedRole = normalizeRole(decodedToken.role) as UserRole;
      setRole(normalizedRole);
      
      const user = getUserFromToken(decodedToken);
      setUserData({
        id: user.id,
        email: user.email,
        organizationId: user.organizationId,
      });
    } else {
      console.warn("No token found in cookies, defaulting to admin");
      setRole("admin");
      setUserData(null);
    }
    
    setIsLoading(false);
  };

  useEffect(() => {
    loadRoleFromToken();
  }, []);

  const value = {
    role,
    setRole,
    userName: userData?.email?.split('@')[0] || 'User',
    userEmail: userData?.email || '',
    userData,
    isLoading,
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
