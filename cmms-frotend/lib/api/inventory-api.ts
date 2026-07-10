const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface SparePartCategory {
  id: string;
  name: string;
  description?: string;
  status: boolean;
  createdAt: string;
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  address?: string;
  description?: string;
  status: boolean;
  createdAt: string;
}

export interface SparePart {
  id: string;
  partCode: string;
  partName: string;
  description?: string;
  unit: string;
  currentStock: number;
  minimumStock: number;
  maximumStock: number;
  reservedStock: number;
  unitCost: number;
  manufacturer?: string;
  imageUrl?: string;
  status: boolean;
  categoryId?: string;
  warehouseId?: string;
  category?: SparePartCategory | null;
  warehouse?: Warehouse | null;
  createdAt: string;
}

export interface PartsRequestItem {
  id: string;
  sparePartId: string;
  requestedQty: number;
  issuedQty: number;
  sparePart: SparePart;
}

export interface PartsRequest {
  id: string;
  requestNumber: string;
  workOrderId: string;
  requestedById: string;
  reason?: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: "PENDING" | "APPROVED" | "REJECTED" | "ISSUED" | "COMPLETED";
  approvedById?: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  items: PartsRequestItem[];
  workOrder: { id: string; workOrderNumber: string; title: string };
  requestedBy: { id: string; fullName: string; email: string };
  approvedBy?: { id: string; fullName: string; email: string } | null;
}

export interface StockTransaction {
  id: string;
  transactionType: "RECEIVE" | "ISSUE" | "RETURN" | "ADJUSTMENT" | "TRANSFER";
  quantity: number;
  referenceNumber?: string;
  notes?: string;
  sparePartId: string;
  warehouseId?: string;
  workOrderId?: string;
  performedById: string;
  createdAt: string;
  sparePart: SparePart;
  warehouse?: Warehouse | null;
  workOrder?: { id: string; workOrderNumber: string; title: string } | null;
  performedBy: { id: string; fullName: string; email: string };
}

export interface InventoryDashboardStats {
  totalSpareParts: number;
  currentStockValue: number;
  pendingRequests: number;
  lowStockItems: number;
  issuedToday: number;
  receivedToday: number;
}

// ─── Helper for Fetch Requests ────────────────────────────────

async function apiRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    credentials: "include",
  });

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: Failed operation`;
    try {
      const err = await response.json();
      errorMessage = err.message || err.error || errorMessage;
    } catch (_) {}
    throw new Error(errorMessage);
  }

  return response.json();
}

// ─── Spare Parts API ──────────────────────────────────────────

export async function fetchSpareParts(search: string = "", categoryId?: string, warehouseId?: string): Promise<SparePart[]> {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (categoryId) params.append("categoryId", categoryId);
  if (warehouseId) params.append("warehouseId", warehouseId);
  return apiRequest<SparePart[]>(`${API_BASE_URL}/inventory/spare-parts?${params.toString()}`);
}

export async function fetchSparePartById(id: string): Promise<SparePart> {
  return apiRequest<SparePart>(`${API_BASE_URL}/inventory/spare-parts/${id}`);
}

export async function createSparePart(payload: Partial<SparePart>): Promise<SparePart> {
  return apiRequest<SparePart>(`${API_BASE_URL}/inventory/spare-parts`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateSparePart(id: string, payload: Partial<SparePart>): Promise<SparePart> {
  return apiRequest<SparePart>(`${API_BASE_URL}/inventory/spare-parts/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteSparePart(id: string): Promise<void> {
  return apiRequest<void>(`${API_BASE_URL}/inventory/spare-parts/${id}`, {
    method: "DELETE",
  });
}

// ─── Categories API ───────────────────────────────────────────

export async function fetchCategories(): Promise<SparePartCategory[]> {
  return apiRequest<SparePartCategory[]>(`${API_BASE_URL}/inventory/categories`);
}

