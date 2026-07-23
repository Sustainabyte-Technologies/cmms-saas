import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFailureHistoryDto } from './dto/create-failure-history.dto';

@Injectable()
export class ReliabilityFailureHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateFailureHistoryDto, organizationId: string) {
    const start = new Date(dto.breakdownStart);
    const end = dto.breakdownEnd ? new Date(dto.breakdownEnd) : new Date();

    let downtime = dto.downtimeHours;
    if (downtime === undefined || downtime <= 0) {
      downtime = Math.max(0, (end.getTime() - start.getTime()) / (1000 * 60 * 60));
    }

    let repairTime = dto.repairTimeHours;
    if (repairTime === undefined || repairTime <= 0) {
      repairTime = downtime;
    }

    return this.prisma.failureHistory.create({
      data: {
        organizationId,
        assetId: dto.assetId,
        workOrderId: dto.workOrderId,
        incidentId: dto.incidentId,
        failureModeId: dto.failureModeId,
        failureModeText: dto.failureModeText,
        failureCause: dto.failureCause,
        failureEffect: dto.failureEffect,
        breakdownStart: start,
        breakdownEnd: end,
        downtimeHours: Number(downtime.toFixed(2)),
        repairTimeHours: Number(repairTime.toFixed(2)),
        technicianId: dto.technicianId,
        supervisorId: dto.supervisorId,
        repairCost: dto.repairCost ?? 0,
      },
      include: {
        asset: true,
        workOrder: true,
        incident: true,
        failureMode: true,
        technician: { select: { id: true, fullName: true } },
        supervisor: { select: { id: true, fullName: true } },
      },
    });
  }

  async syncCompletedWorkOrders(organizationId: string) {
    // Find all completed/closed breakdown work orders that do not have a failure history entry yet
    const completedWorkOrders = await this.prisma.workOrder.findMany({
      where: {
        organizationId,
        status: { in: ['COMPLETED', 'CLOSED'] },
        assetId: { not: null },
      },
      include: {
        failureHistories: true,
      },
    });

    let syncCount = 0;
    for (const wo of completedWorkOrders) {
      if (wo.failureHistories.length === 0 && wo.assetId) {
        const start = wo.breakdownStartedAt || wo.startDate || wo.createdAt;
        const end = wo.assetRestoredAt || wo.updatedAt || new Date();
        const downtime = Math.max(0.5, (end.getTime() - start.getTime()) / (1000 * 60 * 60));

        await this.prisma.failureHistory.create({
          data: {
            organizationId,
            assetId: wo.assetId,
            workOrderId: wo.id,
            failureModeText: wo.title,
            failureCause: wo.description || wo.resolutionNotes || 'Unspecified breakdown cause',
            failureEffect: `Work order ${wo.workOrderNumber} downtime impact`,
            breakdownStart: start,
            breakdownEnd: end,
            downtimeHours: Number(downtime.toFixed(2)),
            repairTimeHours: Number((wo.actualHours || downtime).toFixed(2)),
            technicianId: wo.assignedTechnicianId,
            supervisorId: wo.createdById,
            repairCost: (wo.actualHours || 2) * 45, // Standard labor rate estimate
          },
        });
        syncCount++;
      }
    }
    return { synced: syncCount };
  }

  async findAll(organizationId: string, query?: { search?: string; assetId?: string }) {
    await this.syncCompletedWorkOrders(organizationId);

    const where: any = { organizationId };
    if (query?.assetId && query.assetId !== 'ALL') {
      where.assetId = query.assetId;
    }

    if (query?.search) {
      where.OR = [
        { failureModeText: { contains: query.search, mode: 'insensitive' } },
        { failureCause: { contains: query.search, mode: 'insensitive' } },
        { asset: { assetName: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    return this.prisma.failureHistory.findMany({
      where,
      include: {
        asset: true,
        workOrder: true,
        incident: true,
        failureMode: true,
        technician: { select: { id: true, fullName: true } },
        supervisor: { select: { id: true, fullName: true } },
      },
      orderBy: { breakdownStart: 'desc' },
    });
  }

  async findOne(id: string, organizationId: string) {
    const item = await this.prisma.failureHistory.findFirst({
      where: { id, organizationId },
      include: {
        asset: true,
        workOrder: true,
        incident: true,
        failureMode: true,
        technician: { select: { id: true, fullName: true } },
        supervisor: { select: { id: true, fullName: true } },
      },
    });
    if (!item) throw new NotFoundException(`Failure History entry ${id} not found`);
    return item;
  }

  async remove(id: string, organizationId: string) {
    await this.findOne(id, organizationId);
    return this.prisma.failureHistory.delete({ where: { id } });
  }
}
