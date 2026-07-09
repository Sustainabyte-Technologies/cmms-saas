const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface PreventiveMaintenance {
  id: string;
  pmNumber: string;
  title: string;
  description?: string;
  frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY" | "HALF_YEARLY" | "YEARLY";
  startDate: string;
  nextDueDate: string;
  status: "ACTIVE" | "INACTIVE";
  organizationId: string;
  assetId: string;
  checklistTemplateId?: string;
  assignedTechnicianId?: string | null;
  estimatedHours?: number | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  asset?: {
    id: string;
    assetName: string;
    assetCode: string;
  };
  checklistTemplate?: {
    id: string;
    name: string;
  };
  createdBy?: {
    id: string;
    fullName: string;
    email: string;
  };
  assignedTechnician?: {
    id: string;
    fullName: string;
    email: string;
  } | null;
}

export interface CreatePMPayload {
  title: string;
  description?: string | null;
  assetId: string;
  checklistTemplateId?: string | null;
  frequency: string;
  startDate: string;
  assignedTechnicianId?: string | null;
  estimatedHours?: number | null;
}

export interface PMDashboardSummary {
  totalPMs: number;
  activePMs: number;
  inactivePMs: number;
  upcomingPMs: number;
  overduePMs: number;
  dueToday: number;
  completedThisMonth: number;
  pmCompliance: number;
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...init.headers,
      },
      credentials: "include",
      ...init,
    });

    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      let message = `HTTP ${response.status}: Request failed`;
      try {
        if (contentType?.includes("application/json")) {
          const errorData = await response.json();
          message = errorData.message || errorData.error || message;
        }
      } catch {}
      throw new Error(message);
    }

    return response.json();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("Failed to fetch")) {
      throw new Error(`Cannot connect to server at ${API_BASE_URL}. Make sure the backend is running.`);
    }
    throw error;
  }
}

export async function fetchPMs(): Promise<PreventiveMaintenance[]> {
  return request<PreventiveMaintenance[]>("/preventive-maintenance", {
    method: "GET",
  });
}

export async function fetchPMById(id: string): Promise<PreventiveMaintenance> {
  return request<PreventiveMaintenance>(`/preventive-maintenance/${id}`, {
    method: "GET",
  });
}

