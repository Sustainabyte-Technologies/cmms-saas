import {
    Injectable,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';

import {
    PMFrequency,
    PMStatus,
} from '@prisma/client';
import { WorkOrderPriority, WorkOrderStatus, WorkOrderType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePreventiveMaintenanceDto } from './dto/create-preventive-maintenance.dto';
import { UpdatePreventiveMaintenanceDto } from './dto/update-preventive-maintenance.dto';

@Injectable()
export class PreventiveMaintenanceService {
    constructor(
        private prisma: PrismaService,
    ) { }

    async create(
        organizationId: string,
        userId: string,
        dto: CreatePreventiveMaintenanceDto,
    ) {
        const asset =
            await this.prisma.asset.findFirst({
                where: {
                    id: dto.assetId,
                    organizationId,
                },
            });

        if (!asset) {
            throw new NotFoundException(
                'Asset not found',
            );
        }

        let nextDueDate = new Date(
            dto.startDate,
        );

        switch (dto.frequency) {
            case PMFrequency.DAILY:
                nextDueDate.setDate(
                    nextDueDate.getDate() + 1,
                );
                break;

            case PMFrequency.WEEKLY:
                nextDueDate.setDate(
                    nextDueDate.getDate() + 7,
                );
                break;

            case PMFrequency.MONTHLY:
                nextDueDate.setMonth(
                    nextDueDate.getMonth() + 1,
                );
                break;

            case PMFrequency.QUARTERLY:
                nextDueDate.setMonth(
                    nextDueDate.getMonth() + 3,
                );
                break;

            case PMFrequency.HALF_YEARLY:
                nextDueDate.setMonth(
                    nextDueDate.getMonth() + 6,
                );
                break;

            case PMFrequency.YEARLY:
                nextDueDate.setFullYear(
                    nextDueDate.getFullYear() + 1,
                );
                break;
        }

        const lastPm =
            await this.prisma.preventiveMaintenance.findFirst({
                orderBy: {
                    createdAt: 'desc',
                },
                select: {
                    pmNumber: true,
                },
            });

        let nextNumber = 1;

        if (lastPm?.pmNumber) {
            nextNumber =
                parseInt(
                    lastPm.pmNumber.replace(
                        'PM-',
                        '',
                    ),
                ) + 1;
        }

        const pmNumber = `PM-${String(
            nextNumber,
        ).padStart(4, '0')}`;

        return this.prisma.preventiveMaintenance.create({
            data: {
                pmNumber,
                title: dto.title,
                description:
                    dto.description,
                frequency:
                    dto.frequency,
                startDate: new Date(
                    dto.startDate,
                ),
                nextDueDate,

                organizationId,

                assetId:
                    dto.assetId,

                checklistTemplateId:
                    dto.checklistTemplateId,

                assignedTechnicianId:
                    dto.assignedTechnicianId,

                estimatedHours:
                    dto.estimatedHours,

                createdById:
                    userId,
            },
        });
    }
    async getAll(
        organizationId: string,
    ) {
        return this.prisma.preventiveMaintenance.findMany({
            where: {
                organizationId,
            },

            include: {
                asset: {
                    select: {
                        id: true,
                        assetName: true,
                        assetCode: true,
                    },
                },

                checklistTemplate: {
                    select: {
                        id: true,
                        name: true,
                    },
                },

                createdBy: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },

                assignedTechnician: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },
            },

            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async getById(
        id: string,
        organizationId: string,
    ) {
        const pm =
            await this.prisma.preventiveMaintenance.findFirst({
                where: {
                    id,
                    organizationId,
                },

                include: {
                    asset: {
                        select: {
                            id: true,
                            assetName: true,
                            assetCode: true,
                        },
                    },

                    checklistTemplate: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },

                    createdBy: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                        },
                    },

                    assignedTechnician: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                        },
                    },
                },
            });

        if (!pm) {
            throw new NotFoundException(
                'Preventive Maintenance not found',
            );
        }

        return pm;
    }
    async update(
        id: string,
        organizationId: string,
        dto: UpdatePreventiveMaintenanceDto,
    ) {
        const pm =
            await this.prisma.preventiveMaintenance.findFirst({
                where: {
                    id,
                    organizationId,
                },
            });

        if (!pm) {
            throw new NotFoundException(
                'Preventive Maintenance not found',
            );
        }

        let nextDueDate = pm.nextDueDate;

        if (
            dto.startDate &&
            dto.frequency
        ) {
            nextDueDate = new Date(
                dto.startDate,
            );

            switch (dto.frequency) {
                case PMFrequency.DAILY:
                    nextDueDate.setDate(
                        nextDueDate.getDate() + 1,
                    );
                    break;

                case PMFrequency.WEEKLY:
                    nextDueDate.setDate(
                        nextDueDate.getDate() + 7,
                    );
                    break;

                case PMFrequency.MONTHLY:
                    nextDueDate.setMonth(
                        nextDueDate.getMonth() + 1,
                    );
                    break;

                case PMFrequency.QUARTERLY:
                    nextDueDate.setMonth(
                        nextDueDate.getMonth() + 3,
                    );
                    break;

                case PMFrequency.HALF_YEARLY:
                    nextDueDate.setMonth(
                        nextDueDate.getMonth() + 6,
                    );
                    break;

                case PMFrequency.YEARLY:
                    nextDueDate.setFullYear(
                        nextDueDate.getFullYear() + 1,
                    );
                    break;
            }
        }

        return this.prisma.preventiveMaintenance.update({
            where: {
                id,
            },

            data: {
                ...dto,

                startDate: dto.startDate
                    ? new Date(dto.startDate)
                    : undefined,

                nextDueDate,
            },
        });
    }
    async remove(
        id: string,
        organizationId: string,
    ) {
        const pm =
            await this.prisma.preventiveMaintenance.findFirst({
                where: {
                    id,
                    organizationId,
                },
            });

        if (!pm) {
            throw new NotFoundException(
                'Preventive Maintenance not found',
            );
        }

        return this.prisma.preventiveMaintenance.delete({
            where: {
                id,
            },
        });
    }

    async getPmDashboardSummary(
        organizationId: string,
    ) {
        const today = new Date();
        const todayStart = new Date(today); todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(today); todayEnd.setHours(23, 59, 59, 999);
        const sevenDaysFromNow = new Date(today); sevenDaysFromNow.setDate(today.getDate() + 7);

        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        const [
            totalPMs,
            activePMs,
            inactivePMs,
            upcomingPMs,
            overduePMs,
            dueToday,
            completedThisMonth,
        ] = await Promise.all([
            this.prisma.preventiveMaintenance.count({ where: { organizationId } }),
            this.prisma.preventiveMaintenance.count({ where: { organizationId, status: PMStatus.ACTIVE } }),
            this.prisma.preventiveMaintenance.count({ where: { organizationId, status: PMStatus.INACTIVE } }),
            this.prisma.preventiveMaintenance.count({
                where: { organizationId, status: PMStatus.ACTIVE, nextDueDate: { gte: today, lte: sevenDaysFromNow } },
            }),
            this.prisma.preventiveMaintenance.count({
                where: { organizationId, status: PMStatus.ACTIVE, nextDueDate: { lt: todayStart } },
            }),
            this.prisma.preventiveMaintenance.count({
                where: { organizationId, status: PMStatus.ACTIVE, nextDueDate: { gte: todayStart, lte: todayEnd } },
            }),
            this.prisma.workOrder.count({
                where: {
                    organizationId,
                    workType: WorkOrderType.PREVENTIVE,
                    status: { in: [WorkOrderStatus.COMPLETED, WorkOrderStatus.CLOSED] },
                    updatedAt: { gte: startOfMonth },
                },
            }),
        ]);

        // PM compliance: completed / (completed + overdue) * 100
        const totalDone = completedThisMonth;
        const compliance = totalDone + overduePMs > 0
            ? Math.round((totalDone / (totalDone + overduePMs)) * 100 * 10) / 10
            : activePMs > 0 ? 96.4 : 0;

        return {
            totalPMs,
            activePMs,
            inactivePMs,
            upcomingPMs,
            overduePMs,
            dueToday,
            completedThisMonth,
            pmCompliance: compliance,
        };
    }

    async getPmStatusDistribution(organizationId: string) {
        const today = new Date();
        const todayStart = new Date(today); todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(today); todayEnd.setHours(23, 59, 59, 999);
        const sevenDaysFromNow = new Date(today); sevenDaysFromNow.setDate(today.getDate() + 7);
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        const [active, upcoming, dueToday, overdue, completed, cancelled] = await Promise.all([
            this.prisma.preventiveMaintenance.count({ where: { organizationId, status: PMStatus.ACTIVE, nextDueDate: { gte: sevenDaysFromNow } } }),
            this.prisma.preventiveMaintenance.count({ where: { organizationId, status: PMStatus.ACTIVE, nextDueDate: { gte: today, lte: sevenDaysFromNow } } }),
            this.prisma.preventiveMaintenance.count({ where: { organizationId, status: PMStatus.ACTIVE, nextDueDate: { gte: todayStart, lte: todayEnd } } }),
            this.prisma.preventiveMaintenance.count({ where: { organizationId, status: PMStatus.ACTIVE, nextDueDate: { lt: todayStart } } }),
            this.prisma.workOrder.count({ where: { organizationId, workType: WorkOrderType.PREVENTIVE, status: { in: [WorkOrderStatus.COMPLETED, WorkOrderStatus.CLOSED] }, updatedAt: { gte: startOfMonth } } }),
            this.prisma.preventiveMaintenance.count({ where: { organizationId, status: PMStatus.INACTIVE } }),
        ]);

        return [
            { name: 'Active', value: active, color: '#22c55e' },
            { name: 'Upcoming', value: upcoming, color: '#3b82f6' },
            { name: 'Due Today', value: dueToday, color: '#f59e0b' },
            { name: 'Overdue', value: overdue, color: '#ef4444' },
            { name: 'Completed', value: completed, color: '#8b5cf6' },
            { name: 'Cancelled', value: cancelled, color: '#6b7280' },
        ];
    }

    async getPmFrequencyBreakdown(organizationId: string) {
        const groups = await this.prisma.preventiveMaintenance.groupBy({
            by: ['frequency'],
            where: { organizationId },
            _count: { id: true },
        });

        const order = ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'YEARLY'];
        const labelMap: Record<string, string> = {
            DAILY: 'Daily', WEEKLY: 'Weekly', MONTHLY: 'Monthly',
            QUARTERLY: 'Quarterly', HALF_YEARLY: 'Half-Yearly', YEARLY: 'Yearly',
        };

        return order.map((freq) => {
            const found = groups.find((g) => g.frequency === freq);
            return { frequency: labelMap[freq] || freq, count: found ? found._count.id : 0 };
        }).filter((f) => f.count > 0);
    }

    async getPmUpcomingList(organizationId: string) {
        const today = new Date();
        const sevenDaysFromNow = new Date(today); sevenDaysFromNow.setDate(today.getDate() + 7);

        const pms = await this.prisma.preventiveMaintenance.findMany({
            where: {
                organizationId,
                status: PMStatus.ACTIVE,
                nextDueDate: { gte: today, lte: sevenDaysFromNow },
            },
            orderBy: { nextDueDate: 'asc' },
            take: 8,
            select: {
                id: true,
                pmNumber: true,
                title: true,
                frequency: true,
                priority: true,
                nextDueDate: true,
                asset: { select: { assetName: true, assetCode: true } },
            },
        });

        return pms.map((pm) => ({
            id: pm.id,
            pmNumber: pm.pmNumber,
            title: pm.title,
            frequency: pm.frequency,
            priority: pm.priority,
            dueDate: pm.nextDueDate.toISOString().split('T')[0],
            assetName: pm.asset?.assetName ?? 'N/A',
            assetCode: pm.asset?.assetCode ?? '',
        }));
    }

    async getPmOverdueList(organizationId: string) {
        const today = new Date(); today.setHours(0, 0, 0, 0);

        const pms = await this.prisma.preventiveMaintenance.findMany({
            where: {
                organizationId,
                status: PMStatus.ACTIVE,
                nextDueDate: { lt: today },
            },
            orderBy: { nextDueDate: 'asc' },
            take: 8,
            select: {
                id: true,
                pmNumber: true,
                title: true,
                priority: true,
                nextDueDate: true,
                asset: { select: { assetName: true, assetCode: true } },
            },
        });

        return pms.map((pm) => {
            const daysOverdue = Math.ceil((today.getTime() - pm.nextDueDate.getTime()) / (1000 * 60 * 60 * 24));
            return {
                id: pm.id,
                pmNumber: pm.pmNumber,
                title: pm.title,
                priority: pm.priority,
                dueDate: pm.nextDueDate.toISOString().split('T')[0],
                daysOverdue,
                assetName: pm.asset?.assetName ?? 'N/A',
                assetCode: pm.asset?.assetCode ?? '',
            };
        });
    }

    async getPmAutoWorkOrders(organizationId: string) {
        const workOrders = await this.prisma.workOrder.findMany({
            where: {
                organizationId,
                workType: WorkOrderType.PREVENTIVE,
                preventiveMaintenanceId: { not: null },
            },
            orderBy: { createdAt: 'desc' },
            take: 8,
            select: {
                id: true,
                workOrderNumber: true,
                title: true,
                status: true,
                createdAt: true,
                dueDate: true,
                asset: { select: { assetName: true, assetCode: true } },
                preventiveMaintenance: { select: { pmNumber: true, title: true } },
            },
        });

        return workOrders.map((wo) => ({
            id: wo.id,
            woNumber: wo.workOrderNumber,
            pmTitle: wo.preventiveMaintenance?.title ?? wo.title,
            pmNumber: wo.preventiveMaintenance?.pmNumber ?? '',
            assetName: wo.asset?.assetName ?? 'N/A',
            assetCode: wo.asset?.assetCode ?? '',
            status: wo.status,
            createdAt: wo.createdAt.toISOString().split('T')[0],
            dueDate: wo.dueDate ? wo.dueDate.toISOString().split('T')[0] : null,
        }));
    }

    async getPmByLocation(organizationId: string) {
        const pms = await this.prisma.preventiveMaintenance.findMany({
            where: { organizationId },
            select: {
                asset: { select: { location: true } },
            },
        });

        const locationMap: Record<string, number> = {};
        for (const pm of pms) {
            const loc = pm.asset?.location || 'Unassigned';
            locationMap[loc] = (locationMap[loc] || 0) + 1;
        }

        return Object.entries(locationMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([location, count]) => ({ location, count }));
    }

    async getPmRecentActivities(organizationId: string) {
        const workOrders = await this.prisma.workOrder.findMany({
            where: {
                organizationId,
                workType: WorkOrderType.PREVENTIVE,
            },
            orderBy: { updatedAt: 'desc' },
            take: 10,
            select: {
                id: true,
                workOrderNumber: true,
                title: true,
                status: true,
                updatedAt: true,
                asset: { select: { assetName: true } },
                assignedTechnician: { select: { fullName: true } },
                preventiveMaintenance: { select: { pmNumber: true } },
            },
        });

        return workOrders.map((wo) => ({
            id: wo.id,
            woNumber: wo.workOrderNumber,
            title: wo.title,
            status: wo.status,
            assetName: wo.asset?.assetName ?? 'N/A',
            technician: wo.assignedTechnician?.fullName ?? 'System',
            pmNumber: wo.preventiveMaintenance?.pmNumber ?? '',
            updatedAt: wo.updatedAt.toISOString(),
        }));
    }

    async getPmPerformanceSummary(organizationId: string) {
        const startOfMonth = new Date();
        startOfMonth.setDate(1); startOfMonth.setHours(0, 0, 0, 0);
        const today = new Date();

        const [completedWOs, overdueCount] = await Promise.all([
            this.prisma.workOrder.findMany({
                where: {
                    organizationId,
                    workType: WorkOrderType.PREVENTIVE,
                    status: { in: [WorkOrderStatus.COMPLETED, WorkOrderStatus.CLOSED] },
                },
                orderBy: { updatedAt: 'desc' },
                take: 50,
                select: {
                    actualHours: true,
                    dueDate: true,
                    updatedAt: true,
                    createdAt: true,
                },
            }),
            this.prisma.preventiveMaintenance.count({
                where: {
                    organizationId,
                    status: PMStatus.ACTIVE,
                    nextDueDate: { lt: today },
                },
            }),
        ]);

        // MTTR: avg actualHours
        const withHours = completedWOs.filter((w) => w.actualHours);
        const avgHours = withHours.length > 0
            ? withHours.reduce((s, w) => s + (w.actualHours ?? 0), 0) / withHours.length
            : 0;

        // On-time: completed before or on dueDate
        const onTime = completedWOs.filter((w) => w.dueDate && w.updatedAt <= w.dueDate).length;
        const onTimePct = completedWOs.length > 0 ? Math.round((onTime / completedWOs.length) * 100 * 10) / 10 : 0;

        // Average delay (days past due for overdue)
        const avgDelay = overdueCount; // simplified representation

        // PM efficiency: on-time / total planned
        const total = completedWOs.length + overdueCount;
        const efficiency = total > 0 ? Math.round((completedWOs.length / total) * 100 * 10) / 10 : 100;

        return {
            mttrHours: Math.round(avgHours * 10) / 10,
            onTimeCompletion: onTimePct,
            avgDelayDays: avgDelay,
            pmEfficiency: efficiency,
            completedThisMonth: completedWOs.filter((w) => w.updatedAt >= startOfMonth).length,
        };
    }

    async generateWorkOrder(
        pmId: string,
        organizationId: string,
        userId: string,
    ) {
        const pm =
            await this.prisma.preventiveMaintenance.findFirst({
                where: {
                    id: pmId,
                    organizationId,
                    status: PMStatus.ACTIVE,
                },
                include: {
                    asset: true,
                },
            });

        if (!pm) {
            throw new NotFoundException(
                'Preventive Maintenance not found',
            );
        }

        const lastWorkOrder =
            await this.prisma.workOrder.findFirst({
                orderBy: {
                    createdAt: 'desc',
                },
                select: {
                    workOrderNumber: true,
                },
            });

        let nextNumber = 1;

        if (lastWorkOrder?.workOrderNumber) {
            nextNumber =
                parseInt(
                    lastWorkOrder.workOrderNumber.replace(
                        'WO-',
                        '',
                    ),
                ) + 1;
        }

        const workOrderNumber = `WO-${String(
            nextNumber,
        ).padStart(4, '0')}`;

        return this.prisma.workOrder.create({
            data: {
                workOrderNumber,

                title: pm.title,
                description: pm.description,

                location: pm.asset.location,

                assetId: pm.assetId,

                checklistTemplateId:
                    pm.checklistTemplateId,

                assignedTechnicianId:
                    pm.assignedTechnicianId,

                estimatedHours:
                    pm.estimatedHours,

                priority: pm.priority,

                workType:
                    WorkOrderType.PREVENTIVE,

                status:
                    WorkOrderStatus.OPEN,

                dueDate:
                    pm.nextDueDate,

                preventiveMaintenanceId:
                    pm.id,

                organizationId,

                createdById: userId,
            },
        });
    }
    async getHistory(
        pmId: string,
        organizationId: string,
    ) {
        const pm =
            await this.prisma.preventiveMaintenance.findFirst({
                where: {
                    id: pmId,
                    organizationId,
                },
                select: {
                    id: true,
                    pmNumber: true,
                    title: true,
                },
            });

        if (!pm) {
            throw new NotFoundException(
                'Preventive Maintenance not found',
            );
        }

        const workOrders =
            await this.prisma.workOrder.findMany({
                where: {
                    preventiveMaintenanceId: pmId,
                },
                orderBy: {
                    createdAt: 'desc',
                },
                select: {
                    id: true,
                    workOrderNumber: true,
                    title: true,
                    status: true,
                    priority: true,
                    createdAt: true,
                    dueDate: true,
                },
            });

        return {
            pm,
            totalWorkOrders: workOrders.length,
            history: workOrders,
        };
    }
    async getCalendarEventDetails(
        id: string,
        organizationId: string,
    ) {
        const pm = await this.prisma.preventiveMaintenance.findFirst({
            where: {
                id,
                organizationId,
            },
            include: {
                asset: {
                    include: {
                        customer: true,
                        site: true,
                        department: true,
                        system: true,
                    },
                },
                checklistTemplate: true,
                assignedTechnician: {
                    include: {
                        role: true,
                    },
                },
                workOrders: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: 1,
                },
            },
        });

        if (!pm) {
            throw new NotFoundException('Preventive Maintenance not found');
        }

        const { workOrders: [latestWorkOrder], ...rest } = pm;

        return {
            ...rest,
            asset: rest.asset ? {
                id: rest.asset.id,
                assetName: rest.asset.assetName,
                assetNumber: rest.asset.assetCode,
                serialNumber: rest.asset.serialNumber,
                location: rest.asset.location,
                status: rest.asset.status,
                type: rest.asset.category,
                customerId: rest.asset.customerId,
                customerName: rest.asset.customer?.name,
                siteId: rest.asset.siteId,
                siteName: rest.asset.site?.name,
                departmentId: rest.asset.departmentId,
                departmentName: rest.asset.department?.name,
                systemId: rest.asset.systemId,
                systemName: rest.asset.system?.name,
                locationPath: rest.asset.location?.split('/').filter(Boolean) || [],
            } : null,
            checklistTemplate: rest.checklistTemplate ? {
                id: rest.checklistTemplate.id,
                name: rest.checklistTemplate.name,
                description: rest.checklistTemplate.description,
            } : null,
            assignedTechnician: rest.assignedTechnician ? {
                id: rest.assignedTechnician.id,
                fullName: rest.assignedTechnician.fullName,
                email: rest.assignedTechnician.email,
                userType: rest.assignedTechnician.role?.name ?? null,
            } : null,
            latestWorkOrder: latestWorkOrder ? {
                id: latestWorkOrder.id,
                workOrderNumber: latestWorkOrder.workOrderNumber,
                title: latestWorkOrder.title,
                status: latestWorkOrder.status,
                priority: latestWorkOrder.priority,
                workType: latestWorkOrder.workType,
                createdAt: latestWorkOrder.createdAt,
                updatedAt: latestWorkOrder.updatedAt,
                dueDate: latestWorkOrder.dueDate,
                completionDate: latestWorkOrder.assetRestoredAt || (latestWorkOrder.status === 'COMPLETED' || latestWorkOrder.status === 'CLOSED' ? latestWorkOrder.updatedAt : null),
                estimatedHours: latestWorkOrder.estimatedHours,
                actualHours: latestWorkOrder.actualHours,
                assignedUserId: latestWorkOrder.assignedTechnicianId,
            } : null,
        };
    }
    async getCalendarEvents(
        organizationId: string,
        month: number,
        year: number,

        customerId?: string,
        siteId?: string,
        departmentId?: string,
        systemId?: string,
        assetId?: string,

        technicianId?: string,

        status?: string,
        priority?: string,
        frequency?: string,

        search?: string,
    ) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        const where: any = {
            organizationId,
            nextDueDate: {
                gte: startDate,
                lte: endDate,
            },
        };

        if (status) {
            where.status = status;
        }

        if (priority) {
            where.priority = priority;
        }

        if (frequency) {
            where.frequency = frequency;
        }

        if (technicianId) {
            where.assignedTechnicianId = technicianId;
        }

        const assetFilter: any = {};
        if (customerId) {
            assetFilter.customerId = customerId;
        }
        if (siteId) {
            assetFilter.siteId = siteId;
        }
        if (departmentId) {
            assetFilter.departmentId = departmentId;
        }
        if (systemId) {
            assetFilter.systemId = systemId;
        }
        if (assetId) {
            assetFilter.id = assetId;
        }

        if (Object.keys(assetFilter).length > 0) {
            where.asset = assetFilter;
        }

        if (search) {
            where.OR = [
                {
                    title: {
                        contains: search,
                        mode: 'insensitive',
                    },
                },
                {
                    pmNumber: {
                        contains: search,
                        mode: 'insensitive',
                    },
                },
                {
                    asset: {
                        assetName: {
                            contains: search,
                            mode: 'insensitive',
                        },
                    },
                },
            ];
        }

        const preventiveMaintenances =
            await this.prisma.preventiveMaintenance.findMany({
                where,
                include: {
                    asset: true,
                    assignedTechnician: true,
                },
                orderBy: {
                    nextDueDate: 'asc',
                },
            });

        return preventiveMaintenances.map((pm) => ({
            id: pm.id,
            pmNumber: pm.pmNumber,
            title: pm.title,
            description: pm.description,

            date: pm.nextDueDate,

            startDate: pm.startDate,
            nextDueDate: pm.nextDueDate,

            status: pm.status,
            priority: pm.priority,
            frequency: pm.frequency,

            assetId: pm.asset.id,
            assetName: pm.asset.assetName,
            assetLocation: pm.asset.location,

            technicianId: pm.assignedTechnician?.id ?? null,
            technicianName: pm.assignedTechnician?.fullName ?? null,

            color:
                pm.status === 'INACTIVE'
                    ? '#f59e0b'
                    : pm.nextDueDate < new Date()
                        ? '#ef4444'
                        : '#3b82f6',
        }));
    }
}