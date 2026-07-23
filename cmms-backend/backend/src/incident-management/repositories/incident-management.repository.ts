import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateIncidentDto } from '../dto/create-incident.dto';
import { UpdateIncidentDto } from '../dto/update-incident.dto';
import { QueryIncidentDto } from '../dto/query-incident.dto';
import { CreateWorkOrderFromIncidentDto } from '../dto/create-workorder.dto';
import { IncidentStatus, IncidentSeverity, IncidentType } from '../enums/incident.enums';

@Injectable()
export class IncidentManagementRepository {
  constructor(private readonly prisma: PrismaService) {}

  private get defaultInclude() {
    return {
      organization: { select: { id: true, name: true } },
      customer: { select: { id: true, name: true, code: true } },
      site: { select: { id: true, name: true, code: true } },
      department: { select: { id: true, name: true, code: true } },
      asset: { select: { id: true, assetCode: true, assetName: true, location: true } },
      workOrder: {
        select: {
          id: true,
          workOrderNumber: true,
          title: true,
          status: true,
          priority: true,
          assignedTechnician: { select: { id: true, fullName: true } },
        },
      },
      reporter: { select: { id: true, fullName: true, email: true } },
      investigator: { select: { id: true, fullName: true, email: true } },
      creator: { select: { id: true, fullName: true, email: true } },
    };
  }

  async generateIncidentNumber(organizationId: string): Promise<string> {
    const count = await this.prisma.incident.count({
      where: { organizationId },
    });
    const nextNumber = count + 1;
    return `INC-${nextNumber.toString().padStart(6, '0')}`;
  }

  async create(
    dto: CreateIncidentDto,
    organizationId: string,
    userId: string,
  ) {
    const incidentNumber = await this.generateIncidentNumber(organizationId);

    return this.prisma.incident.create({
      data: {
        incidentNumber,
        title: dto.title,
        description: dto.description,
        incidentType: dto.incidentType as any,
        severity: dto.severity as any,
        status: IncidentStatus.OPEN as any,
        incidentDate: new Date(dto.incidentDate),
        location: dto.location,
        organizationId,
        customerId: dto.customerId,
        siteId: dto.siteId,
        departmentId: dto.departmentId,
        reportedById: dto.reportedById,
        assignedToId: dto.assignedToId || null,
        assetId: dto.assetId || null,
        rootCause: dto.rootCause || null,
        correctiveAction: dto.correctiveAction || null,
        preventiveAction: dto.preventiveAction || null,
        remarks: dto.remarks || null,
        createdBy: userId,
      },
      include: this.defaultInclude,
    });
  }

