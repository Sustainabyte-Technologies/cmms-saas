const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export type IncidentType =
  | "SAFETY"
  | "ENVIRONMENTAL"
  | "SECURITY"
  | "OPERATIONAL"
  | "FIRE"
  | "CHEMICAL"
  | "NEAR_MISS"
  | "ELECTRICAL"
  | "PROPERTY_DAMAGE"
  | "OTHER";

export type IncidentSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type IncidentStatus =
  | "OPEN"
  | "UNDER_INVESTIGATION"
  | "CORRECTIVE_ACTION"
  | "RESOLVED"
  | "CLOSED";

export interface IncidentUser {
  id: string;
  fullName: string;
  email?: string;
}

export interface IncidentAsset {
  id: string;
  assetCode: string;
  assetName: string;
  location?: string;
}

export interface IncidentWorkOrder {
  id: string;
  workOrderNumber: string;
  title: string;
  status: string;
  priority: string;
  assignedTechnician?: {
    id: string;
    fullName: string;
  } | null;
}

export interface Incident {
  id: string;
  incidentNumber: string;
  title: string;
  description: string;
  incidentType: IncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  incidentDate: string;
  reportedDate: string;
  organizationId: string;
  customerId: string;
  siteId: string;
  departmentId: string;
  reportedById: string;
  assignedToId?: string | null;
  location: string;
  assetId?: string | null;
  workOrderId?: string | null;
  rootCause?: string | null;
  correctiveAction?: string | null;
  preventiveAction?: string | null;
  resolution?: string | null;
  remarks?: string | null;
  isWorkOrderCreated: boolean;
  closedAt?: string | null;
  createdBy: string;
  updatedBy?: string | null;
  createdAt: string;
  updatedAt: string;

  customer?: { id: string; name: string; code: string } | null;
  site?: { id: string; name: string; code: string } | null;
  department?: { id: string; name: string; code: string } | null;
  asset?: IncidentAsset | null;
  workOrder?: IncidentWorkOrder | null;
  reporter?: IncidentUser | null;
  investigator?: IncidentUser | null;
  creator?: IncidentUser | null;
}

export interface CreateIncidentPayload {
  title: string;
  description: string;
  incidentType: IncidentType;
  severity: IncidentSeverity;
  incidentDate: string;
  location: string;
  customerId: string;
  siteId: string;
  departmentId: string;
  reportedById: string;
  assignedToId?: string;
  assetId?: string;
  rootCause?: string;
  correctiveAction?: string;
  preventiveAction?: string;
  remarks?: string;
}

export type UpdateIncidentPayload = Partial<CreateIncidentPayload>;

export interface UpdateIncidentStatusPayload {
  status: IncidentStatus;
  resolution?: string;
  rootCause?: string;
  correctiveAction?: string;
  preventiveAction?: string;
  remarks?: string;
}

export interface CreateWorkOrderFromIncidentPayload {
  title: string;
  description?: string;
  priority?: string;
  assignedTechnicianId?: string;
  location?: string;
}

export interface FetchIncidentsParams {
  page?: number;
  limit?: number;
  search?: string;
  incidentType?: IncidentType;
  severity?: IncidentSeverity;
  status?: IncidentStatus;
  siteId?: string;
  departmentId?: string;
  customerId?: string;
  assetId?: string;
}

export interface FetchIncidentsResponse {
  incidents: Incident[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface IncidentDashboardMetrics {
  total: number;
  open: number;
  underInvestigation: number;
  correctiveAction: number;
  resolved: number;
  closed: number;
  critical: number;
  high: number;
  nearMiss: number;
  fire: number;
  electrical: number;
}

export interface IncidentDashboardData {
  metrics: IncidentDashboardMetrics;
  monthlyTrend: Array<{ month: string; count: number }>;
  statusDistribution: Array<{ name: string; value: number; color: string }>;
  severityDistribution: Array<{ name: string; value: number; color: string }>;
  typeDistribution: Array<{ type: string; count: number }>;
  recentIncidents: Incident[];
}

async function parseApiError(response: Response, fallback: string) {
  const contentType = response.headers.get("content-type");
  try {
    if (contentType?.includes("application/json")) {
      const errorData = await response.json();
      return errorData.message || errorData.error || fallback;
    }
  } catch (error) {
    console.error("Could not parse error response:", error);
  }
  return fallback;
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
      const message = await parseApiError(response, `HTTP ${response.status}: Request failed`);
      throw new Error(message);
    }

    return response.json();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("Failed to fetch")) {
      throw new Error(`Cannot connect to server at ${API_BASE_URL}. Make sure backend is running.`);
    }
    throw error;
  }
}

export async function fetchIncidents(params?: FetchIncidentsParams): Promise<FetchIncidentsResponse> {
  const queryParams = new URLSearchParams();
  if (params) {
    if (params.page !== undefined) queryParams.append("page", params.page.toString());
    if (params.limit !== undefined) queryParams.append("limit", params.limit.toString());
    if (params.search) queryParams.append("search", params.search);
    if (params.incidentType) queryParams.append("incidentType", params.incidentType);
    if (params.severity) queryParams.append("severity", params.severity);
    if (params.status) queryParams.append("status", params.status);
    if (params.siteId) queryParams.append("siteId", params.siteId);
    if (params.departmentId) queryParams.append("departmentId", params.departmentId);
    if (params.customerId) queryParams.append("customerId", params.customerId);
    if (params.assetId) queryParams.append("assetId", params.assetId);
  }

  const data = await request<any>(`/incidents?${queryParams.toString()}`, {
    method: "GET",
  });

  if (Array.isArray(data)) {
    return {
      incidents: data,
      pagination: {
        total: data.length,
        page: 1,
        limit: data.length || 10,
        totalPages: 1,
      },
    };
  }

  return {
    incidents: data.incidents || [],
    pagination: data.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 },
  };
}

export async function fetchIncidentById(id: string): Promise<Incident> {
  return request<Incident>(`/incidents/${id}`, {
    method: "GET",
  });
}

export async function createIncident(payload: CreateIncidentPayload): Promise<Incident> {
  return request<Incident>("/incidents", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateIncident(id: string, payload: UpdateIncidentPayload): Promise<Incident> {
  return request<Incident>(`/incidents/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function updateIncidentStatus(
  id: string,
  payload: UpdateIncidentStatusPayload
): Promise<Incident> {
  return request<Incident>(`/incidents/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteIncident(id: string): Promise<void> {
  await request(`/incidents/${id}`, {
    method: "DELETE",
  });
}

export async function createWorkOrderFromIncident(
  id: string,
  payload: CreateWorkOrderFromIncidentPayload
): Promise<{ incident: Incident; workOrder: IncidentWorkOrder }> {
  return request<{ incident: Incident; workOrder: IncidentWorkOrder }>(
    `/incidents/${id}/create-workorder`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export async function fetchIncidentDashboard(): Promise<IncidentDashboardData> {
  return request<IncidentDashboardData>("/incidents/dashboard", {
    method: "GET",
  });
}

export async function fetchIncidentStatistics(): Promise<IncidentDashboardData> {
  return request<IncidentDashboardData>("/incidents/statistics", {
    method: "GET",
  });
}
