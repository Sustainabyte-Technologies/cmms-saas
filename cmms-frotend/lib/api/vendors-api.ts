const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface Vendor {
  id: string;
  vendorCode: string;
  vendorName: string;
  vendorType: string;
  supplierCategory: string;
  contactPerson?: string;
  phone?: string;
  mobile?: string;
  email?: string;
  website?: string;
  gstNumber?: string;
  panNumber?: string;
  taxRegistration?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  paymentTerms: string;
  creditLimit: number;
  leadTimeDays: number;
  supportedCategories?: string;
  supportedSpareParts?: string;
  warrantySupport: boolean;
  amcSupport: boolean;
  serviceSupport: boolean;
  status: "ACTIVE" | "INACTIVE" | "BLACKLISTED";
  rating: number;
  remarks?: string;
  attachments?: string;
  createdAt: string;
  createdBy?: { id: string; fullName: string; email: string };
  performance?: {
    purchaseCount: number;
    completedOrders: number;
    cancelledOrders: number;
    onTimeDeliveryRate: number;
    rejectedMaterialsCount: number;
    averageRating: number;
  };
}

export interface VendorDashboardStats {
  totalVendors: number;
  activeVendors: number;
  inactiveVendors: number;
  blacklistedVendors: number;
  topRatedVendors: number;
  pendingDeliveries: number;
  totalPurchaseVolume: number;
  totalCompletedOrders: number;
}

export async function fetchVendors(params?: { search?: string; status?: string; category?: string }): Promise<Vendor[]> {
  const query = new URLSearchParams();
  if (params?.search) query.append("search", params.search);
  if (params?.status) query.append("status", params.status);
  if (params?.category) query.append("category", params.category);

  const res = await fetch(`${API_BASE_URL}/vendors?${query.toString()}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch vendors");
  return res.json();
}

export async function fetchVendorById(id: string): Promise<Vendor> {
  const res = await fetch(`${API_BASE_URL}/vendors/${id}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch vendor details");
  return res.json();
}

export async function fetchVendorDashboard(): Promise<VendorDashboardStats> {
  const res = await fetch(`${API_BASE_URL}/vendors/dashboard`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch vendor dashboard metrics");
  return res.json();
}

export async function createVendor(data: Partial<Vendor>): Promise<Vendor> {
  const res = await fetch(`${API_BASE_URL}/vendors`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to create vendor");
  }
  return res.json();
}

export async function updateVendor(id: string, data: Partial<Vendor>): Promise<Vendor> {
  const res = await fetch(`${API_BASE_URL}/vendors/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to update vendor");
  }
  return res.json();
}

export async function deleteVendor(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE_URL}/vendors/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to delete vendor");
  return res.json();
}
