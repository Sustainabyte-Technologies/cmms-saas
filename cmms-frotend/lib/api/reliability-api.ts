// API Service for Reliability Engineering Module

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// ─── Enums & Interfaces ─────────────────────────────────────────────

export type CriticalityLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
export type FailureSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type RcaStatus = "DRAFT" | "INVESTIGATING" | "ACTION_REQUIRED" | "CLOSED";
export type RcmStrategy =
  | "PREVENTIVE_MAINTENANCE"
  | "PREDICTIVE_MAINTENANCE"
  | "CONDITION_MONITORING"
  | "INSPECTION"
  | "RUN_TO_FAILURE";

export interface AssetCriticality {
  id: string;
  assetId: string;
  customerId?: string;
  siteId?: string;
  departmentId?: string;
  systemId?: string;
  safetyImpact: number;
  productionImpact: number;
  financialImpact: number;
  environmentalImpact: number;
  maintenanceImpact: number;
  criticalityScore: number;
  criticalityLevel: CriticalityLevel;
  reviewNotes?: string;
  reviewedById?: string;
  createdAt: string;
  updatedAt: string;
  asset?: { id: string; assetCode: string; assetName: string; category: string };
  customer?: { id: string; name: string };
  site?: { id: string; name: string };
  department?: { id: string; name: string };
  system?: { id: string; name: string };
  reviewedBy?: { id: string; fullName: string; email: string };
}

