const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface PurchaseRequestItem {
  id?: string;
  sparePartId?: string;
  partDescription: string;
  quantity: number;
  unit?: string;
  estimatedUnitPrice?: number;
  lineTotal?: number;
  sparePart?: { id: string; partCode: string; partName: string };
}

export interface PurchaseRequest {
  id: string;
  prNumber: string;
  requestedBy?: { id: string; fullName: string; email: string };
  departmentId?: string;
  warehouseId?: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  requiredDate?: string;
  reason?: string;
  totalAmount: number;
  status: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED" | "CONVERTED_TO_PO";
  approvalStep: string;
  rejectionReason?: string;
  createdAt: string;
  items: PurchaseRequestItem[];
}

export interface PurchaseOrderItem {
  id?: string;
  sparePartId?: string;
  description: string;
  quantity: number;
  receivedQuantity?: number;
  unit?: string;
  unitPrice: number;
  discount?: number;
  tax?: number;
  lineTotal: number;
  sparePart?: { id: string; partCode: string; partName: string };
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendorId: string;
  vendor?: { id: string; vendorName: string; vendorCode: string; email?: string };
  purchaseRequestId?: string;
  warehouseId?: string;
  orderDate: string;
  expectedDelivery?: string;
  currency: string;
  tax: number;
  discount: number;
  shipping: number;
  subtotal: number;
  grandTotal: number;
  status: "CREATED" | "PENDING_APPROVAL" | "APPROVED" | "SENT" | "PARTIALLY_RECEIVED" | "RECEIVED" | "CANCELLED";
  createdBy?: { id: string; fullName: string; email: string };
  notes?: string;
  createdAt: string;
  items: PurchaseOrderItem[];
}

export interface GoodsReceiptItem {
  id?: string;
  sparePartId?: string;
  receivedQty: number;
  rejectedQty?: number;
  unitPrice?: number;
  remarks?: string;
  sparePart?: { id: string; partCode: string; partName: string };
}

export interface GoodsReceipt {
  id: string;
  grnNumber: string;
  vendorId: string;
  vendor?: { id: string; vendorName: string; vendorCode: string };
  purchaseOrderId: string;
  purchaseOrder?: { id: string; poNumber: string };
  receivedDate: string;
  receivedBy?: { id: string; fullName: string };
  receivedQuantity: number;
  rejectedQuantity: number;
  remarks?: string;
  createdAt: string;
  items: GoodsReceiptItem[];
}

export interface VendorInvoice {
  id: string;
  invoiceNumber: string;
  vendorId: string;
  vendor?: { id: string; vendorName: string; vendorCode: string };
  purchaseOrderId?: string;
  purchaseOrder?: { id: string; poNumber: string };
  invoiceDate: string;
  invoiceAmount: number;
  paymentDueDate?: string;
  paymentStatus: "PENDING" | "PAID" | "OVERDUE";
  paidAmount: number;
  paymentDate?: string;
  remarks?: string;
  createdAt: string;
}

export interface PurchaseDashboardStats {
  totalPurchaseRequests: number;
  pendingApprovalPRs: number;
  approvedOrders: number;
  openPurchaseOrders: number;
  todayReceipts: number;
  monthlyPurchaseCost: number;
  totalInvoiceAmount: number;
  totalPaidAmount: number;
  pendingInvoicesCount: number;
}

// ── Dashboard APIs ──────────────────────────────
export async function fetchPurchaseDashboard(): Promise<PurchaseDashboardStats> {
  const res = await fetch(`${API_BASE_URL}/purchase/dashboard`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch purchase dashboard metrics");
  return res.json();
}

// ── Purchase Request APIs ───────────────────────
export async function fetchPurchaseRequests(params?: { status?: string; search?: string }): Promise<PurchaseRequest[]> {
  const query = new URLSearchParams();
  if (params?.status) query.append("status", params.status);
  if (params?.search) query.append("search", params.search);

  const res = await fetch(`${API_BASE_URL}/purchase/requests?${query.toString()}`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch purchase requests");
  return res.json();
}

export async function createPurchaseRequest(data: any): Promise<PurchaseRequest> {
  const res = await fetch(`${API_BASE_URL}/purchase/requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to create purchase request");
  }
  return res.json();
}

export async function updatePRStatus(id: string, status: string, rejectionReason?: string, approvalStep?: string): Promise<PurchaseRequest> {
  const res = await fetch(`${API_BASE_URL}/purchase/requests/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ status, rejectionReason, approvalStep }),
  });
  if (!res.ok) throw new Error("Failed to update PR status");
  return res.json();
}

// ── Purchase Order APIs ─────────────────────────
export async function fetchPurchaseOrders(params?: { status?: string; search?: string; vendorId?: string }): Promise<PurchaseOrder[]> {
  const query = new URLSearchParams();
  if (params?.status) query.append("status", params.status);
  if (params?.search) query.append("search", params.search);
  if (params?.vendorId) query.append("vendorId", params.vendorId);

  const res = await fetch(`${API_BASE_URL}/purchase/orders?${query.toString()}`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch purchase orders");
  return res.json();
}

export async function createPurchaseOrder(data: any): Promise<PurchaseOrder> {
  const res = await fetch(`${API_BASE_URL}/purchase/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to create purchase order");
  }
  return res.json();
}

export async function updatePOStatus(id: string, status: string): Promise<PurchaseOrder> {
  const res = await fetch(`${API_BASE_URL}/purchase/orders/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Failed to update PO status");
  return res.json();
}

// ── Goods Receipt (GRN) APIs ────────────────────
export async function fetchGoodsReceipts(): Promise<GoodsReceipt[]> {
  const res = await fetch(`${API_BASE_URL}/purchase/grn`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch goods receipts");
  return res.json();
}

export async function createGoodsReceipt(data: any): Promise<GoodsReceipt> {
  const res = await fetch(`${API_BASE_URL}/purchase/grn`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to log goods receipt");
  }
  return res.json();
}

// ── Invoice & Payment APIs ──────────────────────
export async function fetchVendorInvoices(params?: { paymentStatus?: string }): Promise<VendorInvoice[]> {
  const query = new URLSearchParams();
  if (params?.paymentStatus) query.append("paymentStatus", params.paymentStatus);

  const res = await fetch(`${API_BASE_URL}/purchase/invoices?${query.toString()}`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch vendor invoices");
  return res.json();
}

export async function createVendorInvoice(data: any): Promise<VendorInvoice> {
  const res = await fetch(`${API_BASE_URL}/purchase/invoices`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to create invoice");
  }
  return res.json();
}

export async function updateInvoicePayment(id: string, paymentStatus: string, paidAmount: number, paymentDate?: string): Promise<VendorInvoice> {
  const res = await fetch(`${API_BASE_URL}/purchase/invoices/${id}/payment`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ paymentStatus, paidAmount, paymentDate }),
  });
  if (!res.ok) throw new Error("Failed to update payment status");
  return res.json();
}
