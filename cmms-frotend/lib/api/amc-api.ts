// API Service for AMC (Annual Maintenance Contract) Management Module

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export type ContractType = 'COMPREHENSIVE' | 'NON_COMPREHENSIVE' | 'LABOUR_ONLY' | 'PREVENTIVE_ONLY';
export type AMCStatus = 'DRAFT' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'RENEWED';
export type VisitStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'MISSED';

export interface AMCAssetItem {
  id: string;
  amcContractId: string;
  assetId: string;
  coverageType?: string;
  warrantyIncluded: boolean;
  remarks?: string;
  asset?: {
    id: string;
    assetCode: string;
    assetName: string;
    category: string;
    location: string;
  };
}

export interface AMCVisitItem {
  id: string;
  amcContractId: string;
  visitDate: string;
  technicianId?: string;
  visitType: string;
  status: VisitStatus;
  remarks?: string;
  checklist?: string;
  workOrderId?: string;
  technician?: { id: string; fullName: string; email: string };
  workOrder?: { id: string; workOrderNumber: string; title: string };
}

export interface AMCServiceHistoryItem {
  id: string;
  amcContractId: string;
  customerId: string;
  assetId: string;
  serviceTicketId?: string;
  workOrderId?: string;
  technicianId?: string;
  visitDate: string;
  partsUsed?: string;
  cost: number;
  remarks?: string;
  customer?: { id: string; name: string };
  asset?: { id: string; assetCode: string; assetName: string };
  technician?: { id: string; fullName: string };
  serviceTicket?: { id: string; ticketNumber: string; title: string };
  workOrder?: { id: string; workOrderNumber: string; title: string };
}

export interface AMCRenewalItem {
  id: string;
  amcContractId: string;
  newContractId?: string;
  renewalDate: string;
  previousStartDate: string;
  previousEndDate: string;
  newStartDate: string;
  newEndDate: string;
  previousValue: number;
  newValue: number;
  remarks?: string;
  renewedById: string;
  renewedBy?: { id: string; fullName: string };
}

export interface AMCContract {
  id: string;
  contractNumber: string;
  contractName: string;
  organizationId: string;
  customerId: string;
  siteId: string;
  departmentId?: string;
  startDate: string;
  endDate: string;
  contractType: ContractType;
  status: AMCStatus;
  contractValue: number;
  currency: string;
  slaResponseTime: number;
  slaResolutionTime: number;
  serviceFrequency: string;
  numberOfVisits: number;
  assignedManagerId?: string;
  remarks?: string;
  createdBy: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
  remainingDays?: number;
  customer?: { id: string; name: string; code: string };
  site?: { id: string; name: string; code: string };
  department?: { id: string; name: string; code: string };
  assignedManager?: { id: string; fullName: string; email: string };
  creator?: { id: string; fullName: string };
  assets?: AMCAssetItem[];
  visits?: AMCVisitItem[];
  serviceHistories?: AMCServiceHistoryItem[];
  renewals?: AMCRenewalItem[];
  _count?: {
    assets: number;
    visits: number;
    serviceHistories: number;
    renewals: number;
  };
}

export interface AMCStatistics {
  totalContracts: number;
  activeContracts: number;
  expiredContracts: number;
  expiringSoon: number;
  todaysVisits: number;
  upcomingVisits: number;
  slaBreaches: number;
  monthlyRevenue: number;
}

export interface AMCDashboardData {
  statistics: AMCStatistics;
  contractStatusDistribution: { status: string; count: number }[];
  contractTypeDistribution: { type: string; count: number }[];
  monthlyRenewalsTrend: { month: string; renewed: number; expired: number }[];
  upcomingExpiryTimeline: { id: string; contractNumber: string; contractName: string; customerName: string; endDate: string; remainingDays: number }[];
  revenueBreakdown: { type: string; revenue: number }[];
}

export interface QueryAMCParams {
  search?: string;
  customerId?: string;
  siteId?: string;
  departmentId?: string;
  contractType?: ContractType;
  status?: AMCStatus;
  expiringInDays?: number;
  page?: number;
  limit?: number;
}

async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    credentials: "include",
  });

  if (!response.ok) {
    let errorMsg = `HTTP ${response.status}: Error performing request`;
    try {
      const json = await response.json();
      errorMsg = json.message || json.error || errorMsg;
    } catch (e) {}
    throw new Error(errorMsg);
  }

  return response.json();
}

export async function fetchAMCDashboard(): Promise<AMCDashboardData> {
  return apiFetch("/amc/dashboard");
}

export async function fetchAMCStatistics(): Promise<AMCStatistics> {
  return apiFetch("/amc/statistics");
}

export async function fetchAMCContracts(params?: QueryAMCParams): Promise<{ data: AMCContract[]; meta: any }> {
  const query = new URLSearchParams();
  if (params?.search) query.append("search", params.search);
  if (params?.customerId) query.append("customerId", params.customerId);
  if (params?.siteId) query.append("siteId", params.siteId);
  if (params?.departmentId) query.append("departmentId", params.departmentId);
  if (params?.contractType) query.append("contractType", params.contractType);
  if (params?.status) query.append("status", params.status);
  if (params?.expiringInDays) query.append("expiringInDays", params.expiringInDays.toString());
  if (params?.page) query.append("page", params.page.toString());
  if (params?.limit) query.append("limit", params.limit.toString());

  return apiFetch(`/amc?${query.toString()}`);
}

export async function fetchAMCExpiringContracts(): Promise<AMCContract[]> {
  return apiFetch("/amc/expiring");
}

export async function fetchAMCById(id: string): Promise<AMCContract> {
  return apiFetch(`/amc/${id}`);
}

export async function createAMCContract(data: any): Promise<AMCContract> {
  return apiFetch("/amc", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateAMCContract(id: string, data: any): Promise<AMCContract> {
  return apiFetch(`/amc/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteAMCContract(id: string): Promise<any> {
  return apiFetch(`/amc/${id}`, { method: "DELETE" });
}

export async function mapAMCAssets(id: string, assets: any[]): Promise<any> {
  return apiFetch(`/amc/${id}/map-assets`, {
    method: "POST",
    body: JSON.stringify({ assets }),
  });
}

export async function renewAMCContract(id: string, data: any): Promise<AMCContract> {
  return apiFetch(`/amc/${id}/renew`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function generateAMCPM(id: string, data?: any): Promise<any> {
  return apiFetch(`/amc/${id}/generate-pm`, {
    method: "POST",
    body: JSON.stringify(data || {}),
  });
}

export async function checkAssetAMCStatus(assetId: string): Promise<any> {
  return apiFetch(`/amc/asset-status/${assetId}`);
}
