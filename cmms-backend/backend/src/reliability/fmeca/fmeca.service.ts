import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFmecaDto } from './dto/create-fmeca.dto';
import { UpdateFmecaDto } from './dto/update-fmeca.dto';
import { CriticalityLevel } from '@prisma/client';

@Injectable()
export class ReliabilityFmecaService {
  constructor(private readonly prisma: PrismaService) {}

  private calculateRpnAndRisk(severity: number, occurrence: number, detection: number) {
    const rpn = severity * occurrence * detection;
    let riskRanking = CriticalityLevel.LOW;
    if (rpn >= 200) riskRanking = CriticalityLevel.CRITICAL;
    else if (rpn >= 120) riskRanking = CriticalityLevel.HIGH;
    else if (rpn >= 60) riskRanking = CriticalityLevel.MEDIUM;

    return { rpn, riskRanking };
  }

  async create(dto: CreateFmecaDto, organizationId: string) {
    const { rpn, riskRanking } = this.calculateRpnAndRisk(dto.severity, dto.occurrence, dto.detection);

    return this.prisma.fmecaAssessment.create({
      data: {
        organizationId,
        assetId: dto.assetId,
        failureModeId: dto.failureModeId,
        failureModeText: dto.failureModeText,
        failureCause: dto.failureCause,
        failureEffect: dto.failureEffect,
        severity: dto.severity,
        occurrence: dto.occurrence,
        detection: dto.detection,
        rpn,
        riskRanking,
        recommendedAction: dto.recommendedAction,
      },
      include: {
        asset: true,
        failureMode: true,
      },
    });
  }

  async findAll(organizationId: string, query?: { search?: string; risk?: string }) {
    const where: any = { organizationId };

    if (query?.risk && query.risk !== 'ALL') {
      where.riskRanking = query.risk as CriticalityLevel;
    }

    if (query?.search) {
      where.OR = [
        { failureModeText: { contains: query.search, mode: 'insensitive' } },
        { failureCause: { contains: query.search, mode: 'insensitive' } },
        { asset: { assetName: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    return this.prisma.fmecaAssessment.findMany({
      where,
      include: {
        asset: true,
        failureMode: true,
      },
      orderBy: { rpn: 'desc' },
    });
  }

  async findOne(id: string, organizationId: string) {
    const item = await this.prisma.fmecaAssessment.findFirst({
      where: { id, organizationId },
      include: {
        asset: true,
        failureMode: true,
      },
    });

    if (!item) throw new NotFoundException(`FMECA Assessment ${id} not found`);
    return item;
  }

  async update(id: string, dto: UpdateFmecaDto, organizationId: string) {
    const existing = await this.findOne(id, organizationId);
    const sev = dto.severity ?? existing.severity;
    const occ = dto.occurrence ?? existing.occurrence;
    const det = dto.detection ?? existing.detection;

    const { rpn, riskRanking } = this.calculateRpnAndRisk(sev, occ, det);

    return this.prisma.fmecaAssessment.update({
      where: { id },
      data: {
        ...dto,
        severity: sev,
        occurrence: occ,
        detection: det,
        rpn,
        riskRanking,
      },
      include: {
        asset: true,
        failureMode: true,
      },
    });
  }

  async remove(id: string, organizationId: string) {
    await this.findOne(id, organizationId);
    return this.prisma.fmecaAssessment.delete({ where: { id } });
  }
}
