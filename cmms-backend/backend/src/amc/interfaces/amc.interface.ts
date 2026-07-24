import { ContractType, AMCStatus, VisitStatus } from '../enums/amc.enums';

export interface AMCContractFilter {
  search?: string;
  customerId?: string;
  siteId?: string;
  departmentId?: string;
  contractType?: ContractType;
  status?: AMCStatus;
  expiringInDays?: number;
  assignedManagerId?: string;
  page?: number;
  limit?: number;
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
  contractStatusDistribution: Array<{ status: string; count: number }>;
  contractTypeDistribution: Array<{ type: string; count: number }>;
  monthlyRenewalsTrend: Array<{ month: string; renewed: number; expired: number }>;
  upcomingExpiryTimeline: Array<{ id: string; contractNumber: string; contractName: string; customerName: string; endDate: Date; remainingDays: number }>;
  revenueBreakdown: Array<{ type: string; revenue: number }>;
}
