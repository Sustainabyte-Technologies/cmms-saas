import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateServiceTicketDto } from '../dto/create-service-ticket.dto';
import { UpdateServiceTicketDto } from '../dto/update-service-ticket.dto';
import { QueryServiceTicketDto } from '../dto/query-service-ticket.dto';
import { CreateWorkOrderFromTicketDto } from '../dto/create-workorder.dto';
import { TicketStatus, TicketPriority, TicketCategory } from '../enums/service-ticket.enums';

@Injectable()
export class ServiceTicketRepository {
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
      requester: { select: { id: true, fullName: true, email: true, role: { select: { name: true } } } },
      assignee: { select: { id: true, fullName: true, email: true, role: { select: { name: true } } } },
      creator: { select: { id: true, fullName: true, email: true } },
    };
  }

  async generateTicketNumber(organizationId: string): Promise<string> {
    const count = await this.prisma.serviceTicket.count({
      where: { organizationId },
    });
    const nextNumber = count + 1;
    return `ST-${nextNumber.toString().padStart(6, '0')}`;
  }

  async create(
    dto: CreateServiceTicketDto,
    organizationId: string,
    userId: string,
  ) {
    const ticketNumber = await this.generateTicketNumber(organizationId);

    return this.prisma.serviceTicket.create({
      data: {
        ticketNumber,
        title: dto.title,
        description: dto.description,
        category: dto.category as any,
        priority: dto.priority as any,
        status: (dto.assignedToId ? TicketStatus.ASSIGNED : TicketStatus.NEW) as any,
        requestDate: dto.requestDate ? new Date(dto.requestDate) : new Date(),
        location: dto.location,
        organizationId,
        customerId: dto.customerId,
        siteId: dto.siteId,
        departmentId: dto.departmentId,
        requestedById: dto.requestedById,
        assignedToId: dto.assignedToId || null,
        assetId: dto.assetId || null,
        remarks: dto.remarks || null,
        createdBy: userId,
      },
      include: this.defaultInclude,
    });
  }

  async findMany(organizationId: string, query: QueryServiceTicketDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = { organizationId };

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { ticketNumber: { contains: query.search, mode: 'insensitive' } },
        { location: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.category) where.category = query.category;
    if (query.priority) where.priority = query.priority;
    if (query.status) where.status = query.status;
    if (query.siteId) where.siteId = query.siteId;
    if (query.departmentId) where.departmentId = query.departmentId;
    if (query.customerId) where.customerId = query.customerId;
    if (query.assetId) where.assetId = query.assetId;

    const [tickets, total] = await Promise.all([
      this.prisma.serviceTicket.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: this.defaultInclude,
      }),
      this.prisma.serviceTicket.count({ where }),
    ]);

    return {
      serviceTickets: tickets,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findById(id: string, organizationId: string) {
    return this.prisma.serviceTicket.findFirst({
      where: { id, organizationId },
      include: this.defaultInclude,
    });
  }

  async update(
    id: string,
    organizationId: string,
    dto: UpdateServiceTicketDto,
    userId: string,
  ) {
    const data: any = { ...dto, updatedBy: userId };

    if (dto.requestDate) {
      data.requestDate = new Date(dto.requestDate);
    }

    return this.prisma.serviceTicket.update({
      where: { id },
      data,
      include: this.defaultInclude,
    });
  }

  async updateStatus(
    id: string,
    organizationId: string,
    status: TicketStatus,
    extraFields: {
      resolution?: string;
      remarks?: string;
      assignedToId?: string;
    },
    userId: string,
  ) {
    const data: any = {
      status: status as any,
      updatedBy: userId,
      ...extraFields,
    };

    if (status === TicketStatus.CLOSED || status === TicketStatus.RESOLVED) {
      data.closedAt = new Date();
    }

    return this.prisma.serviceTicket.update({
      where: { id },
      data,
      include: this.defaultInclude,
    });
  }

  async delete(id: string, organizationId: string) {
    return this.prisma.serviceTicket.delete({
      where: { id },
    });
  }

  async createWorkOrderFromTicket(
    ticketId: string,
    organizationId: string,
    dto: CreateWorkOrderFromTicketDto,
    userId: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const ticket = await tx.serviceTicket.findFirst({
        where: { id: ticketId, organizationId },
      });

      if (!ticket) {
        throw new Error('Service Ticket not found');
      }

      if (ticket.isWorkOrderCreated || ticket.workOrderId) {
        throw new Error('Work Order already exists for this Service Ticket');
      }

      // Generate Work Order Number
      const woCount = await tx.workOrder.count({ where: { organizationId } });
      const workOrderNumber = `WO-${(woCount + 1).toString().padStart(6, '0')}`;

      // Create Work Order
      const workOrder = await tx.workOrder.create({
        data: {
          workOrderNumber,
          title: dto.title || `Work Order for ${ticket.ticketNumber}`,
          description: dto.description || ticket.description,
          organizationId,
          location: dto.location || ticket.location,
          priority: (dto.priority as any) || (ticket.priority === 'URGENT' ? 'CRITICAL' : ticket.priority),
          assetId: ticket.assetId,
          createdById: userId,
          assignedTechnicianId: dto.assignedTechnicianId || ticket.assignedToId || null,
          workType: 'REACTIVE',
        },
      });

      // Update Service Ticket
      const updatedTicket = await tx.serviceTicket.update({
        where: { id: ticketId },
        data: {
          workOrderId: workOrder.id,
          isWorkOrderCreated: true,
          status: TicketStatus.IN_PROGRESS as any,
          updatedBy: userId,
        },
        include: this.defaultInclude,
      });

      return {
        serviceTicket: updatedTicket,
        workOrder,
      };
    });
  }

  async getDashboardStats(organizationId: string) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      total,
      newTickets,
      assigned,
      inProgress,
      onHold,
      resolved,
      closed,
      urgent,
      overdue,
      recentTickets,
      allTicketsForCharts,
    ] = await Promise.all([
      this.prisma.serviceTicket.count({ where: { organizationId } }),
      this.prisma.serviceTicket.count({ where: { organizationId, status: 'NEW' } }),
      this.prisma.serviceTicket.count({ where: { organizationId, status: 'ASSIGNED' } }),
      this.prisma.serviceTicket.count({ where: { organizationId, status: 'IN_PROGRESS' } }),
      this.prisma.serviceTicket.count({ where: { organizationId, status: 'ON_HOLD' } }),
      this.prisma.serviceTicket.count({ where: { organizationId, status: 'RESOLVED' } }),
      this.prisma.serviceTicket.count({ where: { organizationId, status: 'CLOSED' } }),
      this.prisma.serviceTicket.count({ where: { organizationId, priority: 'URGENT' } }),
      this.prisma.serviceTicket.count({
        where: {
          organizationId,
          status: { in: ['NEW', 'ASSIGNED', 'IN_PROGRESS'] },
          requestDate: { lt: sevenDaysAgo },
        },
      }),
      this.prisma.serviceTicket.findMany({
        where: { organizationId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: this.defaultInclude,
      }),
      this.prisma.serviceTicket.findMany({
        where: { organizationId },
        select: {
          id: true,
          status: true,
          priority: true,
          category: true,
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

    allTicketsForCharts.forEach((t) => {
      const key = new Date(t.createdAt).toLocaleString('en-US', {
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
      { name: 'New', value: newTickets, color: '#3b82f6' },
      { name: 'Assigned', value: assigned, color: '#8b5cf6' },
      { name: 'In Progress', value: inProgress, color: '#f59e0b' },
      { name: 'On Hold', value: onHold, color: '#ef4444' },
      { name: 'Resolved', value: resolved, color: '#10b981' },
      { name: 'Closed', value: closed, color: '#6b7280' },
    ];

    // Priority Distribution
    const priorityMap: Record<string, number> = { LOW: 0, MEDIUM: 0, HIGH: 0, URGENT: 0 };
    allTicketsForCharts.forEach((t) => {
      if (priorityMap[t.priority] !== undefined) {
        priorityMap[t.priority]++;
      }
    });

    const priorityDistribution = [
      { name: 'Low', value: priorityMap.LOW, color: '#10b981' },
      { name: 'Medium', value: priorityMap.MEDIUM, color: '#3b82f6' },
      { name: 'High', value: priorityMap.HIGH, color: '#f59e0b' },
      { name: 'Urgent', value: priorityMap.URGENT, color: '#ef4444' },
    ];

    // Category Distribution
    const categoryCounts: Record<string, number> = {};
    allTicketsForCharts.forEach((t) => {
      categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
    });

    const categoryDistribution = Object.entries(categoryCounts).map(([category, count]) => ({
      category,
      count,
    }));

    return {
      metrics: {
        total,
        newTickets,
        assigned,
        inProgress,
        onHold,
        resolved,
        closed,
        urgent,
        overdue,
      },
      monthlyTrend,
      statusDistribution,
      priorityDistribution,
      categoryDistribution,
      recentTickets,
    };
  }
}
