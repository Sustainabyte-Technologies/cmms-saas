const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (!response.ok) {
    let msg = `HTTP ${response.status}`;
    try {
      const d = await response.json();
      msg = d.message || d.error || msg;
    } catch {}
    throw new Error(msg);
  }
  return response.json();
}

export interface RoleDashboardKPIs {
  totalRoles: number;
  totalUsers: number;
  activeUsers: number;
  admins: number;
  customerManagers: number;
  siteInCharges: number;
  supervisors: number;
  technicians: number;
  totalCustomers: number;
  totalSites: number;
  totalDepts: number;
  totalAssets: number;
  totalWOs: number;
  totalPMs: number;
  activeWOs: number;
  completedWOs: number;
  activePMs: number;
}

export interface RoleDistributionItem {
  role: string;
  count: number;
}

export interface RoleUserItem {
  id: string;
  fullName: string;
  email: string;
  role: string;
  assignedCustomers: number;
  assignedSites: number;
  assignedDepts: number;
  activeWOs: number;
  assignedPMs: number;
  managedAssets: number;
  createdAt: string;
}

export interface RoleStats {
  userCount: number;
  users: RoleUserItem[];
}

export interface RoleWorkloadItem {
  role: string;
  activeWOs: number;
  activePMs: number;
}

export interface UserTableRow {
  id: string;
  fullName: string;
  email: string;
  role: string;
  customers: string;
  sites: string;
  departments: string;
  assignedAssets: number;
  activeWOs: number;
  assignedPMs: number;
  status: string;
  createdAt: string;
}

export interface RecentActivityItem {
  id: string;
  action: string;
  entityType: string;
  entityName: string;
  performedBy: string;
  performedByRole: string;
  createdAt: string;
}

export interface RoleDashboardData {
  kpis: RoleDashboardKPIs;
  roleDistribution: RoleDistributionItem[];
  roleStats: Record<string, RoleStats>;
  roleWorkload: RoleWorkloadItem[];
  userTable: UserTableRow[];
  recentActivities: RecentActivityItem[];
}

export async function fetchRoleDashboard(): Promise<RoleDashboardData> {
  return getJson<RoleDashboardData>(`${API_BASE_URL}/users/role-dashboard`);
}
