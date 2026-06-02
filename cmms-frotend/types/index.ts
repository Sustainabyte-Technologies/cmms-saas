// CMMS Application Types

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  companyId: string;
  avatar?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 
  | "admin"
  | "maintenance_manager"
  | "supervisor"
  | "technician"
  | "inventory_manager"
  | "purchase_manager";

export interface Company {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  logo?: string;
  plan: PlanType;
  createdAt: Date;
  updatedAt: Date;
}

export type PlanType = "starter" | "professional" | "enterprise";

export interface Asset {
  id: string;
  name: string;
  code: string;
  category: string;
  location: string;
  status: AssetStatus;
  purchaseDate?: Date;
  warrantyExpiry?: Date;
  value?: number;
  description?: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type AssetStatus = "operational" | "maintenance" | "repair" | "retired";

export interface WorkOrder {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: WorkOrderStatus;
  assetId: string;
  assigneeId?: string;
  requesterId: string;
  dueDate?: Date;
  completedAt?: Date;
  estimatedHours?: number;
  actualHours?: number;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type Priority = "low" | "medium" | "high" | "critical";

export type WorkOrderStatus = 
  | "open"
  | "in_progress"
  | "on_hold"
  | "completed"
  | "cancelled";

export interface PreventiveMaintenance {
  id: string;
  title: string;
  description: string;
  assetId: string;
  frequency: Frequency;
  lastCompleted?: Date;
  nextDue: Date;
  assigneeId?: string;
  checklistItems: string[];
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type Frequency = "daily" | "weekly" | "monthly" | "quarterly" | "yearly";

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  minQuantity: number;
  maxQuantity?: number;
  unitCost: number;
  location: string;
  supplierId?: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Vendor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  contactPerson?: string;
  category: string;
  rating?: number;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendorId: string;
  status: PurchaseOrderStatus;
  items: PurchaseOrderItem[];
  totalAmount: number;
  requestedById: string;
  approvedById?: string;
  orderDate: Date;
  expectedDelivery?: Date;
  deliveredDate?: Date;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type PurchaseOrderStatus = 
  | "draft"
  | "pending_approval"
  | "approved"
  | "ordered"
  | "received"
  | "cancelled";

export interface PurchaseOrderItem {
  inventoryItemId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  userId: string;
  link?: string;
  createdAt: Date;
}

export type NotificationType = "info" | "success" | "warning" | "error";

// Dashboard Stats
export interface DashboardStats {
  totalAssets: number;
  openWorkOrders: number;
  pmDue: number;
  inventoryValue: number;
}

// Chart Data Types
export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}
