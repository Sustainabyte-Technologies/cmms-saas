import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRcmDto } from './dto/create-rcm.dto';
import { UpdateRcmDto } from './dto/update-rcm.dto';
import { RcmStrategy } from '@prisma/client';

@Injectable()
export class ReliabilityRcmService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRcmDto, organizationId: string) {
    return this.prisma.rcmAnalysis.create({
      data: {
        ...dto,
        organizationId,
      },
      include: {
        asset: true,
      },
    });
  }

  async findAll(organizationId: string, query?: { search?: string; strategy?: string }) {
    const where: any = { organizationId };

    if (query?.strategy && query.strategy !== 'ALL') {
      where.maintenanceStrategy = query.strategy as RcmStrategy;
    }

    if (query?.search) {
      where.OR = [
        { assetFunction: { contains: query.search, mode: 'insensitive' } },
        { functionalFailure: { contains: query.search, mode: 'insensitive' } },
        { failureModeText: { contains: query.search, mode: 'insensitive' } },
        { asset: { assetName: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    return this.prisma.rcmAnalysis.findMany({
      where,
      include: {
        asset: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, organizationId: string) {
    const item = await this.prisma.rcmAnalysis.findFirst({
      where: { id, organizationId },
      include: {
        asset: true,
      },
    });

    if (!item) throw new NotFoundException(`RCM Analysis ${id} not found`);
    return item;
  }

  async update(id: string, dto: UpdateRcmDto, organizationId: string) {
    await this.findOne(id, organizationId);
    return this.prisma.rcmAnalysis.update({
      where: { id },
      data: dto,
      include: {
        asset: true,
      },
    });
  }

  async remove(id: string, organizationId: string) {
    await this.findOne(id, organizationId);
    return this.prisma.rcmAnalysis.delete({ where: { id } });
  }
}
