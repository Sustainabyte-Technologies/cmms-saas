import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAssetCriticalityDto } from './dto/create-criticality.dto';
import { UpdateAssetCriticalityDto } from './dto/update-criticality.dto';
import { CriticalityLevel } from '@prisma/client';

@Injectable()
export class ReliabilityCriticalityService {
  constructor(private readonly prisma: PrismaService) {}

  private calculateLevel(score: number): CriticalityLevel {
    if (score >= 20) return CriticalityLevel.CRITICAL;
    if (score >= 15) return CriticalityLevel.HIGH;
    if (score >= 10) return CriticalityLevel.MEDIUM;
    return CriticalityLevel.LOW;
  }

  async create(dto: CreateAssetCriticalityDto, organizationId: string, userId: string) {
    const safety = dto.safetyImpact ?? 1;
    const production = dto.productionImpact ?? 1;
    const financial = dto.financialImpact ?? 1;
    const environmental = dto.environmentalImpact ?? 1;
    const maintenance = dto.maintenanceImpact ?? 1;

    const score = safety + production + financial + environmental + maintenance;
    const level = this.calculateLevel(score);

    return this.prisma.assetCriticality.create({
      data: {
        organizationId,
        assetId: dto.assetId,
        safetyImpact: safety,
        productionImpact: production,
        financialImpact: financial,
        environmentalImpact: environmental,
        maintenanceImpact: maintenance,
        criticalityScore: score,
        criticalityLevel: level,
        reviewNotes: dto.reviewNotes,
        reviewedById: userId,
      },
      include: {
        asset: {
          include: { customer: true, site: true, department: true, system: true },
        },
        reviewedBy: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });
  }

  async syncAllAssets(organizationId: string) {
    try {
      const allAssets = await this.prisma.asset.findMany({
        where: { organizationId },
        select: { id: true },
      });

      const existingCriticalities = await this.prisma.assetCriticality.findMany({
        where: { organizationId },
        select: { assetId: true },
      });

      const existingAssetIds = new Set(existingCriticalities.map((c) => c.assetId));
      const missingAssets = allAssets.filter((a) => !existingAssetIds.has(a.id));

      if (missingAssets.length > 0) {
        await this.prisma.assetCriticality.createMany({
          data: missingAssets.map((asset) => ({
            organizationId,
            assetId: asset.id,
            safetyImpact: 3,
            productionImpact: 3,
            financialImpact: 3,
            environmentalImpact: 3,
            maintenanceImpact: 3,
            criticalityScore: 15,
            criticalityLevel: CriticalityLevel.HIGH,
          })),
          skipDuplicates: true,
        });
      }
    } catch (err) {
      console.error('Error syncing assets for criticality:', err);
    }
  }

  async findAll(organizationId: string, query?: { search?: string; level?: string }) {
    await this.syncAllAssets(organizationId);

    const where: any = { organizationId };

    if (query?.level && query.level !== 'ALL') {
      where.criticalityLevel = query.level as CriticalityLevel;
    }

    if (query?.search) {
      where.asset = {
        OR: [
          { assetName: { contains: query.search, mode: 'insensitive' } },
          { assetCode: { contains: query.search, mode: 'insensitive' } },
        ],
      };
    }

    return this.prisma.assetCriticality.findMany({
      where,
      include: {
        asset: {
          include: { customer: true, site: true, department: true, system: true },
        },
        reviewedBy: {
          select: { id: true, fullName: true, email: true },
        },
      },
      orderBy: { criticalityScore: 'desc' },
    });
  }

  async findOne(id: string, organizationId: string) {
    const item = await this.prisma.assetCriticality.findFirst({
      where: { id, organizationId },
      include: {
        asset: {
          include: { customer: true, site: true, department: true, system: true },
        },
        reviewedBy: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });

    if (!item) throw new NotFoundException(`Criticality assessment ${id} not found`);
    return item;
  }

  async update(id: string, dto: UpdateAssetCriticalityDto, organizationId: string, userId: string) {
    const existing = await this.findOne(id, organizationId);

    const safety = dto.safetyImpact ?? existing.safetyImpact;
    const production = dto.productionImpact ?? existing.productionImpact;
    const financial = dto.financialImpact ?? existing.financialImpact;
    const environmental = dto.environmentalImpact ?? existing.environmentalImpact;
    const maintenance = dto.maintenanceImpact ?? existing.maintenanceImpact;

    const score = safety + production + financial + environmental + maintenance;
    const level = this.calculateLevel(score);

    return this.prisma.assetCriticality.update({
      where: { id },
      data: {
        safetyImpact: safety,
        productionImpact: production,
        financialImpact: financial,
        environmentalImpact: environmental,
        maintenanceImpact: maintenance,
        criticalityScore: score,
        criticalityLevel: level,
        reviewNotes: dto.reviewNotes,
        reviewedById: userId,
      },
      include: {
        asset: {
          include: { customer: true, site: true, department: true, system: true },
        },
        reviewedBy: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });
  }

  async remove(id: string, organizationId: string) {
    await this.findOne(id, organizationId);
    return this.prisma.assetCriticality.delete({ where: { id } });
  }
}
