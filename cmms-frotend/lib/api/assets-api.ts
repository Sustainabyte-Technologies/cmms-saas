// API service for asset management

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface Asset {
  id: string;
  assetCode: string;
  assetName: string;
  category: string;
  location: string;
  manufacturer?: string;
  modelNumber?: string;
  serialNumber?: string;
  capacity?: string;
  powerRating?: string;
  description?: string;
  imageUrl?: string;
  acquisitionCost?: number;
  salvageValue?: number;
  depreciationRate?: number;
  status?: "ACTIVE" | "UNDER_MAINTENANCE" | "BREAKDOWN" | "IDLE" | "RETIRED";
  systemId?: string;
  customerId?: string;
  siteId?: string;
  departmentId?: string;
  customer?: { id: string; name: string; code: string } | null;
  site?: { id: string; name: string; code: string } | null;
  department?: { id: string; name: string; code: string } | null;
  system?: { id: string; name: string; code: string } | null;
  createdAt: string;
  createdBy?: {
    id: string;
    fullName: string;
    email: string;
    role?: {
      name: string;
    };
  };
}

export interface CreateAssetPayload {
  assetName: string;
  category: string;
  location: string;
  manufacturer?: string;
  modelNumber?: string;
  serialNumber?: string;
  capacity?: string;
  powerRating?: string;
  description?: string;
  status?: string;
  systemId?: string | null;
  customerId?: string | null;
  siteId?: string | null;
  departmentId?: string | null;
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AssetsResponse {
  data: Asset[];
  pagination: PaginationInfo;
}

/**
 * Fetch assets from API with pagination and search
 * @param page - Page number (1-indexed)
 * @param limit - Number of items per page
 * @param search - Search query (optional)
 * @returns AssetsResponse with assets and pagination info
 */
export async function fetchAssets(page: number = 1, limit: number = 10, search: string = ""): Promise<AssetsResponse> {
  try {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());
    if (search) {
      params.append("search", search);
    }

    const url = `${API_BASE_URL}/assets?${params.toString()}`;
    console.log("🔄 Fetching assets from:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Send cookies with request
    });

    console.log("📡 Response status:", response.status);

    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      let errorMessage = `HTTP ${response.status}: Failed to fetch assets`;

      try {
        if (contentType?.includes("application/json")) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } else {
          const text = await response.text();
          console.error("Response body:", text);
        }
      } catch (parseError) {
        console.error("Could not parse error response:", parseError);
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log("✅ Assets fetched successfully:", data);

    // Handle both direct array response and paginated response
    if (Array.isArray(data)) {
      return {
        data,
        pagination: {
          total: data.length,
          page: 1,
          limit: data.length,
          totalPages: 1,
        },
      };
    }

    // Return paginated response
    return data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Error fetching assets:", errorMessage);

    if (errorMessage.includes("Failed to fetch")) {
      throw new Error(
        `Cannot connect to server at ${API_BASE_URL}. Make sure the backend is running.`
      );
    }

    throw error;
  }
}

/**
 * Fetch a single asset by ID
 * @param id - Asset ID
 * @returns Asset data
 */
export async function fetchAssetById(id: string): Promise<Asset> {
  try {
    console.log("🔄 Fetching asset:", id);

    const response = await fetch(`${API_BASE_URL}/assets/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    console.log("📡 Response status:", response.status);

    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      let errorMessage = `HTTP ${response.status}: Failed to fetch asset`;

      try {
        if (contentType?.includes("application/json")) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        }
      } catch (parseError) {
        console.error("Could not parse error response:", parseError);
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log("✅ Asset fetched successfully:", data);
    return data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Error fetching asset:", errorMessage);
    throw error;
  }
}

/**
 * Create a new asset via API
 * @param assetData - Asset data to create
 * @returns Created asset data
 */
export async function createAsset(assetData: CreateAssetPayload): Promise<Asset> {
  try {
    console.log("🔄 Creating asset:", assetData);

    const response = await fetch(`${API_BASE_URL}/assets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(assetData),
    });

    console.log("📡 Response status:", response.status);

    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      let errorMessage = `HTTP ${response.status}: Failed to create asset`;

      try {
        if (contentType?.includes("application/json")) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        }
      } catch (parseError) {
        console.error("Could not parse error response:", parseError);
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log("✅ Asset created successfully:", data);
    return data.asset || data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Error creating asset:", errorMessage);

    if (errorMessage.includes("Failed to fetch")) {
      throw new Error(
        `Cannot connect to server at ${API_BASE_URL}. Make sure the backend is running.`
      );
    }

    throw error;
  }
}

/**
 * Update an existing asset
 * @param id - Asset ID
 * @param assetData - Updated asset data
 * @returns Updated asset data
 */
