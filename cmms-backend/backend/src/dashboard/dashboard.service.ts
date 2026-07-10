import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

    async getOverview(
        organizationId: string,
        role: string,
        userId: string,
    ) {
        let totalUsers = 0;
        let totalAssets = 0;
        let totalWorkOrders = 0;
        let openWorkOrders = 0;

        if (role === 'SITE_INCHARGE') {
            const site = await this.prisma.site.findFirst({
                where: {
                    assignedSupervisorId: userId,
                    organizationId,
                    status: true,
                },
                select: { id: true },
            });
            if (site) {
                // Find all supervisors of departments in this site
                const deptSupervisors = await this.prisma.department.findMany({
                    where: { siteId: site.id, status: true },
                    select: { assignedSupervisorId: true }
                });
                const supervisorIds = deptSupervisors
                    .map(d => d.assignedSupervisorId)
                    .filter((id): id is string => !!id);

                // Find all technicians assigned to work orders under this site
                const workOrders = await this.prisma.workOrder.findMany({
                    where: {
                        asset: { siteId: site.id }
                    },
                    select: { assignedTechnicianId: true }
                });
                const technicianIds = workOrders
                    .map(w => w.assignedTechnicianId)
                    .filter((id): id is string => !!id);

                const uniqueUserIds = Array.from(new Set([userId, ...supervisorIds, ...technicianIds]));
                totalUsers = uniqueUserIds.length;

                totalAssets = await this.prisma.asset.count({
                    where: {
                        organizationId,
                        siteId: site.id,
                    },
                });

                totalWorkOrders = await this.prisma.workOrder.count({
                    where: {
                        organizationId,
                        asset: {
                            siteId: site.id,
                        },
                    },
                });

                openWorkOrders = await this.prisma.workOrder.count({
                    where: {
                        organizationId,
                        status: 'OPEN',
                        asset: {
                            siteId: site.id,
                        },
                    },
                });
            }
        } else {
            totalUsers = await this.prisma.user.count({
                where: {
                    organizationId,
                },
            });

            totalAssets = await this.prisma.asset.count({
                where: {
                    organizationId,
                },
            });

            totalWorkOrders = await this.prisma.workOrder.count({
                where: {
                    organizationId,
                },
            });

            openWorkOrders = await this.prisma.workOrder.count({
                where: {
                    organizationId,
                    status: 'OPEN',
                },
            });
        }

        return {
            cards: {
                totalUsers,
                totalAssets,
                totalWorkOrders,
                openWorkOrders,
                energyConsumptionLastMonth: 45200,
                energySavingsLastMonth: 5400,
                energySavingsCostLastMonth: 1250,
                operationSpendCurrentMonth: 8900,
                operationSpendLastMonth: 12400,
                targetBudgetCurrentMonth: 15000,
                targetBudgetLastMonth: 14000,
                expenseTillNow: 68500,
            },
        };
    }

    async getWorkOrderStatus(
        organizationId: string,
        role?: string,
        userId?: string,
    ) {
        const statuses = [
            'OPEN',
            'ASSIGNED',
            'IN_PROGRESS',
            'ON_HOLD',
            'COMPLETED',
            'CLOSED',
        ];

        let whereClause: any = {
            organizationId,
        };

        if (role === 'SITE_INCHARGE' && userId) {
            const site = await this.prisma.site.findFirst({
                where: {
                    assignedSupervisorId: userId,
                    organizationId,
                    status: true,
                },
                select: { id: true },
            });
            if (site) {
                whereClause.asset = {
                    siteId: site.id,
                };
            } else {
                whereClause.id = 'none';
            }
        }

        const data = await Promise.all(
            statuses.map(async (status) => ({
                status,
                count: await this.prisma.workOrder.count({
                    where: {
                        ...whereClause,
                        status: status as any,
                    },
                }),
            })),
        );

        return data;
    }

    async getRecentActivities(
        organizationId: string,
        role?: string,
        userId?: string,
    ) {
        let whereClause: any = {
            organizationId,
        };

        if (role === 'SITE_INCHARGE' && userId) {
            const site = await this.prisma.site.findFirst({
                where: {
                    assignedSupervisorId: userId,
                    organizationId,
                    status: true,
                },
                select: { id: true },
            });
            if (site) {
                const deptSupervisors = await this.prisma.department.findMany({
                    where: { siteId: site.id, status: true },
                    select: { assignedSupervisorId: true }
                });
                const supervisorIds = deptSupervisors
                    .map(d => d.assignedSupervisorId)
                    .filter((id): id is string => !!id);

                const workOrders = await this.prisma.workOrder.findMany({
                    where: {
                        asset: { siteId: site.id }
                    },
                    select: { assignedTechnicianId: true }
                });
                const technicianIds = workOrders
                    .map(w => w.assignedTechnicianId)
                    .filter((id): id is string => !!id);

                const uniqueUserIds = Array.from(new Set([userId, ...supervisorIds, ...technicianIds]));

                whereClause.performedById = {
                    in: uniqueUserIds
                };
            } else {
                whereClause.id = 'none';
            }
        }

        return this.prisma.activityLog.findMany({
            where: whereClause,
            include: {
                performedBy: {
                    select: {
                        id: true,
                        fullName: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 10,
        });
    }

    async getUserRoleDistribution(
        organizationId: string,
    ) {
        const users = await this.prisma.user.groupBy({
            by: ['roleId'],
            where: {
                organizationId,
            },
            _count: {
                roleId: true,
            },
        });

        const roles = await this.prisma.role.findMany();

        return users.map((user) => ({
            role:
                roles.find(
                    (role) => role.id === user.roleId,
                )?.name || 'Unknown',
            count: user._count.roleId,
        }));
    }

    async getTechnicianWorkload(
        organizationId: string,
        role?: string,
        userId?: string,
    ) {
        let whereTechnician: any = {
            organizationId,
            role: {
                name: 'TECHNICIAN',
            },
        };

        let whereWorkOrder: any = {
            organizationId,
        };

        if (role === 'SITE_INCHARGE' && userId) {
            const site = await this.prisma.site.findFirst({
                where: {
                    assignedSupervisorId: userId,
                    organizationId,
                    status: true,
                },
                select: { id: true },
            });
            if (site) {
                const workOrders = await this.prisma.workOrder.findMany({
                    where: {
                        asset: { siteId: site.id }
                    },
                    select: { assignedTechnicianId: true }
                });
                const technicianIds = workOrders
                    .map(w => w.assignedTechnicianId)
                    .filter((id): id is string => !!id);

                whereTechnician.id = {
                    in: Array.from(new Set(technicianIds))
                };

                whereWorkOrder.asset = {
                    siteId: site.id,
                };
            } else {
                whereTechnician.id = 'none';
            }
        }

        const technicians = await this.prisma.user.findMany({
            where: whereTechnician,
            select: {
                id: true,
                fullName: true,
            },
        });

        const workload = await Promise.all(
            technicians.map(async (tech) => ({
                technician: tech.fullName,
                assignedWorkOrders: await this.prisma.workOrder.count({
                    where: {
                        ...whereWorkOrder,
                        assignedTechnicianId: tech.id,
                    },
                }),
            })),
        );

        return workload;
    }

    async getDashboardSummary(
        organizationId: string,
        role?: string,
        userId?: string,
        search?: string,
        page = 1,
        limit = 5,
    ) {
        const where: any = {
            organizationId,
            status: true,
        };

        if (role === 'SITE_INCHARGE' && userId) {
            const site = await this.prisma.site.findFirst({
                where: {
                    assignedSupervisorId: userId,
                    organizationId,
                    status: true,
                },
                select: { id: true, customerId: true },
            });
            if (site) {
                where.id = site.customerId;
            } else {
                where.id = 'none';
            }
        }

        if (search) {
            where.OR = [
                {
                    name: {
                        contains: search,
                        mode: 'insensitive',
                    },
                },
                {
                    code: {
                        contains: search,
                        mode: 'insensitive',
                    },
                },
            ];
        }

        const [customers, total] = await Promise.all([
            this.prisma.customer.findMany({
                where,
                select: {
                    id: true,
                    name: true,
                    code: true,
                },
                skip: (page - 1) * limit,
                take: limit,
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            this.prisma.customer.count({
                where,
            }),
        ]);

        const data = await Promise.all(
            customers.map(async (customer) => {
                let siteWhere: any = {
                    customerId: customer.id,
                    status: true,
                };
                if (role === 'SITE_INCHARGE' && userId) {
                    const site = await this.prisma.site.findFirst({
                        where: {
                            assignedSupervisorId: userId,
                            organizationId,
                            status: true,
                        },
                        select: { id: true },
                    });
                    if (site) {
                        siteWhere.id = site.id;
                    } else {
                        siteWhere.id = 'none';
                    }
                }

                const siteIds = await this.prisma.site.findMany({
                    where: siteWhere,
                    select: {
                        id: true,
                    },
                });

                const sitesCount = siteIds.length;
                const siteIdList = siteIds.map((site) => site.id);

                const departments = await this.prisma.department.findMany({
                    where: {
                        siteId: {
                            in: siteIdList,
                        },
                        status: true,
                    },
                    select: {
                        id: true,
                    },
                });

                const departmentIds = departments.map((department) => department.id);

                const systems = await this.prisma.system.findMany({
                    where: {
                        departmentId: {
                            in: departmentIds,
                        },
                        status: true,
                    },
                    select: {
                        id: true,
                    },
                });

                let assetsWhere: any = {
                    customerId: customer.id,
                };
                if (role === 'SITE_INCHARGE') {
                    assetsWhere.siteId = { in: siteIdList };
                }

                const assetsCount = await this.prisma.asset.count({
                    where: assetsWhere,
                });

                let workOrdersWhere: any = {
                    asset: {
                        customerId: customer.id,
                    },
                };
                if (role === 'SITE_INCHARGE') {
                    workOrdersWhere.asset = {
                        siteId: { in: siteIdList },
                    };
                }

                const workOrdersCount = await this.prisma.workOrder.count({
                    where: workOrdersWhere,
                });

                let checklistWhere: any = {
                    organizationId,
                    workOrders: {
                        some: {
                            asset: {
                                customerId: customer.id,
                            },
                        },
                    },
                };
                if (role === 'SITE_INCHARGE') {
                    checklistWhere.workOrders = {
                        some: {
                            asset: {
                                siteId: { in: siteIdList },
                            },
                        },
                    };
                }

                const checklistCount = await this.prisma.checklistTemplate.count({
                    where: checklistWhere,
                });

                return {
                    customerId: customer.id,
                    customerName: customer.name,
                    customerCode: customer.code,
                    sites: sitesCount,
                    departments: departments.length,
                    systems: systems.length,
                    assets: assetsCount,
                    workOrders: workOrdersCount,
                    checklists: checklistCount,
                };
            }),
        );

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
}