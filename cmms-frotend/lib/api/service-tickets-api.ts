const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export type TicketCategory =
  | "MAINTENANCE"
  | "ELECTRICAL"
  | "MECHANICAL"
  | "HVAC"
  | "PLUMBING"
  | "HOUSEKEEPING"
  | "IT_SUPPORT"
  | "GENERAL_REQUEST"
  | "FACILITY"
  | "OTHER";

export type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type TicketStatus =
  | "NEW"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "ON_HOLD"
  | "RESOLVED"
  | "CLOSED";

export interface ServiceTicket {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  requestDate: string;
  organizationId: string;
  customerId: string;
  siteId: string;
  departmentId: string;
  requestedById: string;
  assignedToId?: string | null;
  assetId?: string | null;
  workOrderId?: string | null;
  location: string;
  resolution?: string | null;
  remarks?: string | null;
  isWorkOrderCreated: boolean;
  closedAt?: string | null;
  createdBy: string;
  updatedBy?: string | null;
  createdAt: string;
  updatedAt: string;
  organization?: { id: string; name: string };
  customer?: { id: string; name: string; code: string };
  site?: { id: string; name: string; code: string };
  department?: { id: string; name: string; code: string };
  asset?: { id: string; assetCode: string; assetName: string; location: string } | null;
  workOrder?: {
    id: string;
    workOrderNumber: string;
    title: string;
    status: string;
    priority: string;
    assignedTechnician?: { id: string; fullName: string } | null;
  } | null;
  requester?: { id: string; fullName: string; email: string; role?: { name: string } } | null;
  assignee?: { id: string; fullName: string; email: string; role?: { name: string } } | null;
  creator?: { id: string; fullName: string; email: string } | null;
}

export interface CreateServiceTicketPayload {
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  requestDate?: string;
  location: string;
  customerId: string;
  siteId: string;
  departmentId: string;
  requestedById: string;
  assignedToId?: string;
  assetId?: string;
  remarks?: string;
}

export interface UpdateServiceTicketPayload {
  title?: string;
  description?: string;
  category?: TicketCategory;
  priority?: TicketPriority;
  requestDate?: string;
  location?: string;
  customerId?: string;
  siteId?: string;
  departmentId?: string;
  requestedById?: string;
  assignedToId?: string;
  assetId?: string;
  remarks?: string;
}

export interface UpdateTicketStatusPayload {
  status: TicketStatus;
  resolution?: string;
  remarks?: string;
  assignedToId?: string;
}

export interface CreateWorkOrderFromTicketPayload {
  title: string;
  description?: string;
  priority?: string;
  assignedTechnicianId?: string;
  location?: string;
}

export interface QueryServiceTicketParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: TicketCategory;
  priority?: TicketPriority;
  status?: TicketStatus;
  siteId?: string;
  departmentId?: string;
  customerId?: string;
  assetId?: string;
}

export interface ServiceTicketDashboardData {
  metrics: {
    total: number;
    newTickets: number;
    assigned: number;
    inProgress: number;
    onHold: number;
    resolved: number;
    closed: number;
    urgent: number;
    overdue: number;
  };
  monthlyTrend: Array<{ month: string; count: number }>;
  statusDistribution: Array<{ name: string; value: number; color: string }>;
  priorityDistribution: Array<{ name: string; value: number; color: string }>;
  categoryDistribution: Array<{ category: string; count: number }>;
  recentTickets: ServiceTicket[];
}

export async function fetchServiceTickets(
  params?: QueryServiceTicketParams,
): Promise<{ serviceTickets: ServiceTicket[]; pagination: any }> {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.category) queryParams.append("category", params.category);
    if (params?.priority) queryParams.append("priority", params.priority);
    if (params?.status) queryParams.append("status", params.status);
    if (params?.siteId) queryParams.append("siteId", params.siteId);
    if (params?.departmentId) queryParams.append("departmentId", params.departmentId);
    if (params?.customerId) queryParams.append("customerId", params.customerId);
    if (params?.assetId) queryParams.append("assetId", params.assetId);

    const url = `${API_BASE_URL}/service-tickets?${queryParams.toString()}`;
    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch service tickets: HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error("Error fetching service tickets:", error);
    throw error;
  }
}

export async function fetchServiceTicketById(id: string): Promise<ServiceTicket> {
  try {
    const response = await fetch(`${API_BASE_URL}/service-tickets/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch service ticket ${id}: HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error(`Error fetching service ticket ${id}:`, error);
    throw error;
  }
}

export async function createServiceTicket(
  payload: CreateServiceTicketPayload,
): Promise<ServiceTicket> {
  try {
    const response = await fetch(`${API_BASE_URL}/service-tickets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || "Failed to create service ticket");
    }

    return await response.json();
  } catch (error: any) {
    console.error("Error creating service ticket:", error);
    throw error;
  }
}

export async function updateServiceTicket(
  id: string,
  payload: UpdateServiceTicketPayload,
): Promise<ServiceTicket> {
  try {
    const response = await fetch(`${API_BASE_URL}/service-tickets/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || "Failed to update service ticket");
    }

    return await response.json();
  } catch (error: any) {
    console.error(`Error updating service ticket ${id}:`, error);
    throw error;
  }
}

export async function updateServiceTicketStatus(
  id: string,
  payload: UpdateTicketStatusPayload,
): Promise<ServiceTicket> {
  try {
    const response = await fetch(`${API_BASE_URL}/service-tickets/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || "Failed to update service ticket status");
    }

    return await response.json();
  } catch (error: any) {
    console.error(`Error updating service ticket status ${id}:`, error);
    throw error;
  }
}

export async function deleteServiceTicket(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/service-tickets/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Failed to delete service ticket ${id}: HTTP ${response.status}`);
    }
  } catch (error: any) {
    console.error(`Error deleting service ticket ${id}:`, error);
    throw error;
  }
}

export async function createWorkOrderFromTicket(
  id: string,
  payload: CreateWorkOrderFromTicketPayload,
): Promise<{ serviceTicket: ServiceTicket; workOrder: any }> {
  try {
    const response = await fetch(`${API_BASE_URL}/service-tickets/${id}/create-workorder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || "Failed to create work order from service ticket");
    }

    return await response.json();
  } catch (error: any) {
    console.error(`Error creating work order from ticket ${id}:`, error);
    throw error;
  }
}

export async function fetchServiceTicketDashboard(): Promise<ServiceTicketDashboardData> {
  try {
    const response = await fetch(`${API_BASE_URL}/service-tickets/dashboard`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch service ticket dashboard: HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error("Error fetching service ticket dashboard:", error);
    throw error;
  }
}

export async function fetchServiceTicketStatistics(): Promise<ServiceTicketDashboardData> {
  try {
    const response = await fetch(`${API_BASE_URL}/service-tickets/statistics`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch service ticket statistics: HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error("Error fetching service ticket statistics:", error);
    throw error;
  }
}