export async function createCategory(payload: { name: string; description?: string }): Promise<SparePartCategory> {
  return apiRequest<SparePartCategory>(`${API_BASE_URL}/inventory/categories`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateCategory(id: string, payload: { name: string; description?: string }): Promise<SparePartCategory> {
  return apiRequest<SparePartCategory>(`${API_BASE_URL}/inventory/categories/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteCategory(id: string): Promise<void> {
  return apiRequest<void>(`${API_BASE_URL}/inventory/categories/${id}`, {
    method: "DELETE",
  });
}

// ─── Warehouses API ───────────────────────────────────────────

export async function fetchWarehouses(): Promise<Warehouse[]> {
  return apiRequest<Warehouse[]>(`${API_BASE_URL}/inventory/warehouses`);
}

export async function createWarehouse(payload: { name: string; code: string; address?: string; description?: string }): Promise<Warehouse> {
  return apiRequest<Warehouse>(`${API_BASE_URL}/inventory/warehouses`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateWarehouse(id: string, payload: { name: string; code: string; address?: string; description?: string }): Promise<Warehouse> {
  return apiRequest<Warehouse>(`${API_BASE_URL}/inventory/warehouses/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteWarehouse(id: string): Promise<void> {
  return apiRequest<void>(`${API_BASE_URL}/inventory/warehouses/${id}`, {
    method: "DELETE",
  });
}

// ─── Parts Requests API ───────────────────────────────────────

export async function fetchPartsRequests(workOrderId?: string, status?: string): Promise<PartsRequest[]> {
  const params = new URLSearchParams();
  if (workOrderId) params.append("workOrderId", workOrderId);
  if (status) params.append("status", status);
  return apiRequest<PartsRequest[]>(`${API_BASE_URL}/inventory/parts-requests?${params.toString()}`);
}

export async function fetchPartsRequestById(id: string): Promise<PartsRequest> {
  return apiRequest<PartsRequest>(`${API_BASE_URL}/inventory/parts-requests/${id}`);
}

export async function createPartsRequest(payload: {
  workOrderId: string;
  reason?: string;
  priority?: string;
  items: { sparePartId: string; requestedQty: number }[];
}): Promise<PartsRequest> {
  return apiRequest<PartsRequest>(`${API_BASE_URL}/inventory/parts-requests`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function approvePartsRequest(id: string, notes?: string): Promise<PartsRequest> {
  return apiRequest<PartsRequest>(`${API_BASE_URL}/inventory/parts-requests/${id}/approve`, {
    method: "PATCH",
    body: JSON.stringify({ notes }),
  });
}

export async function rejectPartsRequest(id: string, reason: string): Promise<PartsRequest> {
  return apiRequest<PartsRequest>(`${API_BASE_URL}/inventory/parts-requests/${id}/reject`, {
    method: "PATCH",
    body: JSON.stringify({ reason }),
  });
}

export async function issuePartsRequest(id: string, notes?: string): Promise<PartsRequest> {
  return apiRequest<PartsRequest>(`${API_BASE_URL}/inventory/parts-requests/${id}/issue`, {
    method: "POST",
    body: JSON.stringify({ notes }),
  });
}

// ─── Transactions & Stock Receipts ────────────────────────────

export async function fetchStockTransactions(search: string = ""): Promise<StockTransaction[]> {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  return apiRequest<StockTransaction[]>(`${API_BASE_URL}/inventory/transactions?${params.toString()}`);
}

export async function receiveStock(payload: {
  sparePartId: string;
  warehouseId: string;
  quantity: number;
  notes?: string;
  referenceNumber?: string;
}): Promise<StockTransaction> {
  return apiRequest<StockTransaction>(`${API_BASE_URL}/inventory/receive`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function adjustStock(payload: {
  sparePartId: string;
  warehouseId: string;
  quantity: number;
  notes?: string;
}): Promise<StockTransaction> {
  return apiRequest<StockTransaction>(`${API_BASE_URL}/inventory/adjust`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchLowStock(): Promise<SparePart[]> {
  return apiRequest<SparePart[]>(`${API_BASE_URL}/inventory/low-stock`);
}

export async function fetchInventoryDashboardStats(): Promise<InventoryDashboardStats> {
  return apiRequest<InventoryDashboardStats>(`${API_BASE_URL}/inventory/dashboard`);
}
