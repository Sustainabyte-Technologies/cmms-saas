import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRcaDto } from './dto/create-rca.dto';
import { UpdateRcaDto } from './dto/update-rca.dto';
import { RcaStatus } from '@prisma/client';

@Injectable()
export class ReliabilityRcaService {
  constructor(private readonly prisma: PrismaService) {}

  private async generateRcaNumber(organizationId: string): Promise<string> {
    const count = await this.prisma.rootCauseAnalysis.count({ where: { organizationId } });
    return `RCA-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
  }

  async create(dto: CreateRcaDto, organizationId: string, userId: string) {
    const rcaNumber = await this.generateRcaNumber(organizationId);

    return this.prisma.rootCauseAnalysis.create({
      data: {
        organizationId,
        rcaNumber,
        assetId: dto.assetId,
        incidentId: dto.incidentId,
        workOrderId: dto.workOrderId,
        rootCause: dto.rootCause,
        causeCategory: dto.causeCategory,
        investigationNotes: dto.investigationNotes,
        correctiveAction: dto.correctiveAction,
        preventiveAction: dto.preventiveAction,
        investigatorId: dto.investigatorId || userId,
        status: dto.status || RcaStatus.DRAFT,
      },
      include: {
        asset: true,
        incident: true,
        workOrder: true,
        investigator: { select: { id: true, fullName: true, email: true } },
      },
    });
  }

  async findAll(organizationId: string, query?: { search?: string; status?: string }) {
    const where: any = { organizationId };

    if (query?.status && query.status !== 'ALL') {
      where.status = query.status as RcaStatus;
    }

    if (query?.search) {
      where.OR = [
        { rcaNumber: { contains: query.search, mode: 'insensitive' } },
        { rootCause: { contains: query.search, mode: 'insensitive' } },
        { causeCategory: { contains: query.search, mode: 'insensitive' } },
        { asset: { assetName: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    return this.prisma.rootCauseAnalysis.findMany({
      where,
      include: {
        asset: true,
        incident: true,
        workOrder: true,
        investigator: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, organizationId: string) {
    const item = await this.prisma.rootCauseAnalysis.findFirst({
      where: { id, organizationId },
      include: {
        asset: true,
        incident: true,
        workOrder: true,
        investigator: { select: { id: true, fullName: true, email: true } },
      },
    });

    if (!item) throw new NotFoundException(`RCA Record ${id} not found`);
    return item;
  }

  async update(id: string, dto: UpdateRcaDto, organizationId: string) {
    await this.findOne(id, organizationId);
    const isClosing = dto.status === RcaStatus.CLOSED;

    return this.prisma.rootCauseAnalysis.update({
      where: { id },
      data: {
        ...dto,
        closedAt: isClosing ? new Date() : undefined,
      },
      include: {
        asset: true,
        incident: true,
        workOrder: true,
        investigator: { select: { id: true, fullName: true, email: true } },
      },
    });
  }

  async remove(id: string, organizationId: string) {
    await this.findOne(id, organizationId);
    return this.prisma.rootCauseAnalysis.delete({ where: { id } });
  }
}