export async function updateAsset(
  id: string,
  assetData: Partial<CreateAssetPayload>
): Promise<Asset> {
  try {
    console.log("🔄 Updating asset:", id);

    const response = await fetch(`${API_BASE_URL}/assets/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(assetData),
    });

    console.log("📡 Response status:", response.status);

    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      let errorMessage = `HTTP ${response.status}: Failed to update asset`;

      try {
        if (contentType?.includes("application/json")) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        }
      } catch (parseError) {
        console.error("Could not parse error response:", parseError);
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log("✅ Asset updated successfully:", data);
    return data.asset || data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Error updating asset:", errorMessage);
    throw error;
  }
}

/**
 * Delete an asset
 * @param id - Asset ID
 * @returns Delete response
 */
export async function deleteAsset(id: string): Promise<any> {
  try {
    console.log("🔄 Deleting asset:", id);

    const response = await fetch(`${API_BASE_URL}/assets/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    console.log("📡 Response status:", response.status);

    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      let errorMessage = `HTTP ${response.status}: Failed to delete asset`;

      try {
        if (contentType?.includes("application/json")) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        }
      } catch (parseError) {
        console.error("Could not parse error response:", parseError);
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log("✅ Asset deleted successfully:", data);
    return data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Error deleting asset:", errorMessage);
    throw error;
  }
}

/**
 * Upload an image attachment for an asset
 * @param assetId - Asset ID
 * @param file - File to upload
 * @returns Updated asset data
 */
export async function uploadAssetImage(
  assetId: string,
  file: File
): Promise<Asset> {
  try {
    console.log("🔄 Uploading image for asset:", assetId);

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}/assets/${assetId}/image`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    console.log("📡 Response status:", response.status);

    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      let errorMessage = `HTTP ${response.status}: Failed to upload image`;

      try {
        if (contentType?.includes("application/json")) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        }
      } catch (parseError) {
        console.error("Could not parse error response:", parseError);
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log("✅ Image uploaded successfully:", data);
    return data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Error uploading image:", errorMessage);
    throw error;
  }
}

/**
 * Helper to perform GET requests with credentials
 */
async function getJson(url: string): Promise<any> {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: Failed to fetch`;
    try {
      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      }
    } catch (_) { }
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Fetch asset dashboard KPI statistics
 */
export async function fetchAssetDashboardStats(): Promise<{
  totalAssets: number;
  activeAssets: number;
  underMaintenance: number;
  criticalAssets: number;
  idleAssets: number;
  retiredAssets: number;
  warrantyExpiring: number;
  avgHealthScore: number;
  availability: number;
}> {
  return getJson(`${API_BASE_URL}/assets/dashboard/stats`);
}

/**
 * Fetch asset dashboard category distribution
 */
export async function fetchAssetDashboardCategories(): Promise<
  Array<{ category: string; count: number }>
> {
  return getJson(`${API_BASE_URL}/assets/dashboard/categories`);
}

/**
 * Fetch asset dashboard locations registry
 */
export async function fetchAssetDashboardLocations(): Promise<
  Array<{ location: string; count: number; description: string }>
> {
  return getJson(`${API_BASE_URL}/assets/dashboard/locations`);
}

/**
 * Fetch asset dashboard critical/warranty assets
 */
export async function fetchAssetDashboardWarranty(): Promise<
  Array<{ id: string; assetName: string; assetCode: string; warranty: string }>
> {
  return getJson(`${API_BASE_URL}/assets/dashboard/warranty`);
}

/**
 * Fetch asset dashboard health scores
 */
export async function fetchAssetDashboardHealth(): Promise<
  Array<{ id: string; assetName: string; assetCode: string; health: string }>
> {
  return getJson(`${API_BASE_URL}/assets/dashboard/health`);
}

/**
 * Fetch asset dashboard downtime analysis
 */
export async function fetchAssetDashboardDowntime(): Promise<
  Array<{ name: string; hours: number }>
> {
  return getJson(`${API_BASE_URL}/assets/dashboard/downtime`);
}

/**
 * Fetch asset health distribution (Donut chart: Healthy/Warning/Critical/Offline)
 */
export async function fetchAssetDashboardHealthDistribution(): Promise<
  Array<{ name: string; value: number; color: string }>
> {
  return getJson(`${API_BASE_URL}/assets/dashboard/health-distribution`);
}

/**
 * Fetch asset lifecycle status (pipeline/funnel: Registered/Installed/Running/Maintenance/Retired)
 */
export async function fetchAssetDashboardLifecycle(): Promise<
  Array<{ stage: string; count: number; color: string }>
> {
  return getJson(`${API_BASE_URL}/assets/dashboard/lifecycle`);
}

/**
 * Fetch asset location hierarchy (Customer → Site → Department)
 */
export interface LocationHierarchyDepartment { id: string; name: string; count: number; }
export interface LocationHierarchySite { id: string; name: string; count: number; departments: LocationHierarchyDepartment[]; }
export interface LocationHierarchyCustomer { id: string; name: string; count: number; sites: LocationHierarchySite[]; }

export async function fetchAssetDashboardLocationHierarchy(): Promise<LocationHierarchyCustomer[]> {
  return getJson(`${API_BASE_URL}/assets/dashboard/location-hierarchy`);
}

/**
 * Fetch critical asset list with health %, warranty, last service, next PM, status
 */
export interface CriticalAssetItem {
  id: string;
  assetCode: string;
  assetName: string;
  category: string;
  status: string;
  health: number;
  warranty: string;
  lastService: string | null;
  nextPm: string | null;
}

export async function fetchAssetDashboardCriticalList(): Promise<CriticalAssetItem[]> {
  return getJson(`${API_BASE_URL}/assets/dashboard/critical-list`);
}