  async findMany(organizationId: string, query: QueryIncidentDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = { organizationId };

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { incidentNumber: { contains: query.search, mode: 'insensitive' } },
        { location: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.incidentType) where.incidentType = query.incidentType;
    if (query.severity) where.severity = query.severity;
    if (query.status) where.status = query.status;
    if (query.siteId) where.siteId = query.siteId;
    if (query.departmentId) where.departmentId = query.departmentId;
    if (query.customerId) where.customerId = query.customerId;
    if (query.assetId) where.assetId = query.assetId;

    const [incidents, total] = await Promise.all([
      this.prisma.incident.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: this.defaultInclude,
      }),
      this.prisma.incident.count({ where }),
    ]);

    return {
      incidents,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findById(id: string, organizationId: string) {
    return this.prisma.incident.findFirst({
      where: { id, organizationId },
      include: this.defaultInclude,
    });
  }

  async update(
    id: string,
    organizationId: string,
    dto: UpdateIncidentDto,
    userId: string,
  ) {
    const data: any = { ...dto, updatedBy: userId };

    if (dto.incidentDate) {
      data.incidentDate = new Date(dto.incidentDate);
    }

    return this.prisma.incident.update({
      where: { id },
      data,
      include: this.defaultInclude,
    });
  }

  async updateStatus(
    id: string,
    organizationId: string,
    status: IncidentStatus,
    extraFields: {
      resolution?: string;
      rootCause?: string;
      correctiveAction?: string;
      preventiveAction?: string;
      remarks?: string;
    },
    userId: string,
  ) {
    const data: any = {
      status: status as any,
      updatedBy: userId,
      ...extraFields,
    };

    if (status === IncidentStatus.CLOSED) {
      data.closedAt = new Date();
    }

    return this.prisma.incident.update({
      where: { id },
      data,
      include: this.defaultInclude,
    });
  }

  async delete(id: string, organizationId: string) {
    return this.prisma.incident.delete({
      where: { id },
    });
  }

  async createWorkOrderFromIncident(
    incidentId: string,
    organizationId: string,
    dto: CreateWorkOrderFromIncidentDto,
    userId: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const incident = await tx.incident.findFirst({
        where: { id: incidentId, organizationId },
      });

      if (!incident) {
        throw new Error('Incident not found');
      }

      if (incident.isWorkOrderCreated || incident.workOrderId) {
        throw new Error('Work Order already exists for this incident');
      }

      // Generate Work Order Number
      const woCount = await tx.workOrder.count({ where: { organizationId } });
      const workOrderNumber = `WO-${(woCount + 1).toString().padStart(6, '0')}`;

      // Create Work Order
      const workOrder = await tx.workOrder.create({
        data: {
          workOrderNumber,
          title: dto.title || `Work Order for ${incident.incidentNumber}`,
          description: dto.description || incident.description,
          organizationId,
          location: dto.location || incident.location,
          priority: (dto.priority as any) || (incident.severity === 'CRITICAL' ? 'CRITICAL' : 'HIGH'),
          assetId: incident.assetId,
          createdById: userId,
          assignedTechnicianId: dto.assignedTechnicianId || null,
          workType: 'REACTIVE',
        },
      });

      // Update Incident
      const updatedIncident = await tx.incident.update({
        where: { id: incidentId },
        data: {
          workOrderId: workOrder.id,
          isWorkOrderCreated: true,
          updatedBy: userId,
        },
        include: this.defaultInclude,
      });

      return {
        incident: updatedIncident,
        workOrder,
      };
    });
  }

  async getDashboardStats(organizationId: string) {
    const [
      total,
      open,
      underInvestigation,
      correctiveAction,
      resolved,
      closed,
      critical,
      high,
      nearMiss,
      fire,
      electrical,
      recentIncidents,
      allIncidentsForCharts,
    ] = await Promise.all([
      this.prisma.incident.count({ where: { organizationId } }),
      this.prisma.incident.count({ where: { organizationId, status: 'OPEN' } }),
      this.prisma.incident.count({ where: { organizationId, status: 'UNDER_INVESTIGATION' } }),
      this.prisma.incident.count({ where: { organizationId, status: 'CORRECTIVE_ACTION' } }),
      this.prisma.incident.count({ where: { organizationId, status: 'RESOLVED' } }),
      this.prisma.incident.count({ where: { organizationId, status: 'CLOSED' } }),
      this.prisma.incident.count({ where: { organizationId, severity: 'CRITICAL' } }),
      this.prisma.incident.count({ where: { organizationId, severity: 'HIGH' } }),
      this.prisma.incident.count({ where: { organizationId, incidentType: 'NEAR_MISS' } }),
      this.prisma.incident.count({ where: { organizationId, incidentType: 'FIRE' } }),
      this.prisma.incident.count({ where: { organizationId, incidentType: 'ELECTRICAL' } }),
      this.prisma.incident.findMany({
        where: { organizationId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: this.defaultInclude,
      }),
      this.prisma.incident.findMany({
        where: { organizationId },
        select: {
          id: true,
          status: true,
          severity: true,
          incidentType: true,
          createdAt: true,
        },
      }),
    ]);

    // Monthly Trend Calculation (Last 6 Months)
    const monthsMap: Record<string, number> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
      monthsMap[key] = 0;
    }

    allIncidentsForCharts.forEach((inc) => {
      const key = new Date(inc.createdAt).toLocaleString('en-US', {
        month: 'short',
        year: 'numeric',
      });
      if (monthsMap[key] !== undefined) {
        monthsMap[key]++;
      }
    });

    const monthlyTrend = Object.entries(monthsMap).map(([month, count]) => ({
      month,
      count,
    }));

    // Status Distribution
    const statusDistribution = [
      { name: 'Open', value: open, color: '#f59e0b' },
      { name: 'Under Investigation', value: underInvestigation, color: '#3b82f6' },
      { name: 'Corrective Action', value: correctiveAction, color: '#8b5cf6' },
      { name: 'Resolved', value: resolved, color: '#10b981' },
      { name: 'Closed', value: closed, color: '#6b7280' },
    ];

    // Severity Distribution
    const severityMap: Record<string, number> = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
    allIncidentsForCharts.forEach((inc) => {
      if (severityMap[inc.severity] !== undefined) {
        severityMap[inc.severity]++;
      }
    });

    const severityDistribution = [
      { name: 'Low', value: severityMap.LOW, color: '#10b981' },
      { name: 'Medium', value: severityMap.MEDIUM, color: '#3b82f6' },
      { name: 'High', value: severityMap.HIGH, color: '#f59e0b' },
      { name: 'Critical', value: severityMap.CRITICAL, color: '#ef4444' },
    ];

    // Type Distribution
    const typeCounts: Record<string, number> = {};
    allIncidentsForCharts.forEach((inc) => {
      typeCounts[inc.incidentType] = (typeCounts[inc.incidentType] || 0) + 1;
    });

    const typeDistribution = Object.entries(typeCounts).map(([type, count]) => ({
      type,
      count,
    }));

    return {
      metrics: {
        total,
        open,
        underInvestigation,
        correctiveAction,
        resolved,
        closed,
        critical,
        high,
        nearMiss,
        fire,
        electrical,
      },
      monthlyTrend,
      statusDistribution,
      severityDistribution,
      typeDistribution,
      recentIncidents,
    };
  }
}
