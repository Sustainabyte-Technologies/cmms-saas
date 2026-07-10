import {
    Injectable,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role, WorkOrderStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async createUser(
        dto: CreateUserDto,
        organizationId: string,
        createdById: string,
        currentUserRole: string,
    ) {
        const existingUser = await this.prisma.user.findFirst({
            where: {
                email: dto.email,
                organizationId,
            },
        });

        if (existingUser) {
            throw new BadRequestException(
                'Email already exists',
            );
        }

        const role = await this.prisma.role.findUnique({
            where: {
                name: dto.roleName,
            },
        });

        if (!role) {
            throw new BadRequestException(
                'Role not found',
            );
        }
        if (
            (currentUserRole === 'CUSTOMER_MANAGER' || currentUserRole === 'MAINTENANCE_MANAGER') &&
            ['ADMIN', 'CUSTOMER_MANAGER', 'MAINTENANCE_MANAGER'].includes(dto.roleName)
        ) {
            throw new BadRequestException(
                'Customer Manager cannot create Admin or Customer Manager',
            );
        }
        if (
            currentUserRole === 'SITE_INCHARGE' &&
            !['SUPERVISOR', 'TECHNICIAN'].includes(dto.roleName)
        ) {
            throw new BadRequestException(
                'Site In-Charge can only create Supervisor or Technician roles',
            );
        }
        if (
            currentUserRole === 'SUPERVISOR' &&
            dto.roleName !== 'TECHNICIAN'
        ) {
            throw new BadRequestException(
                'Supervisor can only create Technician role',
            );
        }
        const hashedPassword = await bcrypt.hash(
            dto.password,
            10,
        );

        const user = await this.prisma.user.create({
            data: {
                fullName: dto.fullName,
                email: dto.email,
                passwordHash: hashedPassword,
                phoneNumber: dto.phoneNumber,
                organizationId,
                roleId: role.id,
                createdById, // 🔥 New Field
            },
            include: {
                role: true,
                organization: true,
                createdBy: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },
            },
        });

        return {
            message: 'User Created Successfully',
            user,
        };
    }

    async getUsers(
        organizationId: string,
        currentUserRole: string,
        currentUserId: string,
        query: {
            page: number;
            limit: number;
            search?: string;
            role?: string;
        },
    ) {
        const {
            page,
            limit,
            search,
            role,
        } = query;

        const skip = (page - 1) * limit;

        const where: any = {
            organizationId,

            role: {
                name: {
                    not: 'ADMIN',
                },
            },
        };

        if (search) {
            where.OR = [
                {
                    fullName: {
                        contains: search,
                        mode: 'insensitive',
                    },
                },
                {
                    email: {
                        contains: search,
                        mode: 'insensitive',
                    },
                },
            ];
        }

        if (role) {
            where.role = {
                name: role,
            };
        }

        const total =
            await this.prisma.user.count({
                where,
            });

        const users =
            await this.prisma.user.findMany({
                where,

                include: {
                    role: true,

                    createdBy: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                            role: true,
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
            data: users,

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

    async getUserById(
        id: string,
        organizationId: string,
        currentUserRole: string,
        currentUserId: string,
    ) {
        const user = await this.prisma.user.findFirst({
            where: {
                id,
                organizationId,
            },
            include: {
                role: true,
                createdBy: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        role: true,
                    },
                },
            },
        });

        if (!user) {
            throw new BadRequestException(
                'User not found',
            );
        }

        return user;
    }

    async updateUser(
        id: string,
        dto: UpdateUserDto,
        organizationId: string,
        currentUserRole: string,
        currentUserId: string,
    ) {
        const user = await this.prisma.user.findFirst({
            where: {
                id,
                organizationId,
            },
        });

        if (!user) {
            throw new BadRequestException(
                'User not found',
            );
        }

        if (
            (currentUserRole === 'CUSTOMER_MANAGER' || currentUserRole === 'MAINTENANCE_MANAGER') &&
            user.createdById !== currentUserId
        ) {
            throw new BadRequestException(
                'Access denied',
            );
        }

        if (currentUserRole === 'SITE_INCHARGE') {
            if (user.createdById !== currentUserId) {
                throw new BadRequestException('Access denied');
            }
            const targetUserRole = await this.prisma.role.findUnique({
                where: { id: user.roleId }
            });
            if (targetUserRole && !['SUPERVISOR', 'TECHNICIAN'].includes(targetUserRole.name)) {
                throw new BadRequestException('Site In-Charge can only manage Supervisor or Technician users');
            }
            if (dto.roleName && !['SUPERVISOR', 'TECHNICIAN'].includes(dto.roleName)) {
                throw new BadRequestException('Site In-Charge can only assign Supervisor or Technician roles');
            }
        }

        if (currentUserRole === 'SUPERVISOR') {
            if (user.createdById !== currentUserId) {
                throw new BadRequestException('Access denied');
            }
            const targetUserRole = await this.prisma.role.findUnique({
                where: { id: user.roleId }
            });
            if (targetUserRole && targetUserRole.name !== 'TECHNICIAN') {
                throw new BadRequestException('Supervisor can only manage Technician users');
            }
            if (dto.roleName && dto.roleName !== 'TECHNICIAN') {
                throw new BadRequestException('Supervisor can only assign Technician role');
            }
        }

        let roleId = user.roleId;

        if (dto.roleName) {
            const role = await this.prisma.role.findUnique({
                where: {
                    name: dto.roleName,
                },
            });

            if (!role) {
                throw new BadRequestException(
                    'Role not found',
                );
            }

            roleId = role.id;
        }

        let passwordHash: string | undefined;
        if (dto.password) {
            passwordHash = await bcrypt.hash(dto.password, 10);
        }

        return this.prisma.user.update({
            where: {
                id,
            },
            data: {
                fullName: dto.fullName,
                email: dto.email,
                phoneNumber: dto.phoneNumber,
                roleId,
                ...(passwordHash ? { passwordHash } : {}),
            },
            include: {
                role: true,
            },
        });
    }

    async deleteUser(
        id: string,
        organizationId: string,
        currentUserRole: string,
        currentUserId: string,
    ) {
        const user = await this.prisma.user.findFirst({
            where: {
                id,
                organizationId,
            },
        });

        if (!user) {
            throw new BadRequestException(
                'User not found',
            );
        }

        if (
            (currentUserRole === 'CUSTOMER_MANAGER' || currentUserRole === 'MAINTENANCE_MANAGER') &&
            user.createdById !== currentUserId
        ) {
            throw new BadRequestException(
                'Access denied',
            );
        }

        if (currentUserRole === 'SITE_INCHARGE') {
            if (user.createdById !== currentUserId) {
                throw new BadRequestException('Access denied');
            }
            const targetUserRole = await this.prisma.role.findUnique({
                where: { id: user.roleId }
            });
            if (targetUserRole && !['SUPERVISOR', 'TECHNICIAN'].includes(targetUserRole.name)) {
                throw new BadRequestException('Site In-Charge can only delete Supervisor or Technician users');
            }
        }

        if (currentUserRole === 'SUPERVISOR') {
            if (user.createdById !== currentUserId) {
                throw new BadRequestException('Access denied');
            }
            const targetUserRole = await this.prisma.role.findUnique({
                where: { id: user.roleId }
            });
            if (targetUserRole && targetUserRole.name !== 'TECHNICIAN') {
                throw new BadRequestException('Supervisor can only delete Technician users');
            }
        }

        await this.prisma.user.delete({
            where: {
                id,
            },
        });

        return {
            message: 'User deleted successfully',
        };
    }
    async getTechnicianWorkload(
        organizationId: string,
    ) {
        const technicians = await this.prisma.user.findMany({
            where: {
                organizationId,
                role: {
                    is: {
                        name: 'TECHNICIAN',
                    },
                },
            },
            select: {
                id: true,
                fullName: true,
                email: true,
            },
        });

        const workload = await Promise.all(
            technicians.map(async (tech) => {
                const activeWorkOrders =
                    await this.prisma.workOrder.count({
                        where: {
                            assignedTechnicianId: tech.id,
                            status: {
                                in: [
                                    WorkOrderStatus.OPEN,
                                    WorkOrderStatus.ASSIGNED,
                                    WorkOrderStatus.IN_PROGRESS,
                                    WorkOrderStatus.ON_HOLD,
                                ],
                            },
                        },
                    });

                return {
                    id: tech.id,
                    name: tech.fullName,
                    email: tech.email,
                    activeWorkOrders,
                };
            }),
        );

        return workload;
    }

    async getRoleDashboard(organizationId: string) {
        const ROLE_NAMES = ['ADMIN', 'CUSTOMER_MANAGER', 'SITE_INCHARGE', 'SUPERVISOR', 'TECHNICIAN'];

        // ── All users with role & assignment info ─────────────────────────
        const allUsers = await this.prisma.user.findMany({
            where: { organizationId },
            select: {
                id: true,
                fullName: true,
                email: true,
                phoneNumber: true,
                createdAt: true,
                role: { select: { name: true } },
                managedCustomers: { select: { id: true, name: true } },
                supervisedSites: { select: { id: true, name: true } },
                supervisedDepartments: { select: { id: true, name: true } },
                assignedWorkOrders: {
                    where: { status: { in: [WorkOrderStatus.OPEN, WorkOrderStatus.ASSIGNED, WorkOrderStatus.IN_PROGRESS] } },
                    select: { id: true },
                },
                assignedPMs: { select: { id: true } },
                createdAssets: { select: { id: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        // ── Global counts ────────────────────────────────────────────────
        const [totalCustomers, totalSites, totalDepts, totalAssets, totalWOs, totalPMs, activityLogs] = await Promise.all([
            this.prisma.customer.count({ where: { organizationId } }),
            this.prisma.site.count({ where: { organizationId } }),
            this.prisma.department.count({ where: { organizationId } }),
            this.prisma.asset.count({ where: { organizationId } }),
            this.prisma.workOrder.count({ where: { organizationId } }),
            this.prisma.preventiveMaintenance.count({ where: { organizationId } }),
            this.prisma.activityLog.findMany({
                where: { organizationId },
                orderBy: { createdAt: 'desc' },
                take: 15,
                select: {
                    id: true,
                    action: true,
                    entityType: true,
                    entityName: true,
                    createdAt: true,
                    performedBy: { select: { fullName: true, role: { select: { name: true } } } },
                },
            }),
        ]);

        // ── Per-role stats ───────────────────────────────────────────────
        const roleStats: Record<string, any> = {};
        for (const roleName of ROLE_NAMES) {
            const roleUsers = allUsers.filter((u) => u.role.name === roleName);
            roleStats[roleName] = {
                userCount: roleUsers.length,
                users: roleUsers.map((u) => ({
                    id: u.id,
                    fullName: u.fullName,
                    email: u.email,
                    role: u.role.name,
                    assignedCustomers: u.managedCustomers.length,
                    assignedSites: u.supervisedSites.length,
                    assignedDepts: u.supervisedDepartments.length,
                    activeWOs: u.assignedWorkOrders.length,
                    assignedPMs: u.assignedPMs.length,
                    managedAssets: u.createdAssets.length,
                    createdAt: u.createdAt.toISOString(),
                })),
            };
        }

        // ── Role distribution for donut chart ────────────────────────────
        const roleDistribution = ROLE_NAMES.map((r) => ({
            role: r,
            count: roleStats[r].userCount,
        }));

        // ── Workload per role ─────────────────────────────────────────────
        const [activeWOs, completedWOs, activePMs] = await Promise.all([
            this.prisma.workOrder.count({ where: { organizationId, status: { in: [WorkOrderStatus.OPEN, WorkOrderStatus.ASSIGNED, WorkOrderStatus.IN_PROGRESS] } } }),
            this.prisma.workOrder.count({ where: { organizationId, status: { in: [WorkOrderStatus.COMPLETED, WorkOrderStatus.CLOSED] } } }),
            this.prisma.preventiveMaintenance.count({ where: { organizationId, status: 'ACTIVE' } }),
        ]);

        // Role workload chart data
        const roleWorkload = ROLE_NAMES.map((r) => {
            const users = roleStats[r].users;
            const totalActiveWOs = users.reduce((s: number, u: any) => s + u.activeWOs, 0);
            const totalPMsAssigned = users.reduce((s: number, u: any) => s + u.assignedPMs, 0);
            return { role: r.replace('_', ' '), activeWOs: totalActiveWOs, activePMs: totalPMsAssigned };
        });

        // ── User table (flat, paginated - first 20) ───────────────────────
        const userTable = allUsers.slice(0, 20).map((u) => ({
            id: u.id,
            fullName: u.fullName,
            email: u.email,
            role: u.role.name,
            customers: u.managedCustomers.map((c: any) => c.name).join(', ') || '—',
            sites: u.supervisedSites.map((s: any) => s.name).join(', ') || '—',
            departments: u.supervisedDepartments.map((d: any) => d.name).join(', ') || '—',
            assignedAssets: u.createdAssets.length,
            activeWOs: u.assignedWorkOrders.length,
            assignedPMs: u.assignedPMs.length,
            status: 'ACTIVE',
            createdAt: u.createdAt.toISOString(),
        }));

        // ── KPI summary ───────────────────────────────────────────────────
        const kpis = {
            totalRoles: ROLE_NAMES.length,
            totalUsers: allUsers.length,
            activeUsers: allUsers.length,
            admins: roleStats['ADMIN'].userCount,
            customerManagers: roleStats['CUSTOMER_MANAGER'].userCount,
            siteInCharges: roleStats['SITE_INCHARGE'].userCount,
            supervisors: roleStats['SUPERVISOR'].userCount,
            technicians: roleStats['TECHNICIAN'].userCount,
            totalCustomers,
            totalSites,
            totalDepts,
            totalAssets,
            totalWOs,
            totalPMs,
            activeWOs,
            completedWOs,
            activePMs,
        };

        return {
            kpis,
            roleDistribution,
            roleStats,
            roleWorkload,
            userTable,
            recentActivities: activityLogs.map((a) => ({
                id: a.id,
                action: a.action,
                entityType: a.entityType,
                entityName: a.entityName,
                performedBy: a.performedBy.fullName,
                performedByRole: a.performedBy.role?.name ?? '',
                createdAt: a.createdAt.toISOString(),
            })),
        };
    }
}