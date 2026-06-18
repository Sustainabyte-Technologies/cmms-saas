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
        const totalUsers =
            await this.prisma.user.count({
                where: {
                    organizationId,
                },
            });

        const totalAssets =
            await this.prisma.asset.count({
                where: {
                    organizationId,
                },
            });

        const totalWorkOrders =
            await this.prisma.workOrder.count({
                where: {
                    organizationId,
                },
            });

        const openWorkOrders =
            await this.prisma.workOrder.count({
                where: {
                    organizationId,
                    status: 'OPEN',
                },
            });

        return {
            cards: {
                totalUsers,
                totalAssets,
                totalWorkOrders,
                openWorkOrders,
            },
        };
    }
    async getWorkOrderStatus(
        organizationId: string,
    ) {
        const statuses = [
            'OPEN',
            'ASSIGNED',
            'IN_PROGRESS',
            'ON_HOLD',
            'COMPLETED',
            'CLOSED',
        ];

        const data = await Promise.all(
            statuses.map(async (status) => ({
                status,

                count:
                    await this.prisma.workOrder.count({
                        where: {
                            organizationId,
                            status: status as any,
                        },
                    }),
            })),
        );

        return data;
    }
    async getRecentActivities(
        organizationId: string,
    ) {
        return this.prisma.workOrderActivity.findMany({
            where: {
                workOrder: {
                    organizationId,
                },
            },

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
    ) {
        const technicians =
            await this.prisma.user.findMany({
                where: {
                    organizationId,
                    role: {
                        name: 'TECHNICIAN',
                    },
                },

                select: {
                    id: true,
                    fullName: true,
                },
            });

        const workload = await Promise.all(
            technicians.map(async (tech) => ({
                technician: tech.fullName,

                assignedWorkOrders:
                    await this.prisma.workOrder.count({
                        where: {
                            organizationId,

                            assignedTechnicianId:
                                tech.id,
                        },
                    }),
            })),
        );

        return workload;
    }
}