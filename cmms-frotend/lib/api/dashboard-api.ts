// API service for dashboard

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface DashboardOverviewResponse {
  cards: {
    totalUsers: number;
    totalAssets: number;
    totalWorkOrders: number;
    openWorkOrders: number;
    energyConsumptionLastMonth: number;
    energySavingsLastMonth: number;
    energySavingsCostLastMonth: number;
    operationSpendCurrentMonth: number;
    operationSpendLastMonth: number;
    targetBudgetCurrentMonth: number;
    targetBudgetLastMonth: number;
    expenseTillNow: number;
  };
}

export interface WorkOrderStatusItem {
  status: string;
  count: number;
}

export type WorkOrderStatusResponse = WorkOrderStatusItem[];

export interface PerformedByUser {
  id: string;
  fullName: string;
}

export interface RecentActivityItem {
  id: string;
  entityType: string;
  entityId: string;
  entityName: string;
  action: string;
  remarks: string;
  performedById: string;
  createdAt: string;
  performedBy: PerformedByUser;
}

export type RecentActivitiesResponse = RecentActivityItem[];

export interface UserRoleDistributionItem {
  role: string;
  count: number;
}

export type UserRoleDistributionResponse = UserRoleDistributionItem[];

export interface TechnicianWorkloadItem {
  technician: string;
  assignedWorkOrders: number;
}

export type TechnicianWorkloadResponse = TechnicianWorkloadItem[];

/**
 * Fetch dashboard overview data
 * @returns Dashboard overview data with card statistics
 */
export async function getDashboardOverview(): Promise<DashboardOverviewResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard/overview`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Send cookies with request
    });

    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      let errorMessage = `HTTP ${response.status}: Failed to fetch dashboard overview`;

      try {
        if (contentType?.includes("application/json")) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        }
      } catch {
        // If error parsing, use default error message
      }

      throw new Error(errorMessage);
    }

    const data: DashboardOverviewResponse = await response.json();
    return data;
  } catch (error) {
    console.error("❌ Failed to fetch dashboard overview:", error);
    throw error;
  }
}

/**
 * Fetch work order status distribution
 * @returns Array of work order status counts
 */
export async function getWorkOrderStatus(): Promise<WorkOrderStatusResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard/work-order-status`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Send cookies with request
    });

    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      let errorMessage = `HTTP ${response.status}: Failed to fetch work order status`;

      try {
        if (contentType?.includes("application/json")) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        }
      } catch {
        // If error parsing, use default error message
      }

      throw new Error(errorMessage);
    }

    const data: WorkOrderStatusResponse = await response.json();
    return data;
  } catch (error) {
    console.error("❌ Failed to fetch work order status:", error);
    throw error;
  }
}

/**
 * Fetch recent activities
 * @returns Array of recent work order activities
 */
export async function getRecentActivities(): Promise<RecentActivitiesResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard/recent-activities`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Send cookies with request
    });

    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      let errorMessage = `HTTP ${response.status}: Failed to fetch recent activities`;

      try {
        if (contentType?.includes("application/json")) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        }
      } catch {
        // If error parsing, use default error message
      }

      throw new Error(errorMessage);
    }

    const data: RecentActivitiesResponse = await response.json();
    return data;
  } catch (error) {
    console.error("❌ Failed to fetch recent activities:", error);
    throw error;
  }
}

/**
 * Fetch user role distribution
 * @returns Array of user counts by role
 */
export async function getUserRoleDistribution(): Promise<UserRoleDistributionResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard/user-role-distribution`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Send cookies with request
    });

    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      let errorMessage = `HTTP ${response.status}: Failed to fetch user role distribution`;

      try {
        if (contentType?.includes("application/json")) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        }
      } catch {
        // If error parsing, use default error message
      }

      throw new Error(errorMessage);
    }

    const data: UserRoleDistributionResponse = await response.json();
    return data;
  } catch (error) {
    console.error("❌ Failed to fetch user role distribution:", error);
    throw error;
  }
}

/**
 * Fetch technician workload distribution
 * @returns Array of technician workload data
 */
export async function getTechnicianWorkload(): Promise<TechnicianWorkloadResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard/technician-workload`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Send cookies with request
    });

    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      let errorMessage = `HTTP ${response.status}: Failed to fetch technician workload`;

      try {
        if (contentType?.includes("application/json")) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        }
      } catch {
        // If error parsing, use default error message
      }

      throw new Error(errorMessage);
    }

    const data: TechnicianWorkloadResponse = await response.json();
    return data;
  } catch (error) {
    console.error("❌ Failed to fetch technician workload:", error);
    throw error;
  }
}

export interface CustomerSummaryItem {
  customerId: string;
  customerName: string;
  customerCode: string;
  sites: number;
  departments: number;
  systems: number;
  assets: number;
  workOrders: number;
  checklists: number;
}

export interface CustomerSummaryResponse {
  data: CustomerSummaryItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Fetch customer hierarchy summary
 * @returns Array of customer summaries with paginated metadata
 */
export async function getDashboardSummary(
  search?: string,
  page = 1,
  limit = 5,
): Promise<CustomerSummaryResponse> {
  try {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    params.append("page", String(page));
    params.append("limit", String(limit));

    const response = await fetch(`${API_BASE_URL}/dashboard/dashboard-summary?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Send cookies with request
    });

    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      let errorMessage = `HTTP ${response.status}: Failed to fetch dashboard summary`;

      try {
        if (contentType?.includes("application/json")) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        }
      } catch {
        // If error parsing, use default error message
      }

      throw new Error(errorMessage);
    }

    const data: CustomerSummaryResponse = await response.json();
    return data;
  } catch (error) {
    console.error("❌ Failed to fetch dashboard summary:", error);
    throw error;
  }
}

