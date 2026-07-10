import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateSiteDto } from './dto/create-site.dto';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateCustomerDto } from './dto/update_customer.dto';
import { UpdateSiteDto } from './dto/update_site_dto';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { UpdateSystemDto } from './dto/update-system.dto';
import { CreateSystemDto } from './dto/create-system.dto';
import { AzureService } from '../azure/azure.service';

@Injectable()
export class CustomersService {
    constructor(
        private prisma: PrismaService,
        private readonly azureService: AzureService,
    ) { }

    async createCustomer(
        organizationId: string,
        dto: CreateCustomerDto,
        createdById: string,
    ) {
        const existingCustomer =
            await this.prisma.customer.findFirst({
                where: {
                    organizationId,
                    name: dto.name,

                },
            });

        if (existingCustomer) {
            throw new BadRequestException(
                'Customer already exists',
            );
        }

        const lastCustomer =
            await this.prisma.customer.findFirst({
                orderBy: {
                    createdAt: 'desc',
                },
                select: {
                    code: true,
                },
            });

        let nextNumber = 1;

        if (lastCustomer?.code) {
            nextNumber =
                parseInt(
                    lastCustomer.code.replace(
                        'CUS-',
                        '',
                    ),
                ) + 1;
        }

        const code = `CUS-${String(
            nextNumber,
        ).padStart(4, '0')}`;

        const customer = await this.prisma.customer.create({
            data: {
                name: dto.name,
                code,
                description: dto.description,
                contactPerson: dto.contactPerson,
                email: dto.email,
                phone: dto.phone,
                address: dto.address,
                city: dto.city,
                state: dto.state,
                country: dto.country,
                organizationId,
                assignedManagerId: dto.assignedManagerId ?? null,
                createdById,
            },
        });

        await this.prisma.activityLog.create({
            data: {
                organizationId,
                action: 'CREATED',
                entityType: 'CUSTOMER',
                entityId: customer.id,
                entityName: customer.name,
                remarks: `Customer ${customer.name} (${customer.code}) was created.`,
                performedById: createdById,
            }
        });

        return customer;
    }
    async createSite(
        organizationId: string,
        dto: CreateSiteDto,
        createdById: string,
    ) {
        const customer =
            await this.prisma.customer.findFirst({
                where: {
                    id: dto.customerId,
                    organizationId,
                },
            });

        if (!customer) {
            throw new NotFoundException(
                'Customer not found',
            );
        }

        const existingSite =
            await this.prisma.site.findFirst({
                where: {
                    customerId: dto.customerId,
                    name: dto.name,
                },
            });

        if (existingSite) {
            throw new BadRequestException(
                'Site already exists',
            );
        }

        const lastSite =
            await this.prisma.site.findFirst({
                orderBy: {
                    createdAt: 'desc',
                },
                select: {
                    code: true,
                },
            });

        let nextNumber = 1;

        if (lastSite?.code) {
            nextNumber =
                parseInt(
                    lastSite.code.replace(
                        'SITE-',
                        '',
                    ),
                ) + 1;
        }

        const code = `SITE-${String(
            nextNumber,
        ).padStart(4, '0')}`;

        if (dto.assignedSupervisorId) {
            const user = await this.prisma.user.findFirst({
                where: {
                    id: dto.assignedSupervisorId,
                    organizationId,
                },
                include: { role: true },
            });
            if (!user || user.role.name !== 'SITE_INCHARGE') {
                throw new BadRequestException('Assigned user must have the SITE_INCHARGE role');
            }
        }

        const site = await this.prisma.site.create({
            data: {
                name: dto.name,
                code,
                address: dto.address,
                city: dto.city,
                state: dto.state,
                country: dto.country,
                customerId: dto.customerId,
                organizationId,
                assignedSupervisorId: dto.assignedSupervisorId ?? null,
                createdById,
            },
        });

        await this.prisma.activityLog.create({
            data: {
                organizationId,
                action: 'CREATED',
                entityType: 'SITE',
                entityId: site.id,
                entityName: site.name,
                remarks: `Site ${site.name} (${site.code}) was created.`,
                performedById: createdById,
            }
        });

        return site;
    }
    async getCustomers(
        organizationId: string,
        search?: string,
        page = 1,
        limit = 10,
    ) {
        const where: any = {
            organizationId,
            status: true,
        };

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
                {
                    email: {
                        contains: search,
                        mode: 'insensitive',
                    },
                },
            ];
        }

        const [customers, total] =
            await Promise.all([
                this.prisma.customer.findMany({
                    where,

                    include: {
                        assignedManager: {
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

                        sites: {
                            where: {
                                status: true,
                            },
                            include: {
                                departments: {
                                    where: {
                                        status: true,
                                    },
                                    include: {
                                        systems: {
                                            where: {
                                                status: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
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

        return {
            data: customers,
            total,
            page,
            limit,
            totalPages: Math.ceil(
                total / limit,
            ),
        };
    }
    async getCustomerById(
        id: string,
        organizationId: string,
    ) {
        const customer =
            await this.prisma.customer.findFirst({
                where: {
                    id,
                    organizationId,
                    status: true,
                },
                include: {
                    assignedManager: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                            role: { select: { name: true } },
                        },
                    },
                    createdBy: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                            role: { select: { name: true } },
                        },
                    },
                    assets: {
                        where: {
                            siteId: null,
                        },
                        include: {
                            workOrders: {
                                include: {
                                    checklistTemplate: true,
                                },
                            },
                        },
                    },
                    sites: {
                        where: { status: true },
                        include: {
                            assets: {
                                where: {
                                    departmentId: null,
                                },
                                include: {
                                    workOrders: {
                                        include: {
                                            checklistTemplate: true,
                                        },
                                    },
                                },
                            },
                            departments: {
                                where: { status: true },
                                include: {
                                    assets: {
                                        where: {
                                            systemId: null,
                                        },
                                        include: {
                                            workOrders: {
                                                include: {
                                                    checklistTemplate: true,
                                                },
                                            },
                                        },
                                    },
                                    systems: {
                                        where: { status: true },
                                        include: {
                                            assets: {
                                                include: {
                                                    workOrders: {
                                                        include: {
                                                            checklistTemplate: true,
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            });

        if (!customer) {
            throw new NotFoundException(
                'Customer not found',
            );
        }

        return customer;
    }
    async updateCustomer(
        id: string,
        organizationId: string,
        dto: UpdateCustomerDto,
        userRole: string,
        userId: string,
    ) {
        const customer =
            await this.prisma.customer.findFirst({
                where: {
                    id,
                    organizationId,
                },
                include: {
                    createdBy: {
                        select: {
                            role: { select: { name: true } },
                        },
                    },
                },
            });

        if (!customer) {
            throw new NotFoundException(
                'Customer not found',
            );
        }

        this.checkModifyPermission(customer, userRole, 'Customer');

        const updated = await this.prisma.customer.update({
            where: {
                id,
            },
            data: {
                name: dto.name,
                description: dto.description,
                contactPerson: dto.contactPerson,
                email: dto.email,
                phone: dto.phone,
                address: dto.address,
                city: dto.city,
                state: dto.state,
                country: dto.country,
                ...(dto.assignedManagerId !== undefined
                    ? { assignedManagerId: dto.assignedManagerId }
                    : {}),
            },
        });

        await this.prisma.activityLog.create({
            data: {
                organizationId,
                action: 'UPDATED',
                entityType: 'CUSTOMER',
                entityId: updated.id,
                entityName: updated.name,
                remarks: `Customer ${updated.name} details were updated.`,
                performedById: userId,
            }
        });

        return updated;
    }
    async deleteCustomer(
        id: string,
        organizationId: string,
        userRole: string,
        userId: string,
    ) {
        const customer =
            await this.prisma.customer.findFirst({
                where: {
                    id,
                    organizationId,
                },
                include: {
                    createdBy: {
                        select: {
                            role: { select: { name: true } },
                        },
                    },
                },
            });

        if (!customer) {
            throw new NotFoundException(
                'Customer not found',
            );
        }

        this.checkModifyPermission(customer, userRole, 'Customer');

        const deleted = await this.prisma.customer.update({
            where: {
                id,
            },
            data: {
                status: false,
            },
        });

        await this.prisma.activityLog.create({
            data: {
                organizationId,
                action: 'DELETED',
                entityType: 'CUSTOMER',
                entityId: deleted.id,
                entityName: deleted.name,
                remarks: `Customer ${deleted.name} was deleted.`,
                performedById: userId,
            }
        });

        return deleted;
    }
    async getSites(
        organizationId: string,
        search?: string,
        page = 1,
        limit = 10,
    ) {
        const where: any = {
            organizationId,
            status: true,
        };

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

        const [sites, total] =
            await Promise.all([
                this.prisma.site.findMany({
                    where,

                    include: {
                        customer: {
                            select: {
                                id: true,
                                name: true,
                                code: true,
                            },
                        },
                        assignedSupervisor: {
                            select: {
                                id: true,
                                fullName: true,
                                email: true,
                                role: { select: { name: true } },
                            },
                        },
                        createdBy: {
                            select: {
                                id: true,
                                fullName: true,
                                email: true,
                                role: { select: { name: true } },
                            },
                        },
                    },

                    skip: (page - 1) * limit,
                    take: limit,

                    orderBy: {
                        createdAt: 'desc',
                    },
                }),

                this.prisma.site.count({
                    where,
                }),
            ]);

        return {
            data: sites,
            total,
            page,
            limit,
            totalPages: Math.ceil(
                total / limit,
            ),
        };
    }
    async getSiteById(
        id: string,
        organizationId: string,
    ) {
        const site =
            await this.prisma.site.findFirst({
                where: {
                    id,
                    organizationId,
                    status: true,
                },

                include: {
                    customer: true,
                    assignedSupervisor: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                            role: { select: { name: true } },
                        },
                    },
                    createdBy: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                            role: { select: { name: true } },
                        },
                    },
                },
            });

        if (!site) {
            throw new NotFoundException(
                'Site not found',
            );
        }

        return site;
    }
    async updateSite(
        id: string,
        organizationId: string,
        dto: UpdateSiteDto,
        userRole: string,
        userId: string,
    ) {
        const site =
            await this.prisma.site.findFirst({
                where: {
                    id,
                    organizationId,
                },
                include: {
                    createdBy: {
                        select: {
                            role: { select: { name: true } },
                        },
                    },
                },
            });

        if (!site) {
            throw new NotFoundException(
                'Site not found',
            );
        }

        this.checkModifyPermission(site, userRole, 'Site');

        if (dto.assignedSupervisorId) {
            const user = await this.prisma.user.findFirst({
                where: {
                    id: dto.assignedSupervisorId,
                    organizationId,
                },
                include: { role: true },
            });
            if (!user || user.role.name !== 'SITE_INCHARGE') {
                throw new BadRequestException('Assigned user must have the SITE_INCHARGE role');
            }
        }

        const updated = await this.prisma.site.update({
            where: {
                id,
            },

            data: {
                name: dto.name,
                address: dto.address,
                city: dto.city,
                state: dto.state,
                country: dto.country,
                ...(dto.assignedSupervisorId !== undefined
                    ? { assignedSupervisorId: dto.assignedSupervisorId }
                    : {}),
            },
        });

        await this.prisma.activityLog.create({
            data: {
                organizationId,
                action: 'UPDATED',
                entityType: 'SITE',
                entityId: updated.id,
                entityName: updated.name,
                remarks: `Site ${updated.name} details were updated.`,
                performedById: userId,
            }
        });

        return updated;
    }
    async deleteSite(
        id: string,
        organizationId: string,
        userRole: string,
        userId: string,
    ) {
        const site =
            await this.prisma.site.findFirst({
                where: {
                    id,
                    organizationId,
                },
                include: {
                    createdBy: {
                        select: {
                            role: { select: { name: true } },
                        },
                    },
                },
            });

        if (!site) {
            throw new NotFoundException(
                'Site not found',
            );
        }

        this.checkModifyPermission(site, userRole, 'Site');

        const deleted = await this.prisma.site.update({
            where: {
                id,
            },

            data: {
                status: false,
            },
        });

        await this.prisma.activityLog.create({
            data: {
                organizationId,
                action: 'DELETED',
                entityType: 'SITE',
                entityId: deleted.id,
                entityName: deleted.name,
                remarks: `Site ${deleted.name} was deleted.`,
                performedById: userId,
            }
        });

        return deleted;
    }
    async createDepartment(
        organizationId: string,
        dto: CreateDepartmentDto,
        createdById: string,
    ) {
        const site =
            await this.prisma.site.findFirst({
                where: {
                    id: dto.siteId,
                    organizationId,
                    status: true,
                },
            });

        if (!site) {
            throw new NotFoundException(
                'Site not found',
            );
        }

        const existingDepartment =
            await this.prisma.department.findFirst({
                where: {
                    siteId: dto.siteId,
                    name: dto.name,
                },
            });

        if (existingDepartment) {
            throw new BadRequestException(
                'Department already exists',
            );
        }

        const lastDepartment =
            await this.prisma.department.findFirst({
                orderBy: {
                    createdAt: 'desc',
                },
                select: {
                    code: true,
                },
            });

        let nextNumber = 1;

        if (lastDepartment?.code) {
            nextNumber =
                parseInt(
                    lastDepartment.code.replace(
                        'DEP-',
                        '',
                    ),
                ) + 1;
        }

        const code = `DEP-${String(
            nextNumber,
        ).padStart(4, '0')}`;

        if (dto.assignedSupervisorId) {
            const user = await this.prisma.user.findFirst({
                where: {
                    id: dto.assignedSupervisorId,
                    organizationId,
                },
                include: { role: true },
            });
            if (!user || user.role.name !== 'SUPERVISOR') {
                throw new BadRequestException('Assigned user must have the SUPERVISOR role');
            }
        }

        const department = await this.prisma.department.create({
            data: {
                name: dto.name,
                code,
                description: dto.description,

                siteId: dto.siteId,
                organizationId,
                createdById,
                assignedSupervisorId: dto.assignedSupervisorId ?? null,
            },
        });

        await this.prisma.activityLog.create({
            data: {
                organizationId,
                action: 'CREATED',
                entityType: 'DEPARTMENT',
                entityId: department.id,
                entityName: department.name,
                remarks: `Department ${department.name} (${department.code}) was created.`,
                performedById: createdById,
            }
        });

        return department;
    }
    async getDepartments(
        organizationId: string,
        search?: string,
        page = 1,
        limit = 10,
    ) {
        const where: any = {
            organizationId,
            status: true,
        };

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
                {
                    description: {
                        contains: search,
                        mode: 'insensitive',
                    },
                },
            ];
        }

        const [departments, total] =
            await Promise.all([
                this.prisma.department.findMany({
                    where,

                    include: {
                        site: {
                            select: {
                                id: true,
                                name: true,
                                code: true,
                            },
                        },

                        assignedSupervisor: {
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

                    skip: (page - 1) * limit,
                    take: limit,

                    orderBy: {
                        createdAt: 'desc',
                    },
                }),

                this.prisma.department.count({
                    where,
                }),
            ]);

        return {
            data: departments,
            total,
            page,
            limit,
            totalPages: Math.ceil(
                total / limit,
            ),
        };
    }
    async getDepartmentById(
        id: string,
        organizationId: string,
    ) {
        const department =
            await this.prisma.department.findFirst({
                where: {
                    id,
                    organizationId,
                    status: true,
                },

                include: {
                    site: true,
                    assignedSupervisor: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                            role: { select: { name: true } },
                        },
                    },
                    createdBy: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                            role: { select: { name: true } },
                        },
                    },
                },
            });

        if (!department) {
            throw new NotFoundException(
                'Department not found',
            );
        }

        return department;
    }
    async updateDepartment(
        id: string,
        organizationId: string,
        dto: UpdateDepartmentDto,
        userRole: string,
        userId: string,
    ) {
        const department =
            await this.prisma.department.findFirst({
                where: {
                    id,
                    organizationId,
                },
                include: {
                    createdBy: {
                        select: {
                            role: { select: { name: true } },
                        },
                    },
                },
            });

        if (!department) {
            throw new NotFoundException(
                'Department not found',
            );
        }

        this.checkModifyPermission(department, userRole, 'Department');

        if (dto.assignedSupervisorId) {
            const user = await this.prisma.user.findFirst({
                where: {
                    id: dto.assignedSupervisorId,
                    organizationId,
                },
                include: { role: true },
            });
            if (!user || user.role.name !== 'SUPERVISOR') {
                throw new BadRequestException('Assigned user must have the SUPERVISOR role');
            }
        }

        const updated = await this.prisma.department.update({
            where: {
                id,
            },
            data: {
                ...dto,
            },
        });

        await this.prisma.activityLog.create({
            data: {
                organizationId,
                action: 'UPDATED',
                entityType: 'DEPARTMENT',
                entityId: updated.id,
                entityName: updated.name,
                remarks: `Department ${updated.name} details were updated.`,
                performedById: userId,
            }
        });

        return updated;
    }
    async deleteDepartment(
        id: string,
        organizationId: string,
        userRole: string,
        userId: string,
    ) {
        const department =
            await this.prisma.department.findFirst({
                where: {
                    id,
                    organizationId,
                },
                include: {
                    createdBy: {
                        select: {
                            role: { select: { name: true } },
                        },
                    },
                },
            });

        if (!department) {
            throw new NotFoundException(
                'Department not found',
            );
        }

        this.checkModifyPermission(department, userRole, 'Department');

        const deleted = await this.prisma.department.update({
            where: {
                id,
            },
            data: {
                status: false,
            },
        });

        await this.prisma.activityLog.create({
            data: {
                organizationId,
                action: 'DELETED',
                entityType: 'DEPARTMENT',
                entityId: deleted.id,
                entityName: deleted.name,
                remarks: `Department ${deleted.name} was deleted.`,
                performedById: userId,
            }
        });

        return deleted;
    }
    async createSystem(
        organizationId: string,
        dto: CreateSystemDto,
        createdById: string,
    ) {
        const department =
            await this.prisma.department.findFirst({
                where: {
                    id: dto.departmentId,
                    organizationId,
                    status: true,
                },
            });

        if (!department) {
            throw new NotFoundException(
                'Department not found',
            );
        }

        const existingSystem =
            await this.prisma.system.findFirst({
                where: {
                    departmentId: dto.departmentId,
                    name: dto.name,
                },
            });

        if (existingSystem) {
            throw new BadRequestException(
                'System already exists',
            );
        }

        const lastSystem =
            await this.prisma.system.findFirst({
                orderBy: {
                    createdAt: 'desc',
                },
                select: {
                    code: true,
                },
            });

        let nextNumber = 1;

        if (lastSystem?.code) {
            nextNumber =
                parseInt(
                    lastSystem.code.replace(
                        'SYS-',
                        '',
                    ),
                ) + 1;
        }

        const code = `SYS-${String(
            nextNumber,
        ).padStart(4, '0')}`;

        const system = await this.prisma.system.create({
            data: {
                name: dto.name,
                code,
                description: dto.description,
                departmentId: dto.departmentId,
                organizationId,
                createdById,
            },
        });

        await this.prisma.activityLog.create({
            data: {
                organizationId,
                action: 'CREATED',
                entityType: 'SYSTEM',
                entityId: system.id,
                entityName: system.name,
                remarks: `System ${system.name} (${system.code}) was created.`,
                performedById: createdById,
            }
        });

        return system;
    }
    async getSystems(
        organizationId: string,
        search?: string,
        page = 1,
        limit = 10,
    ) {
        const where: any = {
            organizationId,
            status: true,
        };

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
                {
                    description: {
                        contains: search,
                        mode: 'insensitive',
                    },
                },
            ];
        }

        const [systems, total] =
            await Promise.all([
                this.prisma.system.findMany({
                    where,

                    include: {
                        department: {
                            select: {
                                id: true,
                                name: true,
                                code: true,
                            },
                        },

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

                    skip: (page - 1) * limit,
                    take: limit,

                    orderBy: {
                        createdAt: 'desc',
                    },
                }),

                this.prisma.system.count({
                    where,
                }),
            ]);

        return {
            data: systems,
            total,
            page,
            limit,
            totalPages: Math.ceil(
                total / limit,
            ),
        };
    }

    async getSystemById(
        id: string,
        organizationId: string,
    ) {
        const system =
            await this.prisma.system.findFirst({
                where: {
                    id,
                    organizationId,
                    status: true,
                },

                include: {
                    department: true,
                    createdBy: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                            role: { select: { name: true } },
                        },
                    },
                },
            });

        if (!system) {
            throw new NotFoundException(
                'System not found',
            );
        }

        return system;
    }

    async updateSystem(
        id: string,
        organizationId: string,
        dto: UpdateSystemDto,
        userRole: string,
        userId: string,
    ) {
        const system =
            await this.prisma.system.findFirst({
                where: {
                    id,
                    organizationId,
                },
                include: {
                    createdBy: {
                        select: {
                            role: { select: { name: true } },
                        },
                    },
                },
            });

        if (!system) {
            throw new NotFoundException(
                'System not found',
            );
        }

        this.checkModifyPermission(system, userRole, 'System');

        const updated = await this.prisma.system.update({
            where: {
                id,
            },
            data: {
                ...dto,
            },
        });

        await this.prisma.activityLog.create({
            data: {
                organizationId,
                action: 'UPDATED',
                entityType: 'SYSTEM',
                entityId: updated.id,
                entityName: updated.name,
                remarks: `System ${updated.name} details were updated.`,
                performedById: userId,
            }
        });

        return updated;
    }

    async deleteSystem(
        id: string,
        organizationId: string,
        userRole: string,
        userId: string,
    ) {
        const system =
            await this.prisma.system.findFirst({
                where: {
                    id,
                    organizationId,
                },
                include: {
                    createdBy: {
                        select: {
                            role: { select: { name: true } },
                        },
                    },
                },
            });

        if (!system) {
            throw new NotFoundException(
                'System not found',
            );
        }

        this.checkModifyPermission(system, userRole, 'System');

        const deleted = await this.prisma.system.update({
            where: {
                id,
            },
            data: {
                status: false,
            },
        });

        await this.prisma.activityLog.create({
            data: {
                organizationId,
                action: 'DELETED',
                entityType: 'SYSTEM',
                entityId: deleted.id,
                entityName: deleted.name,
                remarks: `System ${deleted.name} was deleted.`,
                performedById: userId,
            }
        });

        return deleted;
    }

    // ── Image Upload Methods ────────────────────────────────────────────────

    async uploadCustomerImage(id: string, organizationId: string, imageUrl: string) {
        const customer = await this.prisma.customer.findFirst({ where: { id, organizationId } }) as any;
        if (!customer) throw new NotFoundException('Customer not found');
        if (customer.imageUrl) {
            await this.azureService.deleteFile(customer.imageUrl).catch(() => null);
        }
        return this.prisma.customer.update({ where: { id }, data: { imageUrl } as any });
    }

    async getCustomerImageStream(id: string) {
        const customer = await this.prisma.customer.findFirst({ where: { id } }) as any;
        if (!customer?.imageUrl) throw new NotFoundException('Customer image not found');
        return this.azureService.downloadFile(customer.imageUrl as string);
    }

    async uploadSiteImage(id: string, organizationId: string, imageUrl: string) {
        const site = await this.prisma.site.findFirst({ where: { id, organizationId } }) as any;
        if (!site) throw new NotFoundException('Site not found');
        if (site.imageUrl) {
            await this.azureService.deleteFile(site.imageUrl as string).catch(() => null);
        }
        return this.prisma.site.update({ where: { id }, data: { imageUrl } as any });
    }

    async getSiteImageStream(id: string) {
        const site = await this.prisma.site.findFirst({ where: { id } }) as any;
        if (!site?.imageUrl) throw new NotFoundException('Site image not found');
        return this.azureService.downloadFile(site.imageUrl as string);
    }

    async uploadSystemImage(id: string, organizationId: string, imageUrl: string) {
        const system = await this.prisma.system.findFirst({ where: { id, organizationId } }) as any;
        if (!system) throw new NotFoundException('System not found');
        if (system.imageUrl) {
            await this.azureService.deleteFile(system.imageUrl as string).catch(() => null);
        }
        return this.prisma.system.update({ where: { id }, data: { imageUrl } as any });
    }

    async getSystemImageStream(id: string) {
        const system = await this.prisma.system.findFirst({ where: { id } }) as any;
        if (!system?.imageUrl) throw new NotFoundException('System image not found');
        return this.azureService.downloadFile(system.imageUrl as string);
    }

    // ── User Assignment Helpers ─────────────────────────────────────────────────

    async getUsersForAssignment(
        organizationId: string,
        roles: string[],
    ) {
        return this.prisma.user.findMany({
            where: {
                organizationId,
                role: {
                    name: { in: roles },
                },
            },
            select: {
                id: true,
                fullName: true,
                email: true,
                role: { select: { name: true } },
            },
            orderBy: { fullName: 'asc' },
        });
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
            const isManagerCreator = creatorRole === 'CUSTOMER_MANAGER' || creatorRole === 'MAINTENANCE_MANAGER';
            const isManagerUser = userRole === 'CUSTOMER_MANAGER' || userRole === 'MAINTENANCE_MANAGER';

            if (creatorRole === 'ADMIN' && isManagerUser) {
                throw new BadRequestException(`Cannot modify ${entityName} created by an Admin`);
            }
            if (
                (creatorRole === 'ADMIN' || isManagerCreator) &&
                userRole === 'SITE_INCHARGE'
            ) {
                throw new BadRequestException(`Cannot modify ${entityName} created by an Admin or Customer Manager`);
            }
            if (
                (creatorRole === 'ADMIN' || isManagerCreator || creatorRole === 'SITE_INCHARGE') &&
                userRole === 'SUPERVISOR'
            ) {
                throw new BadRequestException(`Cannot modify ${entityName} created by an Admin, Customer Manager or Site In-Charge`);
            }
        }
    }

}
