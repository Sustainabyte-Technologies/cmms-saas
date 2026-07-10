// API service for customers (companies), sites, departments, and systems
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface AssignableUser {
  id: string;
  fullName: string;
  email: string;
  role: { name: string };
}

export interface Customer {
  id: string;
  name: string;
  code: string;
  contactPerson?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  status: boolean;
  assignedManagerId?: string | null;
  assignedManager?: AssignableUser | null;
  createdById?: string | null;
  createdBy?: AssignableUser | null;
  createdAt: string;
  updatedAt: string;
  sites?: Site[];
}

export interface Site {
  id: string;
  name: string;
  code: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  imageUrl?: string | null;
  status: boolean;
  customerId: string;
  customer?: { id: string; name: string; code: string } | null;
  assignedSupervisorId?: string | null;
  assignedSupervisor?: AssignableUser | null;
  createdById?: string | null;
  createdBy?: AssignableUser | null;
  createdAt: string;
  updatedAt: string;
  departments?: Department[];
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  status: boolean;
  siteId: string;
  site?: { id: string; name: string; code: string } | null;
  assignedSupervisorId?: string | null;
  assignedSupervisor?: AssignableUser | null;
  createdById?: string | null;
  createdBy?: AssignableUser | null;
  createdAt: string;
  updatedAt: string;
  systems?: System[];
}

export interface System {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  imageUrl?: string | null;
  status: boolean;
  departmentId: string;
  department?: { id: string; name: string; code: string } | null;
  createdById?: string | null;
  createdBy?: AssignableUser | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Request helper ──────────────────────────────────────────────────────────

async function parseApiError(response: Response, fallback: string) {
  const ct = response.headers.get("content-type");
  try {
    if (ct?.includes("application/json")) {
      const d = await response.json();
      return d.message || d.error || fallback;
    }
  } catch {}
  return fallback;
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json", ...init.headers },
      credentials: "include",
      ...init,
    });
    if (!response.ok) {
      const msg = await parseApiError(response, `HTTP ${response.status}: Request failed`);
      throw new Error(msg);
    }
    return response.json();
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes("Failed to fetch"))
      throw new Error(`Cannot connect to server at ${API_BASE_URL}. Make sure the backend is running.`);
    throw error;
  }
}

// ─── Customers ───────────────────────────────────────────────────────────────

export async function getCustomers(search?: string, page?: number, limit = 10000): Promise<Customer[]> {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (page) params.append("page", page.toString());
  params.append("limit", limit.toString());
  const res = await request<any>(`/customers?${params.toString()}`, { method: "GET" });
  return Array.isArray(res) ? res : res?.data || [];
}

/**
 * Derives flat arrays of sites, departments, and systems from the already-loaded
 * customers list (which includes nested sites → departments → systems).
 * Use this instead of calling getSites/getDepartments/getSystems separately.
 */
export function extractFromCustomers(customers: Customer[]): {
  sites: Site[];
  departments: Department[];
  systems: System[];
} {
  const sites: Site[] = [];
  const departments: Department[] = [];
  const systems: System[] = [];

  for (const customer of customers) {
    for (const site of customer.sites ?? []) {
      sites.push(site);
      for (const dept of site.departments ?? []) {
        departments.push(dept);
        for (const sys of dept.systems ?? []) {
          systems.push(sys);
        }
      }
    }
  }

  return { sites, departments, systems };
}

export interface CreateCustomerDto {
  name: string;
  description?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  assignedManagerId?: string | null;
}
export async function createCustomer(dto: CreateCustomerDto): Promise<Customer> {
  return request<Customer>("/customers", { method: "POST", body: JSON.stringify(dto) });
}

export interface UpdateCustomerDto {
  name?: string;
  description?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  assignedManagerId?: string | null;
}
export async function updateCustomer(id: string, dto: UpdateCustomerDto): Promise<Customer> {
  return request<Customer>(`/customers/${id}`, { method: "PATCH", body: JSON.stringify(dto) });
}

export async function deleteCustomer(id: string): Promise<void> {
  return request<void>(`/customers/${id}`, { method: "DELETE" });
}

export async function uploadCustomerImage(id: string, file: File): Promise<Customer> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(`${API_BASE_URL}/customers/${id}/image`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  if (!response.ok) {
    const msg = await parseApiError(response, "Failed to upload customer image");
    throw new Error(msg);
  }
  return response.json();
}

export function getCustomerImageUrl(id: string): string {
  return `${API_BASE_URL}/customers/${id}/image`;
}

// ─── Sites ────────────────────────────────────────────────────────────────────

export async function getSites(search?: string, page?: number, limit = 10000): Promise<Site[]> {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (page) params.append("page", page.toString());
  params.append("limit", limit.toString());
  const res = await request<any>(`/customers/sites?${params.toString()}`, { method: "GET" });
  return Array.isArray(res) ? res : res?.data || [];
}

export interface CreateSiteDto {
  name: string;
  customerId: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  assignedSupervisorId?: string | null;
}
export async function createSite(dto: CreateSiteDto): Promise<Site> {
  return request<Site>("/customers/sites", { method: "POST", body: JSON.stringify(dto) });
}

