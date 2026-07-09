"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { UserRole } from "@/types";
import { getDecodedTokenFromCookies, normalizeRole, getUserFromToken } from "@/lib/auth";
import { getAuthenticatedUser } from "@/lib/api/users-api";

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
  customer_manager: {
    label: "Customer Manager",
    dashboardTitle: "Customer Manager Dashboard",
    description: "Oversee customer/organization operations and team performance",
    initials: "CM",
  },
  site_incharge: {
    label: "Site In-Charge",
    dashboardTitle: "Site In-Charge Dashboard",
    description: "Manage operations at your assigned site",
    initials: "SI",
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

  const loadRoleFromToken = async () => {
    try {
      const authUser = await getAuthenticatedUser();
      if (authUser) {
        console.log("Authenticated user found via API:", authUser);
        const normalizedRole = normalizeRole(authUser.role) as UserRole;
        setRole(normalizedRole);
        setUserData({
          id: authUser.sub || (authUser as any).id || '',
          email: authUser.email,
          organizationId: authUser.organizationId,
        });
        setIsLoading(false);
        return;
      }
    } catch (err) {
      console.warn("Failed to fetch authenticated user via API, falling back to localStorage/cookies:", err);
    }

    // Prioritize decoding token from cookies (which has complete user ID, email, etc.)
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
      setIsLoading(false);
      return;
    }

    // Fall back to localStorage (legacy/backup)
    if (typeof window !== 'undefined') {
      const storedRole = localStorage.getItem('userRole');
      if (storedRole) {
        console.log("Role found in localStorage:", storedRole);
        const normalizedRole = normalizeRole(storedRole) as UserRole;
        setRole(normalizedRole);
        
        const organizationId = localStorage.getItem('organizationId');
        const userId = localStorage.getItem('userId');
        const userEmail = localStorage.getItem('userEmail');
        if (organizationId) {
          setUserData({
            id: userId || '',
            email: userEmail || '',
            organizationId,
          });
        }
        setIsLoading(false);
        return;
      }
    }

    console.warn("No token found in cookies, defaulting to admin");
    setRole("admin");
    setUserData(null);
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