export async function createPM(payload: CreatePMPayload): Promise<PreventiveMaintenance> {
  return request<PreventiveMaintenance>("/preventive-maintenance", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updatePM(id: string, payload: Partial<CreatePMPayload>): Promise<PreventiveMaintenance> {
  return request<PreventiveMaintenance>(`/preventive-maintenance/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deletePM(id: string): Promise<void> {
  await request(`/preventive-maintenance/${id}`, {
    method: "DELETE",
  });
}

export async function fetchPMDashboardSummary(): Promise<PMDashboardSummary> {
  return request<PMDashboardSummary>("/preventive-maintenance/dashboard/summary", {
    method: "GET",
  });
}

export interface PMStatusDistributionItem {
  name: string;
  value: number;
  color: string;
}

export async function fetchPMStatusDistribution(): Promise<PMStatusDistributionItem[]> {
  return request<PMStatusDistributionItem[]>("/preventive-maintenance/dashboard/status-distribution", {
    method: "GET",
  });
}

export interface PMFrequencyItem {
  frequency: string;
  count: number;
}

export async function fetchPMFrequencyBreakdown(): Promise<PMFrequencyItem[]> {
  return request<PMFrequencyItem[]>("/preventive-maintenance/dashboard/frequency", {
    method: "GET",
  });
}

export interface PMUpcomingItem {
  id: string;
  pmNumber: string;
  title: string;
  frequency: string;
  priority: string;
  dueDate: string;
  assetName: string;
  assetCode: string;
}

export async function fetchPMUpcomingList(): Promise<PMUpcomingItem[]> {
  return request<PMUpcomingItem[]>("/preventive-maintenance/dashboard/upcoming", {
    method: "GET",
  });
}

export interface PMOverdueItem {
  id: string;
  pmNumber: string;
  title: string;
  priority: string;
  dueDate: string;
  daysOverdue: number;
  assetName: string;
  assetCode: string;
}

export async function fetchPMOverdueList(): Promise<PMOverdueItem[]> {
  return request<PMOverdueItem[]>("/preventive-maintenance/dashboard/overdue", {
    method: "GET",
  });
}

export interface PMAutoWorkOrderItem {
  id: string;
  woNumber: string;
  pmTitle: string;
  pmNumber: string;
  assetName: string;
  assetCode: string;
  status: string;
  createdAt: string;
  dueDate: string | null;
}

export async function fetchPMAutoWorkOrders(): Promise<PMAutoWorkOrderItem[]> {
  return request<PMAutoWorkOrderItem[]>("/preventive-maintenance/dashboard/auto-work-orders", {
    method: "GET",
  });
}

export interface PMByLocationItem {
  location: string;
  count: number;
}

export async function fetchPMByLocation(): Promise<PMByLocationItem[]> {
  return request<PMByLocationItem[]>("/preventive-maintenance/dashboard/by-location", {
    method: "GET",
  });
}

export interface PMRecentActivityItem {
  id: string;
  woNumber: string;
  title: string;
  status: string;
  assetName: string;
  technician: string;
  pmNumber: string;
  updatedAt: string;
}

export async function fetchPMRecentActivities(): Promise<PMRecentActivityItem[]> {
  return request<PMRecentActivityItem[]>("/preventive-maintenance/dashboard/recent-activities", {
    method: "GET",
  });
}

export interface PMPerformanceSummary {
  mttrHours: number;
  onTimeCompletion: number;
  avgDelayDays: number;
  pmEfficiency: number;
  completedThisMonth: number;
}

export async function fetchPMPerformanceSummary(): Promise<PMPerformanceSummary> {
  return request<PMPerformanceSummary>("/preventive-maintenance/dashboard/performance", {
    method: "GET",
  });
}


export async function generateWorkOrderFromPM(id: string): Promise<any> {
  return request<any>(`/preventive-maintenance/${id}/generate-work-order`, {
    method: "POST",
  });
}

export interface PMHistoryResponse {
  pm: {
    id: string;
    pmNumber: string;
    title: string;
  };
  totalWorkOrders: number;
  history: Array<{
    id: string;
    workOrderNumber: string;
    title: string;
    status: string;
    priority: string;
    createdAt: string;
    dueDate: string;
  }>;
}

export async function fetchPMHistory(id: string): Promise<PMHistoryResponse> {
  return request<PMHistoryResponse>(`/preventive-maintenance/${id}/history`, {
    method: "GET",
  });
}

export interface PMCalendarEvent {
  id: string;
  pmNumber: string;
  title: string;
  description: string | null;
  date: string;
  startDate: string;
  nextDueDate: string;
  status: "ACTIVE" | "INACTIVE";
  priority: string;
  frequency: string;
  assetId: string;
  assetName: string;
  assetLocation: string;
  technicianId: string | null;
  technicianName: string | null;
  color: string;
}

export async function fetchPMCalendarEvents(params: {
  month: number;
  year: number;
  customerId?: string;
  siteId?: string;
  departmentId?: string;
  systemId?: string;
  assetId?: string;
  technicianId?: string;
  status?: string;
  priority?: string;
  frequency?: string;
  search?: string;
}): Promise<PMCalendarEvent[]> {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== "") {
      queryParams.set(key, String(val));
    }
  });
  return request<PMCalendarEvent[]>(`/preventive-maintenance/calendar?${queryParams.toString()}`, {
    method: "GET",
  });
}

export async function fetchPMCalendarEventDetails(id: string): Promise<any> {
  return request<any>(`/preventive-maintenance/calendar/${id}`, {
    method: "GET",
  });
}
