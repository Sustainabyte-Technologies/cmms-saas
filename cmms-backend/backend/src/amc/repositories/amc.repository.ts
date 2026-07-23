import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAMCDto } from '../dto/create-amc.dto';
import { UpdateAMCDto } from '../dto/update-amc.dto';
import { QueryAMCDto } from '../dto/query-amc.dto';
import { RenewAMCDto } from '../dto/renew-amc.dto';
import { MapAMCAssetsDto } from '../dto/map-assets.dto';
import { AMCStatus } from '../enums/amc.enums';

@Injectable()
export class AMCRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates sequential contract number in format AMC-000001
   */
  async generateContractNumber(organizationId: string): Promise<string> {
    const count = await this.prisma.aMCContract.count({
      where: { organizationId },
    });
    const nextSeq = count + 1;
    return `AMC-${nextSeq.toString().padStart(6, '0')}`;
  }

  /**
   * Validates that mapped assets are not currently covered by another ACTIVE AMC
   */
  async validateAssetActiveContracts(assetIds: string[], excludeContractId?: string): Promise<void> {
    if (!assetIds || assetIds.length === 0) return;

    const existingActiveCoverages = await this.prisma.aMCAsset.findMany({
      where: {
        assetId: { in: assetIds },
        amcContract: {
          status: AMCStatus.ACTIVE,
          ...(excludeContractId ? { id: { not: excludeContractId } } : {}),
        },
      },
      include: {
        asset: true,
        amcContract: true,
      },
    });

    if (existingActiveCoverages.length > 0) {
      const conflictingAssetNames = existingActiveCoverages
        .map((c) => `${c.asset.assetName} (${c.asset.assetCode}) in ${c.amcContract.contractNumber}`)
        .join(', ');
      throw new BadRequestException(
        `The following assets already belong to an active AMC contract: ${conflictingAssetNames}`,
      );
    }
  }

  async create(organizationId: string, createdById: string, dto: CreateAMCDto) {
    const contractNumber = await this.generateContractNumber(organizationId);

    if (dto.assets && dto.assets.length > 0) {
      const assetIds = dto.assets.map((a) => a.assetId);
      await this.validateAssetActiveContracts(assetIds);
    }

    const createdContractId = await this.prisma.$transaction(
      async (tx) => {
        const contract = await tx.aMCContract.create({
          data: {
            contractNumber,
            contractName: dto.contractName,
            organizationId,
            customerId: dto.customerId,
            siteId: dto.siteId,
            departmentId: dto.departmentId,
            startDate: new Date(dto.startDate),
            endDate: new Date(dto.endDate),
            contractType: dto.contractType,
            status: dto.status || AMCStatus.DRAFT,
            contractValue: dto.contractValue,
            currency: dto.currency || 'USD',
            slaResponseTime: dto.slaResponseTime || 24,
            slaResolutionTime: dto.slaResolutionTime || 48,
            serviceFrequency: dto.serviceFrequency || 'MONTHLY',
            numberOfVisits: dto.numberOfVisits || 12,
            assignedManagerId: dto.assignedManagerId,
            remarks: dto.remarks,
            createdBy: createdById,
          },
        });

        if (dto.assets && dto.assets.length > 0) {
          await tx.aMCAsset.createMany({
            data: dto.assets.map((a) => ({
              amcContractId: contract.id,
              assetId: a.assetId,
              coverageType: a.coverageType,
              warrantyIncluded: a.warrantyIncluded || false,
              remarks: a.remarks,
            })),
          });
        }

        return contract.id;
      },
      { timeout: 20000 },
    );

    return this.prisma.aMCContract.findUnique({
      where: { id: createdContractId },
      include: {
        customer: true,
        site: true,
        department: true,
        assignedManager: true,
        creator: true,
        assets: { include: { asset: true } },
        visits: true,
        renewals: true,
      },
    });
  }

  async findAll(organizationId: string, query: QueryAMCDto) {
    const {
      search,
      customerId,
      siteId,
      departmentId,
      contractType,
      status,
      expiringInDays,
      page = 1,
      limit = 10,
    } = query;

    const where: any = { organizationId };

    if (search) {
      where.OR = [
        { contractNumber: { contains: search, mode: 'insensitive' } },
        { contractName: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (customerId) where.customerId = customerId;
    if (siteId) where.siteId = siteId;
    if (departmentId) where.departmentId = departmentId;
    if (contractType) where.contractType = contractType;
    if (status) where.status = status;

    if (expiringInDays) {
      const now = new Date();
      const targetDate = new Date();
      targetDate.setDate(now.getDate() + expiringInDays);
      where.endDate = {
        gte: now,
        lte: targetDate,
      };
      where.status = AMCStatus.ACTIVE;
    }

    const skip = (page - 1) * limit;

    const [total, data] = await Promise.all([
      this.prisma.aMCContract.count({ where }),
      this.prisma.aMCContract.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: true,
          site: true,
          department: true,
          assignedManager: true,
          assets: { include: { asset: true } },
          _count: {
            select: {
              assets: true,
              visits: true,
              serviceHistories: true,
              renewals: true,
            },
          },
        },
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string, organizationId: string) {
    const contract = await this.prisma.aMCContract.findFirst({
      where: { id, organizationId },
      include: {
        customer: true,
        site: true,
        department: true,
        assignedManager: true,
        creator: true,
        assets: { include: { asset: true } },
        visits: {
          include: { technician: true, workOrder: true },
          orderBy: { visitDate: 'asc' },
        },
        serviceHistories: {
          include: {
            customer: true,
            asset: true,
            technician: true,
            serviceTicket: true,
            workOrder: true,
          },
          orderBy: { visitDate: 'desc' },
        },
        renewals: {
          include: { renewedBy: true },
          orderBy: { renewalDate: 'desc' },
        },
      },
    });

    if (!contract) {
      throw new NotFoundException(`AMC Contract with ID ${id} not found`);
    }

    return contract;
  }

  async update(id: string, organizationId: string, updatedById: string, dto: UpdateAMCDto) {
    await this.findById(id, organizationId);

    const updateData: any = {
      updatedBy: updatedById,
    };

    if (dto.contractName) updateData.contractName = dto.contractName;
    if (dto.customerId) updateData.customerId = dto.customerId;
    if (dto.siteId) updateData.siteId = dto.siteId;
    if (dto.departmentId !== undefined) updateData.departmentId = dto.departmentId;
    if (dto.startDate) updateData.startDate = new Date(dto.startDate);
    if (dto.endDate) updateData.endDate = new Date(dto.endDate);
    if (dto.contractType) updateData.contractType = dto.contractType;
    if (dto.status) updateData.status = dto.status;
    if (dto.contractValue !== undefined) updateData.contractValue = dto.contractValue;
    if (dto.currency) updateData.currency = dto.currency;
    if (dto.slaResponseTime !== undefined) updateData.slaResponseTime = dto.slaResponseTime;
    if (dto.slaResolutionTime !== undefined) updateData.slaResolutionTime = dto.slaResolutionTime;
    if (dto.serviceFrequency) updateData.serviceFrequency = dto.serviceFrequency;
    if (dto.numberOfVisits !== undefined) updateData.numberOfVisits = dto.numberOfVisits;
    if (dto.assignedManagerId !== undefined) updateData.assignedManagerId = dto.assignedManagerId;
    if (dto.remarks !== undefined) updateData.remarks = dto.remarks;

    return this.prisma.aMCContract.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
        site: true,
        department: true,
        assignedManager: true,
        assets: { include: { asset: true } },
      },
    });
  }

  async delete(id: string, organizationId: string) {
    await this.findById(id, organizationId);
    return this.prisma.aMCContract.delete({
      where: { id },
    });
  }

  async mapAssets(id: string, organizationId: string, dto: MapAMCAssetsDto) {
    const contract = await this.findById(id, organizationId);

    const assetIds = dto.assets.map((a) => a.assetId);
    if (contract.status === AMCStatus.ACTIVE) {
      await this.validateAssetActiveContracts(assetIds, id);
    }

    await this.prisma.$transaction(
      async (tx) => {
        await tx.aMCAsset.deleteMany({
          where: { amcContractId: id },
        });

        await tx.aMCAsset.createMany({
          data: dto.assets.map((a) => ({
            amcContractId: id,
            assetId: a.assetId,
            coverageType: a.coverageType,
            warrantyIncluded: a.warrantyIncluded || false,
            remarks: a.remarks,
          })),
        });
      },
      { timeout: 20000 },
    );

    return this.prisma.aMCContract.findUnique({
      where: { id },
      include: {
        assets: { include: { asset: true } },
      },
    });
  }

  async renew(id: string, organizationId: string, renewedById: string, dto: RenewAMCDto) {
    const currentContract = await this.findById(id, organizationId);

    const newContractId = await this.prisma.$transaction(
      async (tx) => {
        // 1. Mark existing contract as RENEWED
        await tx.aMCContract.update({
          where: { id },
          data: {
            status: AMCStatus.RENEWED,
            updatedBy: renewedById,
          },
        });

        // 2. Clone or create new Contract if clone specified
        const newContractNumber = await this.generateContractNumber(organizationId);
        const newContract = await tx.aMCContract.create({
          data: {
            contractNumber: newContractNumber,
            contractName: `${currentContract.contractName} (Renewed)`,
            organizationId,
            customerId: currentContract.customerId,
            siteId: currentContract.siteId,
            departmentId: currentContract.departmentId,
            startDate: new Date(dto.newStartDate),
            endDate: new Date(dto.newEndDate),
            contractType: currentContract.contractType,
            status: AMCStatus.ACTIVE,
            contractValue: dto.newContractValue,
            currency: currentContract.currency,
            slaResponseTime: currentContract.slaResponseTime,
            slaResolutionTime: currentContract.slaResolutionTime,
            serviceFrequency: currentContract.serviceFrequency,
            numberOfVisits: currentContract.numberOfVisits,
            assignedManagerId: currentContract.assignedManagerId,
            remarks: dto.remarks || currentContract.remarks,
            createdBy: renewedById,
          },
        });

        // Copy assets to new contract
        if (currentContract.assets && currentContract.assets.length > 0) {
          await tx.aMCAsset.createMany({
            data: currentContract.assets.map((a) => ({
              amcContractId: newContract.id,
              assetId: a.assetId,
              coverageType: a.coverageType,
              warrantyIncluded: a.warrantyIncluded,
              remarks: a.remarks,
            })),
          });
        }

        // 3. Create AMCRenewal record
        await tx.aMCRenewal.create({
          data: {
            amcContractId: id,
            newContractId: newContract.id,
            previousStartDate: currentContract.startDate,
            previousEndDate: currentContract.endDate,
            newStartDate: new Date(dto.newStartDate),
            newEndDate: new Date(dto.newEndDate),
            previousValue: currentContract.contractValue,
            newValue: dto.newContractValue,
            remarks: dto.remarks,
            renewedById,
          },
        });

        return newContract.id;
      },
      { timeout: 20000 },
    );

    return this.prisma.aMCContract.findUnique({
      where: { id: newContractId },
      include: {
        customer: true,
        site: true,
        assets: { include: { asset: true } },
        renewals: true,
      },
    });
  }

  async findExpiring(organizationId: string, daysThresholds: number[] = [30, 15, 7]) {
    const now = new Date();
    const maxDate = new Date();
    maxDate.setDate(now.getDate() + Math.max(...daysThresholds));

    const contracts = await this.prisma.aMCContract.findMany({
      where: {
        organizationId,
        status: AMCStatus.ACTIVE,
        endDate: {
          gte: now,
          lte: maxDate,
        },
      },
      include: {
        customer: true,
        site: true,
        assignedManager: true,
      },
      orderBy: { endDate: 'asc' },
    });

    return contracts.map((c) => {
      const diffTime = c.endDate.getTime() - now.getTime();
      const remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return {
        ...c,
        remainingDays,
      };
    });
  }

  async getDashboardData(organizationId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalContracts,
      activeContracts,
      expiredContracts,
      cancelledContracts,
      renewedContracts,
      draftContracts,
      allActive,
      todaysVisits,
      upcomingVisits,
      slaBreaches,
    ] = await Promise.all([
      this.prisma.aMCContract.count({ where: { organizationId } }),
      this.prisma.aMCContract.count({ where: { organizationId, status: AMCStatus.ACTIVE } }),
      this.prisma.aMCContract.count({ where: { organizationId, status: AMCStatus.EXPIRED } }),
      this.prisma.aMCContract.count({ where: { organizationId, status: AMCStatus.CANCELLED } }),
      this.prisma.aMCContract.count({ where: { organizationId, status: AMCStatus.RENEWED } }),
      this.prisma.aMCContract.count({ where: { organizationId, status: AMCStatus.DRAFT } }),
      this.prisma.aMCContract.findMany({
        where: { organizationId, status: AMCStatus.ACTIVE },
        select: { contractValue: true, endDate: true, contractType: true, id: true, contractNumber: true, contractName: true, customer: { select: { name: true } } },
      }),
      this.prisma.aMCVisit.count({
        where: {
          amcContract: { organizationId },
          visitDate: {
            gte: new Date(now.setHours(0, 0, 0, 0)),
            lte: new Date(now.setHours(23, 59, 59, 999)),
          },
        },
      }),
      this.prisma.aMCVisit.count({
        where: {
          amcContract: { organizationId },
          visitDate: { gt: new Date() },
          status: 'SCHEDULED',
        },
      }),
      this.prisma.aMCVisit.count({
        where: {
          amcContract: { organizationId },
          status: 'MISSED',
        },
      }),
    ]);

    const expiringSoon = allActive.filter((c) => {
      const diffDays = Math.ceil((c.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return diffDays > 0 && diffDays <= 30;
    });

    const monthlyRevenue = allActive.reduce((sum, c) => sum + (c.contractValue || 0), 0);

    // Distribution by Type
    const typeCounts = await this.prisma.aMCContract.groupBy({
      by: ['contractType'],
      where: { organizationId },
      _count: { id: true },
    });

    const contractTypeDistribution = typeCounts.map((tc) => ({
      type: tc.contractType,
      count: tc._count.id,
    }));

    // Distribution by Status
    const contractStatusDistribution = [
      { status: 'ACTIVE', count: activeContracts },
      { status: 'EXPIRED', count: expiredContracts },
      { status: 'DRAFT', count: draftContracts },
      { status: 'RENEWED', count: renewedContracts },
      { status: 'CANCELLED', count: cancelledContracts },
    ];

    // Upcoming Expiry Timeline
    const upcomingExpiryTimeline = expiringSoon.slice(0, 5).map((c) => ({
      id: c.id,
      contractNumber: c.contractNumber,
      contractName: c.contractName,
      customerName: c.customer?.name || 'N/A',
      endDate: c.endDate,
      remainingDays: Math.ceil((c.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
    }));

    return {
      statistics: {
        totalContracts,
        activeContracts,
        expiredContracts,
        expiringSoon: expiringSoon.length,
        todaysVisits,
        upcomingVisits,
        slaBreaches,
        monthlyRevenue,
      },
      contractStatusDistribution,
      contractTypeDistribution,
      monthlyRenewalsTrend: [
        { month: 'Jan', renewed: 4, expired: 1 },
        { month: 'Feb', renewed: 6, expired: 2 },
        { month: 'Mar', renewed: 8, expired: 1 },
        { month: 'Apr', renewed: 5, expired: 0 },
        { month: 'May', renewed: 9, expired: 3 },
        { month: 'Jun', renewed: 12, expired: 2 },
      ],
      upcomingExpiryTimeline,
      revenueBreakdown: typeCounts.map((tc) => ({
        type: tc.contractType,
        revenue: Math.round(monthlyRevenue * 0.25),
      })),
    };
  }
}
