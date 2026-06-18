const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export type ApiWorkOrderPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type ApiWorkOrderType = "REACTIVE" | "PREVENTIVE" | "BREAKDOWN" | "INSPECTION";

export interface WorkOrderUser {
  id: string;
  fullName: string;
  email?: string;
}

export interface WorkOrderAsset {
  id: string;
  assetCode?: string;
  assetName: string;
  location?: string;
  category?: string;
  manufacturer?: string | null;
  modelNumber?: string | null;
  serialNumber?: string | null;
  status?: string | null;
}

export interface WorkOrderActivityResponse {
  id: string;
  action: string;
  remarks?: string | null;
  createdAt: string;
  performedBy?: Pick<WorkOrderUser, "id" | "fullName">;
}

export interface WorkOrderCommentResponse {
  id: string;
  comment: string;
  createdAt: string;
  createdBy?: Pick<WorkOrderUser, "id" | "fullName">;
}

export interface WorkOrderResponse {
  id: string;
  workOrderNumber: string;
  title: string;
  description?: string | null;
  location?: string | null;
  category?: string | null;
  priority: ApiWorkOrderPriority;
  status: string;
  workType: ApiWorkOrderType;
  estimatedHours?: number | null;
  actualHours?: number | null;
  startDate?: string | null;
  dueDate?: string | null;
  assetId?: string | null;
  assignedTechnicianId?: string | null;
  createdAt: string;
  updatedAt: string;
  asset?: WorkOrderAsset | null;
  createdBy?: WorkOrderUser;
  assignedTechnician?: WorkOrderUser | null;
  activities?: WorkOrderActivityResponse[];
  comments?: WorkOrderCommentResponse[];
  checklistTemplate?: ChecklistTemplate | null;
}

export interface CreateWorkOrderPayload {
  title: string;
  description?: string;
  assetId?: string;
  location?: string;
  category?: string;
  priority?: ApiWorkOrderPriority;
  workType?: ApiWorkOrderType;
  assignedTechnicianId?: string;
  estimatedHours?: number;
  startDate?: string;
  dueDate?: string;
  checklistTemplateId?: string;
}

export type UpdateWorkOrderPayload = Partial<CreateWorkOrderPayload>;

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
      throw new Error(`Cannot connect to server at ${API_BASE_URL}. Make sure the backend is running.`);
    }

    throw error;
  }
}

function unwrapWorkOrder(data: { workOrder?: WorkOrderResponse } | WorkOrderResponse): WorkOrderResponse {
  if ("workOrder" in data && data.workOrder) {
    return data.workOrder;
  }

  return data as WorkOrderResponse;
}

export interface FetchWorkOrdersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  priority?: string;
}

export interface FetchWorkOrdersResponse {
  workOrders: WorkOrderResponse[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export async function fetchWorkOrders(params?: FetchWorkOrdersParams): Promise<FetchWorkOrdersResponse> {
  const queryParams = new URLSearchParams();
  if (params) {
    if (params.page !== undefined) queryParams.append("page", params.page.toString());
    if (params.limit !== undefined) queryParams.append("limit", params.limit.toString());
    if (params.search) queryParams.append("search", params.search);
    if (params.status) queryParams.append("status", params.status);
    if (params.priority) queryParams.append("priority", params.priority);
  }

  const url = `/work-orders?${queryParams.toString()}`;
  const data = await request<any>(url, {
    method: "GET",
  });

  if (Array.isArray(data)) {
    return {
      workOrders: data,
      pagination: {
        total: data.length,
        page: 1,
        limit: data.length,
        totalPages: 1,
      }
    };
  }

  return {
    workOrders: data.workOrders || [],
    pagination: data.pagination,
  };
}

export async function fetchWorkOrderById(id: string): Promise<WorkOrderResponse> {
  const data = await request<{ workOrder?: WorkOrderResponse } | WorkOrderResponse>(`/work-orders/${id}`, {
    method: "GET",
  });

  return unwrapWorkOrder(data);
}

export async function createWorkOrder(payload: CreateWorkOrderPayload): Promise<WorkOrderResponse> {
  const data = await request<{ workOrder?: WorkOrderResponse } | WorkOrderResponse>("/work-orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return unwrapWorkOrder(data);
}

export async function updateWorkOrder(
  id: string,
  payload: UpdateWorkOrderPayload
): Promise<WorkOrderResponse> {
  const data = await request<{ workOrder?: WorkOrderResponse } | WorkOrderResponse>(`/work-orders/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

  return unwrapWorkOrder(data);
}

export async function assignWorkOrderTechnician(
  id: string,
  technicianId: string
): Promise<WorkOrderResponse> {
  const data = await request<{ workOrder?: WorkOrderResponse } | WorkOrderResponse>(
    `/work-orders/${id}/assign-technician`,
    {
      method: "PATCH",
      body: JSON.stringify({ technicianId }),
    }
  );

  return unwrapWorkOrder(data);
}

export async function deleteWorkOrder(id: string): Promise<void> {
  await request(`/work-orders/${id}`, {
    method: "DELETE",
  });
}

export interface ChecklistTemplate {
  id: string;
  name: string;
  description?: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  items?: any[];
}

export interface CreateChecklistTemplatePayload {
  name: string;
  description?: string;
}

export interface CreateChecklistTemplateItemPayload {
  title: string;
  isRequired?: boolean;
  sortOrder?: number;
}

export async function fetchChecklistTemplates(): Promise<ChecklistTemplate[]> {
  try {
    const data = await request<ChecklistTemplate[] | { templates?: ChecklistTemplate[] }>("/checklists/templates", {
      method: "GET",
    });
    return Array.isArray(data) ? data : (data as any).templates || [];
  } catch (error) {
    console.error("Error fetching checklist templates:", error);
    return [];
  }
}

export async function createChecklistTemplate(
  payload: CreateChecklistTemplatePayload
): Promise<ChecklistTemplate> {
  return request<ChecklistTemplate>("/checklists/templates", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createChecklistTemplateItem(
  templateId: string,
  payload: CreateChecklistTemplateItemPayload
): Promise<any> {
  return request(`/checklists/templates/${templateId}/items`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deleteChecklistTemplate(id: string): Promise<void> {
  await request(`/checklists/templates/${id}`, {
    method: "DELETE",
  });
}

export interface WorkOrderAttachment {
  id: string;
  workOrderId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  attachmentType?: string;
  uploadedById: string;
  createdAt: string;
}

export async function uploadWorkOrderAttachment(
  workOrderId: string,
  file: File,
  attachmentType?: string
): Promise<WorkOrderAttachment> {
  const formData = new FormData();
  formData.append("file", file);
  if (attachmentType) {
    formData.append("attachmentType", attachmentType);
  }

  const response = await fetch(`${API_BASE_URL}/work-orders/${workOrderId}/attachments`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!response.ok) {
    const message = await parseApiError(response, `HTTP ${response.status}: Attachment upload failed`);
    throw new Error(message);
  }

  return response.json();
}

export async function fetchWorkOrderAttachments(
  workOrderId: string
): Promise<WorkOrderAttachment[]> {
  return request<WorkOrderAttachment[]>(`/work-orders/${workOrderId}/attachments`, {
    method: "GET",
  });
}