export interface UpdateSiteDto {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  assignedSupervisorId?: string | null;
}
export async function updateSite(id: string, dto: UpdateSiteDto): Promise<Site> {
  return request<Site>(`/customers/sites/${id}`, { method: "PATCH", body: JSON.stringify(dto) });
}

export async function deleteSite(id: string): Promise<void> {
  return request<void>(`/customers/sites/${id}`, { method: "DELETE" });
}

export async function uploadSiteImage(id: string, file: File): Promise<Site> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(`${API_BASE_URL}/customers/sites/${id}/image`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  if (!response.ok) {
    const msg = await parseApiError(response, "Failed to upload site image");
    throw new Error(msg);
  }
  return response.json();
}

export function getSiteImageUrl(id: string): string {
  return `${API_BASE_URL}/customers/sites/${id}/image`;
}

// ─── Departments ──────────────────────────────────────────────────────────────

export async function getDepartments(search?: string, page?: number, limit = 10000): Promise<Department[]> {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (page) params.append("page", page.toString());
  params.append("limit", limit.toString());
  const res = await request<any>(`/customers/departments?${params.toString()}`, { method: "GET" });
  return Array.isArray(res) ? res : res?.data || [];
}

export interface CreateDepartmentDto {
  name: string;
  siteId: string;
  description?: string;
  assignedSupervisorId?: string | null;
}
export async function createDepartment(dto: CreateDepartmentDto): Promise<Department> {
  return request<Department>("/customers/departments", { method: "POST", body: JSON.stringify(dto) });
}

export interface UpdateDepartmentDto {
  name?: string;
  description?: string;
  siteId?: string;
  assignedSupervisorId?: string | null;
}
export async function updateDepartment(id: string, dto: UpdateDepartmentDto): Promise<Department> {
  return request<Department>(`/customers/departments/${id}`, { method: "PATCH", body: JSON.stringify(dto) });
}

export async function deleteDepartment(id: string): Promise<void> {
  return request<void>(`/customers/departments/${id}`, { method: "DELETE" });
}

// ─── Systems ──────────────────────────────────────────────────────────────────

export async function getSystems(search?: string, page?: number, limit = 10000): Promise<System[]> {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (page) params.append("page", page.toString());
  params.append("limit", limit.toString());
  const res = await request<any>(`/customers/systems?${params.toString()}`, { method: "GET" });
  return Array.isArray(res) ? res : res?.data || [];
}

export interface CreateSystemDto {
  name: string;
  departmentId: string;
  description?: string;
}
export async function createSystem(dto: CreateSystemDto): Promise<System> {
  return request<System>("/customers/systems", { method: "POST", body: JSON.stringify(dto) });
}

export interface UpdateSystemDto {
  name?: string;
  description?: string;
  departmentId?: string;
}
export async function updateSystem(id: string, dto: UpdateSystemDto): Promise<System> {
  return request<System>(`/customers/systems/${id}`, { method: "PATCH", body: JSON.stringify(dto) });
}

export async function deleteSystem(id: string): Promise<void> {
  return request<void>(`/customers/systems/${id}`, { method: "DELETE" });
}

export async function uploadSystemImage(id: string, file: File): Promise<System> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(`${API_BASE_URL}/customers/systems/${id}/image`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  if (!response.ok) {
    const msg = await parseApiError(response, "Failed to upload system image");
    throw new Error(msg);
  }
  return response.json();
}

export function getSystemImageUrl(id: string): string {
  return `${API_BASE_URL}/customers/systems/${id}/image`;
}

// ─── User Assignment ──────────────────────────────────────────────────────────

export async function getAssignableManagers(): Promise<AssignableUser[]> {
  return request<AssignableUser[]>("/customers/assignable-managers", { method: "GET" });
}

export async function getAssignableSupervisors(): Promise<AssignableUser[]> {
  return request<AssignableUser[]>("/customers/sites/assignable-supervisors", { method: "GET" });
}

export async function getAssignableDeptSupervisors(): Promise<AssignableUser[]> {
  return request<AssignableUser[]>("/customers/departments/assignable-supervisors", { method: "GET" });
}

// ─── Paginated API Queries ───────────────────────────────────────────────────

export interface PortfolioResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function fetchCustomers(search?: string, page?: number, limit = 10): Promise<PortfolioResponse<Customer>> {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (page) params.append("page", page.toString());
  params.append("limit", limit.toString());
  return request<PortfolioResponse<Customer>>(`/customers?${params.toString()}`, { method: "GET" });
}

export async function fetchSites(search?: string, page?: number, limit = 10): Promise<PortfolioResponse<Site>> {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (page) params.append("page", page.toString());
  params.append("limit", limit.toString());
  return request<PortfolioResponse<Site>>(`/customers/sites?${params.toString()}`, { method: "GET" });
}

export async function fetchDepartments(search?: string, page?: number, limit = 10): Promise<PortfolioResponse<Department>> {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (page) params.append("page", page.toString());
  params.append("limit", limit.toString());
  return request<PortfolioResponse<Department>>(`/customers/departments?${params.toString()}`, { method: "GET" });
}

export async function fetchSystems(search?: string, page?: number, limit = 10): Promise<PortfolioResponse<System>> {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (page) params.append("page", page.toString());
  params.append("limit", limit.toString());
  return request<PortfolioResponse<System>>(`/customers/systems?${params.toString()}`, { method: "GET" });
}

