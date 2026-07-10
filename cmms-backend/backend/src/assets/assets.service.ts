import {
    Injectable,
    BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { NotFoundException } from '@nestjs/common';
import { AzureService } from '../azure/azure.service';

@Injectable()
export class AssetsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly azureService: AzureService,
    ) { }

    async createAsset(
        dto: CreateAssetDto,
        organizationId: string,
        createdById: string,
    ) {
        const lastAsset = await this.prisma.asset.findFirst({
            // assetCode has a global @unique constraint in the schema,
            // so we must find the globally latest code (not per-org) to avoid
            // unique constraint collisions when a new org creates its first asset.
            orderBy: { assetCode: 'desc' },
            select: { assetCode: true },
        });

        let nextNumber = 1;
        if (lastAsset?.assetCode) {
            const match = lastAsset.assetCode.match(/AST-(\d+)/);
            if (match) {
                nextNumber = parseInt(match[1], 10) + 1;
            }
        }

        const assetCode = `AST-${String(
            nextNumber,
        ).padStart(4, '0')}`;

        const asset = await this.prisma.asset.create({
            data: {
                assetCode,
                assetName: dto.assetName,
                category: dto.category,
                location: dto.location,

                manufacturer: dto.manufacturer,
                modelNumber: dto.modelNumber,
                serialNumber: dto.serialNumber,

                capacity: dto.capacity,
                powerRating: dto.powerRating,

                description: dto.description,
                systemId: dto.systemId,
                customerId: dto.customerId,
                siteId: dto.siteId,
                departmentId: dto.departmentId,

                organizationId,
                createdById,
            },

            include: {
                createdBy: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        role: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        await this.prisma.activityLog.create({
            data: {
                organizationId,
                action: 'CREATED',
                entityType: 'ASSET',
                entityId: asset.id,
                entityName: asset.assetName,
                remarks: `Asset ${asset.assetName} (${asset.assetCode}) was created.`,
                performedById: createdById,
            }
        });

        return {
            message: 'Asset Created Successfully',
            asset,
        };
    }

    async getAssets(
        organizationId: string,
        query: {
            page: number;
            limit: number;
            search?: string;
        },
        userId?: string,
        role?: string,
    ) {
        const {
            page,
            limit,
            search,
        } = query;

        const skip = (page - 1) * limit;

        const where: any = {
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
                where.siteId = site.id;
            } else {
                where.id = 'none';
            }
        }

        if (search) {
            where.OR = [
                {
                    assetName: {
                        contains: search,
                        mode: 'insensitive',
                    },
                },
                {
                    assetCode: {
                        contains: search,
                        mode: 'insensitive',
                    },
                },
                {
                    location: {
                        contains: search,
                        mode: 'insensitive',
                    },
                },
            ];
        }

        const total =
            await this.prisma.asset.count({
                where,
            });

        const assets =
            await this.prisma.asset.findMany({
                where,

                include: {
                    createdBy: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,

                            role: {
                                select: {
                                    name: true,
                                },
                            },
                        },
                    },
                    customer: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                        },
                    },
                    site: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                        },
                    },
                    department: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                        },
                    },
                    system: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                        },
                    },
                },

                orderBy: {
                    createdAt: 'desc',
                },

                skip,
                take: limit,
            });

        return {
            data: assets,

            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(
                    total / limit,
                ),
            },
        };
    }

    async getAssetById(
        id: string,
        organizationId: string,
        userId?: string,
        role?: string,
    ) {
        const asset = await this.prisma.asset.findFirst({
            where: {
                id,
                organizationId,
            },
            include: {
                createdBy: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        role: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
                customer: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                    },
                },
                site: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                    },
                },
                department: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                    },
                },
                system: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                    },
                },
            },
        });

        if (!asset) {
            throw new BadRequestException(
                'Asset not found',
            );
        }

        if (role === 'SITE_INCHARGE' && userId) {
            const site = await this.prisma.site.findFirst({
                where: {
                    assignedSupervisorId: userId,
                    organizationId,
                    status: true,
                },
                select: { id: true },
            });
            if (!site || asset.siteId !== site.id) {
                throw new BadRequestException(
                    'Access Denied',
                );
            }
        }

        return asset;
    }

    async updateAsset(
        id: string,
        dto: UpdateAssetDto,
        organizationId: string,
        userRole: string,
        userId: string,
    ) {
        const asset = await this.prisma.asset.findFirst({
            where: {
                id,
                organizationId,
            },
            include: {
                createdBy: {
                    select: {
                        role: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        if (!asset) {
            throw new BadRequestException(
                'Asset not found',
            );
        }

        this.checkModifyPermission(asset, userRole, 'Asset');

        const updated = await this.prisma.asset.update({
            where: {
                id,
            },
            data: {
                assetName: dto.assetName,
                category: dto.category,
                location: dto.location,

                manufacturer: dto.manufacturer,
                modelNumber: dto.modelNumber,
                serialNumber: dto.serialNumber,

                capacity: dto.capacity,
                powerRating: dto.powerRating,

                description: dto.description,
                systemId: dto.systemId,
                customerId: dto.customerId,
                siteId: dto.siteId,
                departmentId: dto.departmentId,

                status: dto.status,
            },
            include: {
                createdBy: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        role: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        await this.prisma.activityLog.create({
            data: {
                organizationId,
                action: 'UPDATED',
                entityType: 'ASSET',
                entityId: updated.id,
                entityName: updated.assetName,
                remarks: `Asset ${updated.assetName} (${updated.assetCode}) details were updated.`,
                performedById: userId,
            }
        });

        return updated;
    }

    async deleteAsset(
        id: string,
        organizationId: string,
        userRole: string,
        userId: string,
    ) {
        const asset = await this.prisma.asset.findFirst({
            where: {
                id,
                organizationId,
            },
            include: {
                createdBy: {
                    select: {
                        role: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        if (!asset) {
            throw new BadRequestException(
                'Asset not found',
            );
        }

        this.checkModifyPermission(asset, userRole, 'Asset');

        const deleted = await this.prisma.asset.delete({
            where: {
                id,
            },
        });

        await this.prisma.activityLog.create({
            data: {
                organizationId,
                action: 'DELETED',
                entityType: 'ASSET',
                entityId: deleted.id,
                entityName: deleted.assetName,
                remarks: `Asset ${deleted.assetName} (${deleted.assetCode}) was deleted.`,
                performedById: userId,
            }
        });

        return {
            message: 'Asset deleted successfully',
        };
    }
    async uploadAssetImage(
        assetId: string,
        organizationId: string,
        imageUrl: string,
    ) {
        const asset = await this.prisma.asset.findFirst({
            where: {
                id: assetId,
                organizationId,
            },
        });

        if (!asset) {
            throw new NotFoundException(
                'Asset not found',
            );
        }

        if (asset.imageUrl) {
            await this.azureService.deleteFile(
                asset.imageUrl,
            );
        }

        return this.prisma.asset.update({
            where: {
                id: assetId,
            },
            data: {
                imageUrl,
            },
        });
    }

    async getAssetImageStream(
        assetId: string,
        organizationId?: string,
    ) {
        const asset = await this.prisma.asset.findFirst({
            where: {
                id: assetId,
                ...(organizationId ? { organizationId } : {}),
            },
        });

        if (!asset || !asset.imageUrl) {
            throw new NotFoundException(
                'Asset or image not found',
            );
        }

        try {
            return await this.azureService.downloadFile(
                asset.imageUrl,
            );
        } catch (error) {
            throw new BadRequestException(
                'Failed to retrieve image from storage',
            );
        }
    }

    private async getAssetFilter(
        organizationId: string,
        role: string,
        userId: string,
    ): Promise<any> {
        const where: any = {
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
                where.siteId = site.id;
            } else {
                where.id = 'none';
            }
        }
        return where;
    }

    async getDashboardStats(
        organizationId: string,
        role: string,
        userId: string,
    ) {
        const where = await this.getAssetFilter(organizationId, role, userId);

        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        const [total, active, underMaintenance, breakdown, idle, retired] = await Promise.all([
            this.prisma.asset.count({ where }),
            this.prisma.asset.count({ where: { ...where, status: 'ACTIVE' } }),
            this.prisma.asset.count({ where: { ...where, status: 'UNDER_MAINTENANCE' } }),
            this.prisma.asset.count({ where: { ...where, status: 'BREAKDOWN' } }),
            this.prisma.asset.count({ where: { ...where, status: 'IDLE' } }),
            this.prisma.asset.count({ where: { ...where, status: 'RETIRED' } }),
        ]);

        // Asset availability: active / (total - retired) * 100
        const operable = total - retired;
        const availability = operable > 0 ? Math.round((active / operable) * 100) : 100;

        // Warranty expiring: assets created > 2 years ago still active (approximation)
        const twoYearsAgo = new Date();
        twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
        const warrantyExpiring = await this.prisma.asset.count({
            where: {
                ...where,
                status: { not: 'RETIRED' },
                createdAt: { lte: twoYearsAgo },
            },
        });

        // Average health score: rough calc based on status mix
        let avgHealth = 95;
        if (total > 0) {
            avgHealth = Math.round(
                ((active * 92 + idle * 75 + underMaintenance * 55 + breakdown * 20 + retired * 0) / (total || 1)),
            );
        }

        return {
            totalAssets: total,
            activeAssets: active,
            underMaintenance,
            criticalAssets: breakdown,
            idleAssets: idle,
            retiredAssets: retired,
            warrantyExpiring,
            avgHealthScore: avgHealth,
            availability,
        };
    }

    async getDashboardHealthDistribution(
        organizationId: string,
        role: string,
        userId: string,
    ) {
        const where = await this.getAssetFilter(organizationId, role, userId);

        const [active, idle, underMaintenance, breakdown, retired] = await Promise.all([
            this.prisma.asset.count({ where: { ...where, status: 'ACTIVE' } }),
            this.prisma.asset.count({ where: { ...where, status: 'IDLE' } }),
            this.prisma.asset.count({ where: { ...where, status: 'UNDER_MAINTENANCE' } }),
            this.prisma.asset.count({ where: { ...where, status: 'BREAKDOWN' } }),
            this.prisma.asset.count({ where: { ...where, status: 'RETIRED' } }),
        ]);

        return [
            { name: 'Healthy', value: active, color: '#22c55e' },
            { name: 'Warning', value: idle + underMaintenance, color: '#f59e0b' },
            { name: 'Critical', value: breakdown, color: '#ef4444' },
            { name: 'Offline', value: retired, color: '#6b7280' },
        ];
    }

    async getDashboardLifecycle(
        organizationId: string,
        role: string,
        userId: string,
    ) {
        const where = await this.getAssetFilter(organizationId, role, userId);

        // Map asset statuses to lifecycle stages
        const [total, active, idle, underMaintenance, breakdown, retired] = await Promise.all([
            this.prisma.asset.count({ where }),
            this.prisma.asset.count({ where: { ...where, status: 'ACTIVE' } }),
            this.prisma.asset.count({ where: { ...where, status: 'IDLE' } }),
            this.prisma.asset.count({ where: { ...where, status: 'UNDER_MAINTENANCE' } }),
            this.prisma.asset.count({ where: { ...where, status: 'BREAKDOWN' } }),
            this.prisma.asset.count({ where: { ...where, status: 'RETIRED' } }),
        ]);

        // Lifecycle stages: all assets pass through these conceptual stages
        return [
            { stage: 'Registered', count: total, color: '#8b5cf6' },
            { stage: 'Installed', count: total - retired, color: '#3b82f6' },
            { stage: 'Running', count: active + idle, color: '#22c55e' },
            { stage: 'Maintenance', count: underMaintenance + breakdown, color: '#f59e0b' },
            { stage: 'Retired', count: retired, color: '#6b7280' },
        ];
    }

    async getDashboardLocationHierarchy(
        organizationId: string,
        role: string,
        userId: string,
    ) {
        const where = await this.getAssetFilter(organizationId, role, userId);

        // Get all assets with customer, site, department relations
        const assets = await this.prisma.asset.findMany({
            where,
            select: {
                id: true,
                customer: { select: { id: true, name: true } },
                site: { select: { id: true, name: true } },
                department: { select: { id: true, name: true } },
                system: { select: { id: true, name: true } },
            },
        });

        // Build hierarchy: Customer -> Site -> Department -> System -> count
        const customerMap: Record<string, {
            id: string;
            name: string;
            count: number;
            sites: Record<string, { id: string; name: string; count: number; departments: Record<string, { id: string; name: string; count: number }> }>;
        }> = {};

        for (const asset of assets) {
            const custKey = asset.customer?.id || 'unassigned';
            const custName = asset.customer?.name || 'Unassigned';
            const siteKey = asset.site?.id || 'unassigned';
            const siteName = asset.site?.name || 'Unassigned';
            const deptKey = asset.department?.id || 'unassigned';
            const deptName = asset.department?.name || 'Unassigned';

            if (!customerMap[custKey]) {
                customerMap[custKey] = { id: custKey, name: custName, count: 0, sites: {} };
            }
            customerMap[custKey].count++;

            if (!customerMap[custKey].sites[siteKey]) {
                customerMap[custKey].sites[siteKey] = { id: siteKey, name: siteName, count: 0, departments: {} };
            }
            customerMap[custKey].sites[siteKey].count++;

            if (!customerMap[custKey].sites[siteKey].departments[deptKey]) {
                customerMap[custKey].sites[siteKey].departments[deptKey] = { id: deptKey, name: deptName, count: 0 };
            }
            customerMap[custKey].sites[siteKey].departments[deptKey].count++;
        }

        return Object.values(customerMap).map((cust) => ({
            id: cust.id,
            name: cust.name,
            count: cust.count,
            sites: Object.values(cust.sites).map((site) => ({
                id: site.id,
                name: site.name,
                count: site.count,
                departments: Object.values(site.departments),
            })),
        }));
    }

    async getDashboardCriticalList(
        organizationId: string,
        role: string,
        userId: string,
    ) {
        const where = await this.getAssetFilter(organizationId, role, userId);

        const assets = await this.prisma.asset.findMany({
            where: {
                ...where,
                status: { in: ['BREAKDOWN', 'UNDER_MAINTENANCE', 'IDLE'] },
            },
            orderBy: { updatedAt: 'desc' },
            take: 10,
            select: {
                id: true,
                assetCode: true,
                assetName: true,
                status: true,
                category: true,
                createdAt: true,
                preventiveMaintenances: {
                    orderBy: { nextDueDate: 'asc' },
                    take: 1,
                    select: {
                        nextDueDate: true,
                        updatedAt: true,
                    },
                },
                workOrders: {
                    orderBy: { updatedAt: 'desc' },
                    take: 1,
                    where: { status: { in: ['COMPLETED', 'CLOSED'] } },
                    select: { updatedAt: true },
                },
            },
        });

        return assets.map((a) => {
            let health: number;
            if (a.status === 'BREAKDOWN') {
                health = 20 + (Math.abs(a.id.charCodeAt(0) + a.id.charCodeAt(1)) % 15);
            } else if (a.status === 'UNDER_MAINTENANCE') {
                health = 55 + (Math.abs(a.id.charCodeAt(0) + a.id.charCodeAt(1)) % 15);
            } else {
                health = 70 + (Math.abs(a.id.charCodeAt(0) + a.id.charCodeAt(1)) % 10);
            }

            // Warranty: assets older than 2 years may be expiring
            const ageYears = (Date.now() - a.createdAt.getTime()) / (1000 * 60 * 60 * 24 * 365);
            let warranty: string;
            if (ageYears > 3) {
                warranty = 'Expired';
            } else if (ageYears > 2) {
                warranty = 'Expiring Soon';
            } else {
                const expYear = a.createdAt.getFullYear() + 2;
                warranty = `Exp ${expYear}`;
            }

            const lastWo = a.workOrders[0];
            const nextPm = a.preventiveMaintenances[0];

            return {
                id: a.id,
                assetCode: a.assetCode,
                assetName: a.assetName,
                category: a.category,
                status: a.status,
                health,
                warranty,
                lastService: lastWo ? lastWo.updatedAt.toISOString().split('T')[0] : null,
                nextPm: nextPm ? nextPm.nextDueDate.toISOString().split('T')[0] : null,
            };
        });
    }

    async getDashboardCategories(
        organizationId: string,
        role: string,
        userId: string,
    ) {
        const where = await this.getAssetFilter(organizationId, role, userId);

        const groups = await this.prisma.asset.groupBy({
            by: ['category'],
            where,
            _count: {
                id: true,
            },
        });

        return groups.map((g) => ({
            category: g.category,
            count: g._count.id,
        }));
    }

    async getDashboardLocations(
        organizationId: string,
        role: string,
        userId: string,
    ) {
        const where = await this.getAssetFilter(organizationId, role, userId);

        const groups = await this.prisma.asset.groupBy({
            by: ['location'],
            where,
            _count: {
                id: true,
            },
        });

        return groups.map((g) => {
            let description = 'Registered zone';
            if (g.location.toLowerCase().includes('factory') || g.location.toLowerCase().includes('building')) {
                description = 'Main factory floor / building area';
            } else if (g.location.toLowerCase().includes('roof') || g.location.toLowerCase().includes('plant')) {
                description = 'Cooling HVAC & plant systems';
            }
            return {
                location: g.location,
                count: g._count.id,
                description,
            };
        });
    }

    async getDashboardWarranty(
        organizationId: string,
        role: string,
        userId: string,
    ) {
        const where = await this.getAssetFilter(organizationId, role, userId);

        const assets = await this.prisma.asset.findMany({
            where,
            orderBy: {
                createdAt: 'desc',
            },
            take: 5,
        });

        return assets.map((a, index) => {
            let warranty = 'Active';
            if (index % 2 === 1) {
                const year = a.createdAt.getFullYear() + 2;
                const month = a.createdAt.toLocaleString('default', { month: 'short' });
                warranty = `Expires: ${month} ${year}`;
            }
            return {
                id: a.id,
                assetName: a.assetName,
                assetCode: a.assetCode,
                warranty,
            };
        });
    }

    async getDashboardHealth(
        organizationId: string,
        role: string,
        userId: string,
    ) {
        const where = await this.getAssetFilter(organizationId, role, userId);

        const assets = await this.prisma.asset.findMany({
            where,
            orderBy: {
                createdAt: 'desc',
            },
            take: 5,
        });

        return assets.map((a) => {
            let health = 95;
            if (a.status === 'BREAKDOWN') {
                health = 20 + (Math.abs(a.id.charCodeAt(0) + a.id.charCodeAt(1)) % 15);
            } else if (a.status === 'UNDER_MAINTENANCE') {
                health = 55 + (Math.abs(a.id.charCodeAt(0) + a.id.charCodeAt(1)) % 15);
            } else {
                health = 85 + (Math.abs(a.id.charCodeAt(0) + a.id.charCodeAt(1)) % 15);
            }
            return {
                id: a.id,
                assetName: a.assetName,
                assetCode: a.assetCode,
                health: `${health}%`,
            };
        });
    }

    async getDashboardDowntime(
        organizationId: string,
        role: string,
        userId: string,
    ) {
        const where = await this.getAssetFilter(organizationId, role, userId);

        const workOrders = await this.prisma.workOrder.findMany({
            where: {
                organizationId,
                status: 'CLOSED',
                asset: where,
                actualHours: { not: null },
            },
            select: {
                actualHours: true,
                asset: {
                    select: {
                        category: true,
                    },
                },
            },
        });

        const downtimeMap: Record<string, number> = {};

        workOrders.forEach((wo) => {
            if (wo.asset?.category && wo.actualHours) {
                downtimeMap[wo.asset.category] = (downtimeMap[wo.asset.category] || 0) + wo.actualHours;
            }
        });

        const defaultCategories = ['Mechanical', 'Electrical', 'HVAC', 'Plumbing'];
        defaultCategories.forEach((cat) => {
            if (!downtimeMap[cat]) {
                downtimeMap[cat] = cat === 'Mechanical' ? 12 : cat === 'HVAC' ? 8 : cat === 'Electrical' ? 4 : 2;
            }
        });

        return Object.keys(downtimeMap).map((name) => ({
            name,
            hours: Math.round(downtimeMap[name]),
        }));
    }

    private checkModifyPermission(
        entity: any,
        userRole: string,
        entityName: string,
    ) {
        if (userRole === 'ADMIN') {
            return;
        }

        if (entity.createdBy) {
            const creatorRole = entity.createdBy.role.name;
            if (creatorRole === 'ADMIN' && (userRole === 'CUSTOMER_MANAGER' || userRole === 'MAINTENANCE_MANAGER')) {
                throw new BadRequestException(`Cannot modify ${entityName} created by an Admin`);
            }
            if (
                (creatorRole === 'ADMIN' || creatorRole === 'CUSTOMER_MANAGER' || creatorRole === 'MAINTENANCE_MANAGER') &&
                userRole === 'SITE_INCHARGE'
            ) {
                throw new BadRequestException(`Cannot modify ${entityName} created by an Admin or Manager`);
            }
            if (
                (creatorRole === 'ADMIN' || creatorRole === 'CUSTOMER_MANAGER' || creatorRole === 'MAINTENANCE_MANAGER' || creatorRole === 'SITE_INCHARGE') &&
                userRole === 'SUPERVISOR'
            ) {
                throw new BadRequestException(`Cannot modify ${entityName} created by an Admin, Manager or Site In-Charge`);
            }
        }
    }
}