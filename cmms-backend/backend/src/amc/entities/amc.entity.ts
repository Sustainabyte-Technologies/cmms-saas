import { ContractType, AMCStatus } from '../enums/amc.enums';

export class AMCEntity {
  id: string;
  contractNumber: string;
  contractName: string;
  organizationId: string;
  customerId: string;
  siteId: string;
  departmentId?: string;
  startDate: Date;
  endDate: Date;
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
  createdAt: Date;
  updatedAt: Date;
  remainingDays?: number;
}