export interface FailureLibraryItem {
  id: string;
  failureCode: string;
  failureMode: string;
  description?: string;
  failureCategory: string;
  assetCategory: string;
  severity: FailureSeverity;
  recommendedAction?: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FailureHistoryItem {
  id: string;
  assetId: string;
  workOrderId?: string;
  incidentId?: string;
  failureModeId?: string;
  failureModeText: string;
  failureCause: string;
  failureEffect?: string;
  breakdownStart: string;
  breakdownEnd?: string;
  downtimeHours: number;
  repairTimeHours: number;
  technicianId?: string;
  supervisorId?: string;
  repairCost: number;
  createdAt: string;
  updatedAt: string;
  asset?: { id: string; assetCode: string; assetName: string };
  workOrder?: { id: string; workOrderNumber: string; title: string };
  incident?: { id: string; incidentNumber: string; title: string };
  failureMode?: { id: string; failureCode: string; failureMode: string };
  technician?: { id: string; fullName: string };
  supervisor?: { id: string; fullName: string };
}

export interface RootCauseAnalysisItem {
  id: string;
  rcaNumber: string;
  assetId: string;
  incidentId?: string;
  workOrderId?: string;
  rootCause: string;
  causeCategory: string;
  investigationNotes?: string;
  correctiveAction?: string;
  preventiveAction?: string;
  investigatorId?: string;
  status: RcaStatus;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
  asset?: { id: string; assetCode: string; assetName: string };
  incident?: { id: string; incidentNumber: string; title: string };
  workOrder?: { id: string; workOrderNumber: string; title: string };
  investigator?: { id: string; fullName: string; email: string };
}

export interface FmecaAssessmentItem {
  id: string;
  assetId: string;
  failureModeId?: string;
  failureModeText: string;
  failureCause: string;
  failureEffect: string;
  severity: number;
  occurrence: number;
  detection: number;
  rpn: number;
  riskRanking: CriticalityLevel;
  recommendedAction?: string;
  createdAt: string;
  updatedAt: string;
  asset?: { id: string; assetCode: string; assetName: string };
  failureMode?: { id: string; failureCode: string; failureMode: string };
}

export interface RcmAnalysisItem {
  id: string;
  assetId: string;
  assetFunction: string;
  functionalFailure: string;
  failureModeText: string;
  maintenanceStrategy: RcmStrategy;
  tasksDescription?: string;
  intervalDays?: number;
  assignedRoleId?: string;
  createdAt: string;
  updatedAt: string;
  asset?: { id: string; assetCode: string; assetName: string };
}

export interface ReliabilityKpiData {
  reliabilityScore: number;
  availability: number;
  mttr: number;
  mtbf: number;
  failureRate: number;
  breakdownCount: number;
  totalDowntimeHours: number;
  totalRepairHours: number;
  totalRepairCost: number;
  totalAssets: number;
}

export interface ReliabilityDashboardData {
  kpis: ReliabilityKpiData;
  totalCriticalAssets: number;
  highRiskAssets: number;
  failureRecordsCount: number;
  openRcaCases: number;
  topFailureModes: { mode: string; count: number }[];
  assetReliabilityRanking: {
    assetId: string;
    assetCode: string;
    assetName: string;
    criticalityLevel: string;
    downtimeHours: number;
    availability: number;
  }[];
  failureTrends: { month: string; failures: number; downtime: number }[];
  recentFailures: FailureHistoryItem[];
}

// ─── API Helper ──────────────────────────────────────────────────────

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

// ─── Dashboard & KPIs ───────────────────────────────────────────────

export async function fetchReliabilityDashboard(): Promise<ReliabilityDashboardData> {
  return apiFetch("/reliability/dashboard");
}

export async function fetchReliabilityKpis(): Promise<ReliabilityKpiData> {
  return apiFetch("/reliability/kpis");
}

export async function fetchAssetReliabilityKpis(): Promise<any[]> {
  return apiFetch("/reliability/kpis/assets");
}

// ─── Asset Criticality ───────────────────────────────────────────────

export async function fetchAssetCriticalities(params?: { search?: string; level?: string }): Promise<AssetCriticality[]> {
  const query = new URLSearchParams();
  if (params?.search) query.append("search", params.search);
  if (params?.level) query.append("level", params.level);
  return apiFetch(`/reliability/criticality?${query.toString()}`);
}

export async function createAssetCriticality(data: any): Promise<AssetCriticality> {
  return apiFetch("/reliability/criticality", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateAssetCriticality(id: string, data: any): Promise<AssetCriticality> {
  return apiFetch(`/reliability/criticality/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteAssetCriticality(id: string): Promise<any> {
  return apiFetch(`/reliability/criticality/${id}`, { method: "DELETE" });
}

// ─── Failure Library ─────────────────────────────────────────────────

export async function fetchFailureLibrary(params?: { search?: string; category?: string }): Promise<FailureLibraryItem[]> {
  const query = new URLSearchParams();
  if (params?.search) query.append("search", params.search);
  if (params?.category) query.append("category", params.category);
  return apiFetch(`/reliability/failure-library?${query.toString()}`);
}

export async function createFailureLibraryItem(data: any): Promise<FailureLibraryItem> {
  return apiFetch("/reliability/failure-library", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateFailureLibraryItem(id: string, data: any): Promise<FailureLibraryItem> {
  return apiFetch(`/reliability/failure-library/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteFailureLibraryItem(id: string): Promise<any> {
  return apiFetch(`/reliability/failure-library/${id}`, { method: "DELETE" });
}

// ─── Failure History ─────────────────────────────────────────────────

export async function fetchFailureHistory(params?: { search?: string; assetId?: string }): Promise<FailureHistoryItem[]> {
  const query = new URLSearchParams();
  if (params?.search) query.append("search", params.search);
  if (params?.assetId) query.append("assetId", params.assetId);
  return apiFetch(`/reliability/failure-history?${query.toString()}`);
}

export async function createFailureHistoryItem(data: any): Promise<FailureHistoryItem> {
  return apiFetch("/reliability/failure-history", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function syncFailureHistory(): Promise<any> {
  return apiFetch("/reliability/failure-history/sync", { method: "POST" });
}

export async function deleteFailureHistoryItem(id: string): Promise<any> {
  return apiFetch(`/reliability/failure-history/${id}`, { method: "DELETE" });
}

// ─── Root Cause Analysis (RCA) ──────────────────────────────────────

export async function fetchRootCauseAnalyses(params?: { search?: string; status?: string }): Promise<RootCauseAnalysisItem[]> {
  const query = new URLSearchParams();
  if (params?.search) query.append("search", params.search);
  if (params?.status) query.append("status", params.status);
  return apiFetch(`/reliability/rca?${query.toString()}`);
}

export async function createRootCauseAnalysis(data: any): Promise<RootCauseAnalysisItem> {
  return apiFetch("/reliability/rca", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateRootCauseAnalysis(id: string, data: any): Promise<RootCauseAnalysisItem> {
  return apiFetch(`/reliability/rca/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteRootCauseAnalysis(id: string): Promise<any> {
  return apiFetch(`/reliability/rca/${id}`, { method: "DELETE" });
}

// ─── FMECA ───────────────────────────────────────────────────────────

export async function fetchFmecaAssessments(params?: { search?: string; risk?: string }): Promise<FmecaAssessmentItem[]> {
  const query = new URLSearchParams();
  if (params?.search) query.append("search", params.search);
  if (params?.risk) query.append("risk", params.risk);
  return apiFetch(`/reliability/fmeca?${query.toString()}`);
}

export async function createFmecaAssessment(data: any): Promise<FmecaAssessmentItem> {
  return apiFetch("/reliability/fmeca", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateFmecaAssessment(id: string, data: any): Promise<FmecaAssessmentItem> {
  return apiFetch(`/reliability/fmeca/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteFmecaAssessment(id: string): Promise<any> {
  return apiFetch(`/reliability/fmeca/${id}`, { method: "DELETE" });
}

// ─── RCM Analysis ───────────────────────────────────────────────────

export async function fetchRcmAnalyses(params?: { search?: string; strategy?: string }): Promise<RcmAnalysisItem[]> {
  const query = new URLSearchParams();
  if (params?.search) query.append("search", params.search);
  if (params?.strategy) query.append("strategy", params.strategy);
  return apiFetch(`/reliability/rcm?${query.toString()}`);
}

export async function createRcmAnalysis(data: any): Promise<RcmAnalysisItem> {
  return apiFetch("/reliability/rcm", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateRcmAnalysis(id: string, data: any): Promise<RcmAnalysisItem> {
  return apiFetch(`/reliability/rcm/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteRcmAnalysis(id: string): Promise<any> {
  return apiFetch(`/reliability/rcm/${id}`, { method: "DELETE" });
}

// ─── Reliability Reports ─────────────────────────────────────────────

export async function fetchReliabilityReports(): Promise<any> {
  return apiFetch("/reliability/reports");
}
