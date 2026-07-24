import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReliabilityKpiService {
  constructor(private readonly prisma: PrismaService) {}

  async getKpis(organizationId: string) {
    const totalAssets = await this.prisma.asset.count({ where: { organizationId } });
    const failureRecords = await this.prisma.failureHistory.findMany({
      where: { organizationId },
      include: { asset: true },
    });

    const breakdownCount = failureRecords.length;
    const totalDowntimeHours = failureRecords.reduce((sum, item) => sum + item.downtimeHours, 0);
    const totalRepairHours = failureRecords.reduce((sum, item) => sum + item.repairTimeHours, 0);
    const totalRepairCost = failureRecords.reduce((sum, item) => sum + item.repairCost, 0);

    // Standard 30-day operating baseline (720 operating hours per asset)
    const totalOperatingHoursBaseline = Math.max(1, totalAssets * 720);
    const actualOperatingHours = Math.max(1, totalOperatingHoursBaseline - totalDowntimeHours);

    // MTTR = Total Repair Hours / Breakdown Count
    const mttr = breakdownCount > 0 ? Number((totalRepairHours / breakdownCount).toFixed(2)) : 1.5;

    // MTBF = Operating Hours / Breakdown Count
    const mtbf = breakdownCount > 0 ? Number((actualOperatingHours / breakdownCount).toFixed(2)) : 720.0;

    // Availability % = (MTBF / (MTBF + MTTR)) * 100
    const availability = Number(((mtbf / (mtbf + mttr)) * 100).toFixed(2));

    // Failure Rate = (Breakdown Count / Actual Operating Hours) * 1000
    const failureRate = Number(((breakdownCount / actualOperatingHours) * 1000).toFixed(2));

    // Calculate score (0 to 100) based on availability, MTBF/MTTR ratio
    const reliabilityScore = Math.min(100, Math.max(0, Math.round(availability * 0.95 + (mtbf > 200 ? 5 : 0))));

    return {
      reliabilityScore,
      availability,
      mttr,
      mtbf,
      failureRate,
      breakdownCount,
      totalDowntimeHours: Number(totalDowntimeHours.toFixed(1)),
      totalRepairHours: Number(totalRepairHours.toFixed(1)),
      totalRepairCost: Number(totalRepairCost.toFixed(2)),
      totalAssets,
    };
  }

  async getAssetKpis(organizationId: string) {
    const assets = await this.prisma.asset.findMany({
      where: { organizationId },
      include: {
        failureHistories: true,
        criticalities: true,
      },
    });

    return assets.map((asset) => {
      const failures = asset.failureHistories || [];
      const count = failures.length;
      const downtime = failures.reduce((s, f) => s + f.downtimeHours, 0);
      const repairTime = failures.reduce((s, f) => s + f.repairTimeHours, 0);
      const mttr = count > 0 ? Number((repairTime / count).toFixed(2)) : 0;
      const operatingHours = Math.max(1, 720 - downtime);
      const mtbf = count > 0 ? Number((operatingHours / count).toFixed(2)) : 720;
      const avail = Number(((mtbf / (mtbf + (mttr || 1))) * 100).toFixed(2));
      const criticality = asset.criticalities[0]?.criticalityLevel || 'LOW';

      return {
        assetId: asset.id,
        assetCode: asset.assetCode,
        assetName: asset.assetName,
        category: asset.category,
        criticalityLevel: criticality,
        breakdownCount: count,
        downtimeHours: Number(downtime.toFixed(1)),
        mttr,
        mtbf,
        availability: avail,
      };
    });
  }
}
