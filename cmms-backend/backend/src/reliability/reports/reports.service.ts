import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ReliabilityKpiService } from '../kpi/kpi.service';

@Injectable()
export class ReliabilityReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly kpiService: ReliabilityKpiService,
  ) {}

  async getReportsSummary(organizationId: string) {
    const kpis = await this.kpiService.getKpis(organizationId);
    const criticalitiesCount = await this.prisma.assetCriticality.count({ where: { organizationId } });
    const libraryCount = await this.prisma.failureLibrary.count({ where: { organizationId } });
    const historyCount = await this.prisma.failureHistory.count({ where: { organizationId } });
    const rcaCount = await this.prisma.rootCauseAnalysis.count({ where: { organizationId } });
    const fmecaCount = await this.prisma.fmecaAssessment.count({ where: { organizationId } });
    const rcmCount = await this.prisma.rcmAnalysis.count({ where: { organizationId } });

    const topCriticalityAssets = await this.prisma.assetCriticality.findMany({
      where: { organizationId },
      include: { asset: { include: { department: true } } },
      take: 5,
      orderBy: { criticalityScore: 'desc' },
    });

    const topFmecaRisks = await this.prisma.fmecaAssessment.findMany({
      where: { organizationId },
      include: { asset: true },
      take: 5,
      orderBy: { rpn: 'desc' },
    });

    return {
      kpis,
      summary: {
        criticalitiesCount,
        libraryCount,
        historyCount,
        rcaCount,
        fmecaCount,
        rcmCount,
      },
      topCriticalityAssets,
      topFmecaRisks,
      generatedAt: new Date().toISOString(),
    };
  }
}
