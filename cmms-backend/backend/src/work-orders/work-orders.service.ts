import {
    Injectable,
    BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateWorkOrderStatusDto } from './dto/update-status.dto';
import { WorkOrderGateway } from './work-order.gateway'
import { NotFoundException } from '@nestjs/common';
import { AzureService } from '../azure/azure.service';

@Injectable()
export class WorkOrdersService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly gateway: WorkOrderGateway,
        private readonly azureService: AzureService,
    ) { }

    async createWorkOrder(
        dto: CreateWorkOrderDto,
        organizationId: string,
        createdById: string,
    ) {
        if (dto.assetId) {
            const asset = await this.prisma.asset.findFirst({
                where: {
                    id: dto.assetId,
                    organizationId,
                },
            });

            if (!asset) {
                throw new BadRequestException(
                    'Asset not found',
                );
            }
            if (dto.checklistTemplateId) {
                const checklistTemplate =
                    await this.prisma.checklistTemplate.findFirst({
                        where: {
                            id: dto.checklistTemplateId,
                            organizationId,
                        },
                    });

                if (!checklistTemplate) {
                    throw new BadRequestException(
                        'Checklist Template not found',
                    );
                }
            }
        }

        // workOrderNumber has a global @unique constraint in the schema,
        // so we find the globally latest number (not per-org) to avoid
        // unique constraint collisions when a new org creates its first work order.
        const lastWorkOrder = await this.prisma.workOrder.findFirst({
            orderBy: { workOrderNumber: 'desc' },
            select: { workOrderNumber: true },
        });

        let nextWONumber = 1;
        if (lastWorkOrder?.workOrderNumber) {
            const match = lastWorkOrder.workOrderNumber.match(/WO-(\d+)/);
            if (match) {
                nextWONumber = parseInt(match[1], 10) + 1;
            }
        }

        const workOrderNumber = `WO-${String(nextWONumber).padStart(4, '0')}`;

        const workOrder =
            await this.prisma.workOrder.create({
                data: {
                    workOrderNumber,

                    title: dto.title,
                    description: dto.description,

                    location: dto.location,

                    category: dto.category,

                    priority: dto.priority,
                    workType: dto.workType,

                    assignedTechnicianId:
                        dto.assignedTechnicianId,

                    checklistTemplateId:
                        dto.checklistTemplateId,

                    estimatedHours:
                        dto.estimatedHours,

                    startDate: dto.startDate
                        ? new Date(dto.startDate)
                        : undefined,

                    dueDate: dto.dueDate
                        ? new Date(dto.dueDate)
                        : undefined,

                    organizationId,
                    assetId: dto.assetId,
                    createdById,
                },

                include: {
                    asset: true,
                    checklistTemplate: {
                        include: {
                            items: true,
                        },
                    },

                    createdBy: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                        },
                    },
                },
            });

        await this.prisma.workOrderActivity.create({
            data: {
                workOrderId: workOrder.id,

                action: 'WORK_ORDER_CREATED',

                remarks: 'Work Order Created',

                performedById: createdById,
            },
        });

        return {
            message:
                'Work Order Created Successfully',
            workOrder,
        };
    }

    async getWorkOrders(
        organizationId: string,
        userId: string,
        role: string,
        query: {
            page: number;
            limit: number;
            search?: string;
            status?: string;
            priority?: string;
        },
    ) {
        const {
            page,
            limit,
            search,
            status,
            priority,
        } = query;

        const skip = (page - 1) * limit;

        const whereClause: any = {
            organizationId,
        };

        if (role === 'TECHNICIAN') {
            whereClause.assignedTechnicianId =
                userId;
        }

        if (search) {
            whereClause.OR = [
                {
                    workOrderNumber: {
                        contains: search,
                        mode: 'insensitive',
                    },
                },
                {
                    title: {
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
                {
                    location: {
                        contains: search,
                        mode: 'insensitive',
                    },
                },
            ];
        }

        if (status) {
            whereClause.status = status;
        }

        if (priority) {
            whereClause.priority = priority;
        }

        const total =
            await this.prisma.workOrder.count({
                where: whereClause,
            });

        const workOrders =
            await this.prisma.workOrder.findMany({
                where: whereClause,

                include: {
                    asset: true,

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

                skip,
                take: limit,
            });

        return {
            message:
                'Work Orders Fetched Successfully',

            count: total,

            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(
                    total / limit,
                ),
            },

            workOrders,
        };
    }

    async getWorkOrderById(
        id: string,
        organizationId: string,
        userId: string,
        role: string,
    ) {
        const workOrder =
            await this.prisma.workOrder.findFirst({
                where: {
                    id,
                    organizationId,
                },

                include: {
                    asset: true,

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

                    checklistTemplate: {
                        include: {
                            items: true,
                        },
                    },

                    activities: {
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
                    },

                    comments: {
                        include: {
                            createdBy: {
                                select: {
                                    id: true,
                                    fullName: true,
                                },
                            },
                        },

                        orderBy: {
                            createdAt: 'desc',
                        },
                    },

                    attachments: {
                        orderBy: {
                            createdAt: 'desc',
                        },
                    },
                },
            });

        if (!workOrder) {
            throw new BadRequestException(
                'Work Order Not Found',
            );
        }

        if (
            role === 'TECHNICIAN' &&
            workOrder.assignedTechnicianId !== userId
        ) {
            throw new BadRequestException(
                'Access Denied',
            );
        }

        return {
            message:
                'Work Order Fetched Successfully',
            workOrder,
        };
    }

    async updateWorkOrder(
        id: string,
        dto: UpdateWorkOrderDto,
        organizationId: string,
        updatedById: string,
    ) {
        const workOrder =
            await this.prisma.workOrder.findFirst({
                where: {
                    id,
                    organizationId,
                },
            });

        if (!workOrder) {
            throw new BadRequestException(
                'Work Order Not Found',
            );
        }

        if (dto.assetId) {
            const asset = await this.prisma.asset.findFirst({
                where: {
                    id: dto.assetId,
                    organizationId,
                },
            });

            if (!asset) {
                throw new BadRequestException(
                    'Asset not found',
                );
            }
        }

        const updatedWorkOrder =
            await this.prisma.workOrder.update({
                where: {
                    id,
                },

                data: {
                    title: dto.title,
                    description: dto.description,
                    assetId: dto.assetId,
                    location: dto.location,
                    category: dto.category,
                    priority: dto.priority,
                    workType: dto.workType,
                    assignedTechnicianId:
                        dto.assignedTechnicianId,
                    estimatedHours:
                        dto.estimatedHours,
                    checklistTemplateId:
                        dto.checklistTemplateId,

                    startDate: dto.startDate
                        ? new Date(dto.startDate)
                        : undefined,

                    dueDate: dto.dueDate
                        ? new Date(dto.dueDate)
                        : undefined,
                },
            });

        await this.prisma.workOrderActivity.create({
            data: {
                workOrderId: id,

                action: 'WORK_ORDER_UPDATED',

                remarks:
                    'Work Order Details Updated',

                performedById: updatedById,
            },
        });

        return {
            message:
                'Work Order Updated Successfully',
            workOrder: updatedWorkOrder,
        };
    }

    async deleteWorkOrder(
        id: string,
        organizationId: string,
    ) {
        const workOrder =
            await this.prisma.workOrder.findFirst({
                where: {
                    id,
                    organizationId,
                },
            });

        if (!workOrder) {
            throw new BadRequestException(
                'Work Order Not Found',
            );
        }

        await this.prisma.$transaction([
            this.prisma.workOrderComment.deleteMany({
                where: {
                    workOrderId: id,
                },
            }),
            this.prisma.workOrderActivity.deleteMany({
                where: {
                    workOrderId: id,
                },
            }),
            this.prisma.workOrder.delete({
                where: {
                    id,
                },
            }),
        ]);

        return {
            message:
                'Work Order Deleted Successfully',
        };
    }

    async assignTechnician(
        workOrderId: string,
        technicianId: string,
        organizationId: string,
        assignedById: string,
    ) {
        const workOrder =
            await this.prisma.workOrder.findFirst({
                where: {
                    id: workOrderId,
                    organizationId,
                },
            });

        if (!workOrder) {
            throw new BadRequestException(
                'Work Order Not Found',
            );
        }

        const technician =
            await this.prisma.user.findFirst({
                where: {
                    id: technicianId,
                    organizationId,
                },
                include: {
                    role: true,
                },
            });

        if (!technician) {
            throw new BadRequestException(
                'Technician Not Found',
            );
        }

        if (technician.role.name !== 'TECHNICIAN') {
            throw new BadRequestException(
                'Selected user is not a technician',
            );
        }

        const updatedWorkOrder =
            await this.prisma.workOrder.update({
                where: {
                    id: workOrderId,
                },
                data: {
                    assignedTechnicianId: technicianId,
                    status: 'ASSIGNED',
                },
                include: {
                    assignedTechnician: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                        },
                    },
                },
            });

        await this.prisma.workOrderActivity.create({
            data: {
                workOrderId,

                action: 'TECHNICIAN_ASSIGNED',

                remarks: `Assigned to ${technician.fullName}`,

                performedById: assignedById,
            },
        });

        return {
            message:
                'Technician Assigned Successfully',
            workOrder: updatedWorkOrder,
        };
    }
    async acceptWorkOrder(
        workOrderId: string,
        technicianId: string,
        organizationId: string,
    ) {
        const workOrder =
            await this.prisma.workOrder.findFirst({
                where: {
                    id: workOrderId,
                    organizationId,
                },
            });

        if (!workOrder) {
            throw new BadRequestException(
                'Work Order Not Found',
            );
        }

        if (
            workOrder.assignedTechnicianId !==
            technicianId
        ) {
            throw new BadRequestException(
                'You are not assigned to this Work Order',
            );
        }

        if (
            workOrder.status !== 'ASSIGNED'
        ) {
            throw new BadRequestException(
                'Only Assigned Work Orders can be Accepted',
            );
        }

        const updatedWorkOrder =
            await this.prisma.workOrder.update({
                where: {
                    id: workOrderId,
                },
                data: {
                    status: 'ACCEPTED',
                },
            });

        await this.prisma.workOrderActivity.create({
            data: {
                workOrderId,

                action: 'WORK_ORDER_ACCEPTED',

                remarks:
                    'Work Order Accepted by Technician',

                performedById: technicianId,
            },
        });

        return {
            message:
                'Work Order Accepted Successfully',
            workOrder: updatedWorkOrder,
        };
    }
    async rejectWorkOrder(
        workOrderId: string,
        reason: string,
        technicianId: string,
        organizationId: string,
    ) {
        const workOrder =
            await this.prisma.workOrder.findFirst({
                where: {
                    id: workOrderId,
                    organizationId,
                },
            });

        if (!workOrder) {
            throw new BadRequestException(
                'Work Order Not Found',
            );
        }

        if (
            workOrder.assignedTechnicianId !==
            technicianId
        ) {
            throw new BadRequestException(
                'You are not assigned to this Work Order',
            );
        }

        if (
            workOrder.status !== 'ASSIGNED'
        ) {
            throw new BadRequestException(
                'Only Assigned Work Orders can be Rejected',
            );
        }

        const updatedWorkOrder =
            await this.prisma.workOrder.update({
                where: {
                    id: workOrderId,
                },
                data: {
                    status: 'REJECTED',
                    assignedTechnicianId: null,
                },
            });

        await this.prisma.workOrderActivity.create({
            data: {
                workOrderId,

                action: 'WORK_ORDER_REJECTED',

                remarks: reason,

                performedById: technicianId,
            },
        });

        return {
            message:
                'Work Order Rejected Successfully',
            workOrder: updatedWorkOrder,
        };
    }
    async updateWorkOrderStatus(
        workOrderId: string,
        dto: UpdateWorkOrderStatusDto,
        technicianId: string,
        organizationId: string,
    ) {
        const workOrder =
            await this.prisma.workOrder.findFirst({
                where: {
                    id: workOrderId,
                    organizationId,
                },
            });

        if (!workOrder) {
            throw new BadRequestException(
                'Work Order Not Found',
            );
        }

        if (
            workOrder.assignedTechnicianId !==
            technicianId
        ) {
            throw new BadRequestException(
                'You are not assigned to this Work Order',
            );
        }

        const allowedTransitions = {
            ACCEPTED: ['IN_PROGRESS'],
            IN_PROGRESS: ['ON_HOLD', 'COMPLETED'],
            ON_HOLD: ['IN_PROGRESS'],
            REOPENED: ['IN_PROGRESS'],
        };

        const currentStatus = workOrder.status;
        const nextStatus = dto.status;

        const validStatuses =
            allowedTransitions[
            currentStatus as keyof typeof allowedTransitions
            ] || [];

        if (
            !validStatuses.includes(nextStatus)
        ) {
            throw new BadRequestException(
                `Cannot change status from ${currentStatus} to ${nextStatus}`,
            );
        }

        // ON HOLD validation
        if (
            nextStatus === 'ON_HOLD' &&
            !dto.reason
        ) {
            throw new BadRequestException(
                'Reason is required when putting a Work Order on Hold',
            );
        }

        // COMPLETED validation
        if (
            nextStatus === 'COMPLETED' &&
            (
                !dto.actualHours ||
                !dto.resolutionNotes
            )
        ) {
            throw new BadRequestException(
                'actualHours and resolutionNotes are required when completing a Work Order',
            );
        }

        const updateData: any = {
            status: nextStatus,
        };

        // Set only first time
        if (
            nextStatus === 'IN_PROGRESS' &&
            !workOrder.breakdownStartedAt
        ) {
            updateData.breakdownStartedAt =
                new Date();
        }

        if (
            nextStatus === 'COMPLETED'
        ) {
            updateData.assetRestoredAt =
                new Date();

            updateData.actualHours =
                dto.actualHours;

            updateData.resolutionNotes =
                dto.resolutionNotes;
        }

        const updatedWorkOrder =
            await this.prisma.workOrder.update({
                where: {
                    id: workOrderId,
                },
                data: updateData,
            });

        let remarks =
            `Status changed from ${currentStatus} to ${nextStatus}`;

        if (dto.reason) {
            remarks += ` | Reason: ${dto.reason}`;
        }

        await this.prisma.workOrderActivity.create({
            data: {
                workOrderId,

                action: 'STATUS_CHANGED',

                remarks,

                performedById:
                    technicianId,
            },
        });

        return {
            message:
                'Work Order Status Updated Successfully',
            workOrder:
                updatedWorkOrder,
        };
    }
    async addComment(
        workOrderId: string,
        comment: string,
        userId: string,
        organizationId: string,
    ) {
        const workOrder =
            await this.prisma.workOrder.findFirst({
                where: {
                    id: workOrderId,
                    organizationId,
                },
            });

        if (!workOrder) {
            throw new BadRequestException(
                'Work Order Not Found',
            );
        }

        const workOrderComment =
            await this.prisma.workOrderComment.create({
                data: {
                    workOrderId,
                    comment,
                    createdById: userId,
                },

                include: {
                    createdBy: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                        },
                    },
                },
            });

        await this.prisma.workOrderActivity.create({
            data: {
                workOrderId,

                action: 'COMMENT_ADDED',

                remarks: comment,

                performedById: userId,
            },
        });

        this.gateway.server
            .to(workOrderId)
            .emit(
                'new-comment',
                workOrderComment,
            );

        console.log(
            'Socket Event Sent:',
            workOrderComment.id,
        );

        return {
            message:
                'Comment Added Successfully',
            comment: workOrderComment,
        };
    }
    async getComments(
        workOrderId: string,
        organizationId: string,
    ) {
        const workOrder =
            await this.prisma.workOrder.findFirst({
                where: {
                    id: workOrderId,
                    organizationId,
                },
            });

        if (!workOrder) {
            throw new BadRequestException(
                'Work Order Not Found',
            );
        }

        const comments =
            await this.prisma.workOrderComment.findMany({
                where: {
                    workOrderId,
                },

                include: {
                    createdBy: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                        },
                    },
                },

                orderBy: {
                    createdAt: 'asc',
                },
            });

        return {
            comments,
        };
    }
    async uploadAttachment(
        workOrderId: string,
        organizationId: string,
        uploadedById: string,
        file: Express.Multer.File,
        attachmentType?: string,
    ) {
        const workOrder =
            await this.prisma.workOrder.findFirst({
                where: {
                    id: workOrderId,
                    organizationId,
                },
            });

        if (!workOrder) {
            throw new NotFoundException(
                'Work Order not found',
            );
        }

        if (attachmentType) {
            const existingAttachment = await this.prisma.workOrderAttachment.findFirst({
                where: {
                    workOrderId,
                    attachmentType,
                },
            });

            if (existingAttachment) {
                // Delete old file from Azure
                try {
                    await this.azureService.deleteFile(existingAttachment.fileUrl);
                } catch (err) {
                    console.error('Failed to delete old file from Azure storage:', err);
                }

                // Delete old database record
                await this.prisma.workOrderAttachment.delete({
                    where: {
                        id: existingAttachment.id,
                    },
                });
            }
        }

        const fileUrl =
            await this.azureService.uploadFile(
                file,
                'work-orders',
            );

        return this.prisma.workOrderAttachment.create({
            data: {
                workOrderId,

                fileName: file.originalname,

                fileUrl,

                fileType: file.mimetype,

                attachmentType,

                uploadedById,
            },
        });
    }
    async getAttachments(
        workOrderId: string,
        organizationId: string,
    ) {
        return this.prisma.workOrderAttachment.findMany({
            where: {
                workOrderId,

                workOrder: {
                    organizationId,
                },
            },

            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async getAttachmentFileStream(attachmentId: string) {
        const attachment = await this.prisma.workOrderAttachment.findFirst({
            where: {
                id: attachmentId,
            },
        });

        if (!attachment || !attachment.fileUrl) {
            throw new NotFoundException(
                'Attachment file not found',
            );
        }

        try {
            return await this.azureService.downloadFile(
                attachment.fileUrl,
            );
        } catch (error) {
            throw new BadRequestException(
                'Failed to retrieve file from storage',
            );
        }
    }
}
