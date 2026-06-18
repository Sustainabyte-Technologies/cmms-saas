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
            currentUserRole === 'MAINTENANCE_MANAGER' &&
            ['ADMIN', 'MAINTENANCE_MANAGER'].includes(dto.roleName)
        ) {
            throw new BadRequestException(
                'Maintenance Manager cannot create Admin or Maintenance Manager',
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
            currentUserRole === 'MAINTENANCE_MANAGER' &&
            user.createdById !== currentUserId
        ) {
            throw new BadRequestException(
                'Access denied',
            );
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
            currentUserRole === 'MAINTENANCE_MANAGER' &&
            user.createdById !== currentUserId
        ) {
            throw new BadRequestException(
                'Access denied',
            );
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
}