import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { AMCRepository } from '../repositories/amc.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAMCDto } from '../dto/create-amc.dto';
import { UpdateAMCDto } from '../dto/update-amc.dto';
import { QueryAMCDto } from '../dto/query-amc.dto';
import { RenewAMCDto } from '../dto/renew-amc.dto';
import { MapAMCAssetsDto } from '../dto/map-assets.dto';
import { GenerateAMCPMDto } from '../dto/generate-pm.dto';
import { AMCStatus, ContractType } from '../enums/amc.enums';

@Injectable()
export class AMCService {
  constructor(
    private readonly amcRepository: AMCRepository,
    private readonly prisma: PrismaService,
  ) {}

  async createAMC(dto: CreateAMCDto, organizationId: string, userId: string) {
    const contract = await this.amcRepository.create(organizationId, userId, dto);

    // Create activity log entry
    await this.prisma.activityLog.create({
      data: {
        organizationId,
        action: 'CREATE_AMC',
        entityType: 'AMCContract',
        entityId: contract.id,
        entityName: contract.contractNumber,
        remarks: `AMC Contract ${contract.contractNumber} created for customer ${contract.customer.name}`,
        performedById: userId,
      },
    }).catch(() => null);

    return contract;
  }

  async getAMCs(organizationId: string, query: QueryAMCDto) {
    const result = await this.amcRepository.findAll(organizationId, query);
    const now = new Date();

    const dataWithRemainingDays = result.data.map((contract) => {
      const diffTime = contract.endDate.getTime() - now.getTime();
      const remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return {
        ...contract,
        remainingDays,
      };
    });

    return {
      ...result,
      data: dataWithRemainingDays,
    };
  }

  async getAMCById(id: string, organizationId: string) {
    const contract = await this.amcRepository.findById(id, organizationId);
    const now = new Date();
    const diffTime = contract.endDate.getTime() - now.getTime();
    const remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      ...contract,
      remainingDays,
    };
  }

  async updateAMC(id: string, dto: UpdateAMCDto, organizationId: string, userId: string) {
    const updated = await this.amcRepository.update(id, organizationId, userId, dto);

    await this.prisma.activityLog.create({
      data: {
        organizationId,
        action: 'UPDATE_AMC',
        entityType: 'AMCContract',
        entityId: id,
        entityName: updated.contractNumber,
        remarks: `Updated AMC Contract ${updated.contractNumber}`,
        performedById: userId,
      },
    }).catch(() => null);

    return updated;
  }

  async deleteAMC(id: string, organizationId: string) {
    return this.amcRepository.delete(id, organizationId);
  }

  async mapAssets(id: string, dto: MapAMCAssetsDto, organizationId: string) {
    return this.amcRepository.mapAssets(id, organizationId, dto);
  }

  async renewAMC(id: string, dto: RenewAMCDto, organizationId: string, userId: string) {
    const renewedContract = await this.amcRepository.renew(id, organizationId, userId, dto);

    await this.prisma.activityLog.create({
      data: {
        organizationId,
        action: 'RENEW_AMC',
        entityType: 'AMCContract',
        entityId: id,
        entityName: renewedContract.contractNumber,
        remarks: `Renewed AMC Contract to ${renewedContract.contractNumber}`,
        performedById: userId,
      },
    }).catch(() => null);

    return renewedContract;
  }

  async getExpiringContracts(organizationId: string) {
    return this.amcRepository.findExpiring(organizationId, [30, 15, 7]);
  }

  async getDashboardData(organizationId: string) {
    return this.amcRepository.getDashboardData(organizationId);
  }

  async getStatistics(organizationId: string) {
    const data = await this.amcRepository.getDashboardData(organizationId);
    return data.statistics;
  }

  /**
   * Automatically generate PM (Preventive Maintenance) schedules for all assets covered under an active AMC
   */
  async generatePMAmCSchedules(id: string, dto: GenerateAMCPMDto, organizationId: string, userId: string) {
    const contract = await this.amcRepository.findById(id, organizationId);

    if (contract.status !== AMCStatus.ACTIVE) {
      throw new BadRequestException(`Cannot generate PM schedules for a contract with status ${contract.status}`);
    }

    if (!contract.assets || contract.assets.length === 0) {
      throw new BadRequestException('No covered assets found for this AMC contract');
    }

    const createdPMs = [];
    const now = new Date();

    for (const amcAsset of contract.assets) {
      const pmCount = await this.prisma.preventiveMaintenance.count({
        where: { organizationId },
      });
      const pmNumber = `PM-AMC-${(pmCount + 1).toString().padStart(6, '0')}`;

      // Calculate next due date based on serviceFrequency
      const nextDueDate = new Date();
      if (contract.serviceFrequency === 'MONTHLY') {
        nextDueDate.setMonth(now.getMonth() + 1);
      } else if (contract.serviceFrequency === 'QUARTERLY') {
        nextDueDate.setMonth(now.getMonth() + 3);
      } else if (contract.serviceFrequency === 'HALF_YEARLY') {
        nextDueDate.setMonth(now.getMonth() + 6);
      } else if (contract.serviceFrequency === 'YEARLY') {
        nextDueDate.setFullYear(now.getFullYear() + 1);
      } else {
        nextDueDate.setMonth(now.getMonth() + 1);
      }

      const pm = await this.prisma.preventiveMaintenance.create({
        data: {
          pmNumber,
          title: `AMC PM: ${contract.contractName} - ${amcAsset.asset.assetName}`,
          description: `Automatically generated PM schedule under AMC Contract ${contract.contractNumber}`,
          frequency: contract.serviceFrequency || 'MONTHLY',
          startDate: now,
          nextDueDate,
          status: 'ACTIVE',
          organizationId,
          assetId: amcAsset.assetId,
          assignedTechnicianId: dto.assignedTechnicianId || contract.assignedManagerId,
          checklistTemplateId: dto.checklistTemplateId,
          createdById: userId,
        },
      });

      // Also log visit record
      await this.prisma.aMCVisit.create({
        data: {
          amcContractId: contract.id,
          visitDate: nextDueDate,
          technicianId: dto.assignedTechnicianId || contract.assignedManagerId,
          visitType: 'PREVENTIVE',
          status: 'SCHEDULED',
          remarks: `Scheduled PM for asset ${amcAsset.asset.assetCode}`,
        },
      });

      createdPMs.push(pm);
    }

    return {
      message: `Successfully generated ${createdPMs.length} PM schedules under AMC Contract ${contract.contractNumber}`,
      preventiveMaintenances: createdPMs,
    };
  }

  /**
   * Service Ticket / Work Order Lookup integration: Check if asset is covered under Active AMC
   */
  async checkAssetAMCStatus(assetId: string, organizationId: string) {
    const activeCoverage = await this.prisma.aMCAsset.findFirst({
      where: {
        assetId,
        amcContract: {
          organizationId,
          status: AMCStatus.ACTIVE,
        },
      },
      include: {
        amcContract: {
          include: {
            assignedManager: true,
            customer: true,
          },
        },
      },
    });

    if (!activeCoverage) {
      return {
        isUnderAMC: false,
        contract: null,
      };
    }

    const contract = activeCoverage.amcContract;
    const isSparePartsCovered = contract.contractType === ContractType.COMPREHENSIVE;

    // Get recent service history
    const serviceHistory = await this.prisma.aMCServiceHistory.findMany({
      where: {
        assetId,
        amcContractId: contract.id,
      },
      take: 5,
      orderBy: { visitDate: 'desc' },
      include: {
        technician: true,
      },
    });

    return {
      isUnderAMC: true,
      contract: {
        id: contract.id,
        contractNumber: contract.contractNumber,
        contractName: contract.contractName,
        contractType: contract.contractType,
        isSparePartsCovered,
        slaResponseTime: contract.slaResponseTime,
        slaResolutionTime: contract.slaResolutionTime,
        assignedManager: contract.assignedManager,
      },
      serviceHistory,
    };
  }
}
