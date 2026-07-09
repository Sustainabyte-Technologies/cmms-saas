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

import { WorkOrderChatService } from '../work-order-chat/work-order-chat.service';

@Injectable()
export class WorkOrdersService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly gateway: WorkOrderGateway,
        private readonly azureService: AzureService,
        private readonly chatService: WorkOrderChatService,
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
                            role: {
                                select: {
                                    name: true,
                                },
                            },
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

        await this.prisma.activityLog.create({
            data: {
                organizationId,
                action: 'CREATED',
                entityType: 'WORK_ORDER',
                entityId: workOrder.id,
                entityName: workOrder.workOrderNumber,
                remarks: `Work order ${workOrder.workOrderNumber} was created.`,
                performedById: createdById,
            },
        });

        // Publish Work Order Chat system notifications
        await this.chatService.publishSystemMessage(workOrder.id, 'Work Order Created', organizationId);
        if (workOrder.checklistTemplate) {
            await this.chatService.publishSystemMessage(workOrder.id, `Checklist Template Assigned: ${workOrder.checklistTemplate.name}`, organizationId);
        }
        if (dto.assignedTechnicianId) {
            const tech = await this.prisma.user.findUnique({ where: { id: dto.assignedTechnicianId } });
            if (tech) {
                await this.chatService.publishSystemMessage(workOrder.id, `Technician Assigned: ${tech.fullName}`, organizationId);
            }
        }

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
                whereClause.asset = {
                    siteId: site.id,
                };
            } else {
                whereClause.id = 'none';
            }
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
            if (status === 'UNDER_REVIEW') {
                whereClause.status = {
                    in: ['UNDER_REVIEW', 'COMPLETED'],
                };
            } else if (status === 'COMPLETED' || status === 'CLOSED') {
                whereClause.status = 'CLOSED';
            } else {
                whereClause.status = status;
            }
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

                    attachments: {
                        select: {
                            id: true,
                            fileName: true,
                            fileUrl: true,
                            fileType: true,
                            attachmentType: true,
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
                            role: {
                                select: {
                                    name: true,
                                },
                            },
                        },
                    },

                    assignedTechnician: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                        },
                    },

                    reviewedBy: {
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

        if (role === 'SITE_INCHARGE') {
            const site = await this.prisma.site.findFirst({
                where: {
                    assignedSupervisorId: userId,
                    organizationId,
                    status: true,
                },
                select: { id: true },
            });
            if (!site || workOrder.asset?.siteId !== site.id) {
                throw new BadRequestException(
                    'Access Denied',
                );
            }
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
        userRole: string,
    ) {
        const workOrder =
            await this.prisma.workOrder.findFirst({
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

        if (!workOrder) {
            throw new BadRequestException(
                'Work Order Not Found',
            );
        }

        this.checkModifyPermission(workOrder, userRole, 'Work Order');

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

        await this.prisma.activityLog.create({
            data: {
                organizationId,
                action: 'UPDATED',
                entityType: 'WORK_ORDER',
                entityId: id,
                entityName: updatedWorkOrder.workOrderNumber,
                remarks: `Work order ${updatedWorkOrder.workOrderNumber} details were updated.`,
                performedById: updatedById,
            },
        });

        // Publish Work Order Chat system updates for changed fields
        if (dto.priority && dto.priority !== workOrder.priority) {
            await this.chatService.publishSystemMessage(
                id,
                `Priority Updated: ${workOrder.priority.charAt(0) + workOrder.priority.slice(1).toLowerCase()} -> ${dto.priority.charAt(0) + dto.priority.slice(1).toLowerCase()}`,
                organizationId
            );
        }

        if (dto.dueDate && new Date(dto.dueDate).getTime() !== workOrder.dueDate?.getTime()) {
            const oldDateStr = workOrder.dueDate ? new Date(workOrder.dueDate).toLocaleDateString() : 'None';
            const newDateStr = new Date(dto.dueDate).toLocaleDateString();
            await this.chatService.publishSystemMessage(
                id,
                `Due Date Changed: ${oldDateStr} -> ${newDateStr}`,
                organizationId
            );
        }

        if (dto.estimatedHours !== undefined && dto.estimatedHours !== workOrder.estimatedHours) {
            await this.chatService.publishSystemMessage(
                id,
                `Estimated Hours Updated: ${workOrder.estimatedHours || 0} -> ${dto.estimatedHours || 0}`,
                organizationId
            );
        }

        if (dto.assignedTechnicianId !== undefined && dto.assignedTechnicianId !== workOrder.assignedTechnicianId) {
            if (dto.assignedTechnicianId) {
                const tech = await this.prisma.user.findUnique({ where: { id: dto.assignedTechnicianId } });
                if (tech) {
                    await this.chatService.publishSystemMessage(id, `Technician Assigned: ${tech.fullName}`, organizationId);
                }
            } else {
                await this.chatService.publishSystemMessage(id, `Technician Unassigned`, organizationId);
            }
        }

        if (dto.checklistTemplateId !== undefined && dto.checklistTemplateId !== workOrder.checklistTemplateId) {
            if (dto.checklistTemplateId) {
                const template = await this.prisma.checklistTemplate.findUnique({ where: { id: dto.checklistTemplateId } });
                if (template) {
                    await this.chatService.publishSystemMessage(id, `Checklist Template Assigned: ${template.name}`, organizationId);
                }
            } else {
                await this.chatService.publishSystemMessage(id, `Checklist Template Removed`, organizationId);
            }
        }

        return {
            message:
                'Work Order Updated Successfully',
            workOrder: updatedWorkOrder,
        };
    }

    async deleteWorkOrder(
        id: string,
        organizationId: string,
        userRole: string,
        deletedById: string,
    ) {
        const workOrder =
            await this.prisma.workOrder.findFirst({
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

        if (!workOrder) {
            throw new BadRequestException(
                'Work Order Not Found',
            );
        }

        this.checkModifyPermission(workOrder, userRole, 'Work Order');

        await this.prisma.activityLog.create({
            data: {
                organizationId,
                action: 'DELETED',
                entityType: 'WORK_ORDER',
                entityId: id,
                entityName: workOrder.workOrderNumber,
                remarks: `Work order ${workOrder.workOrderNumber} was deleted.`,
                performedById: deletedById,
            },
        });

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
                    startDate: null,
                    breakdownStartedAt: null,
                    assetRestoredAt: null,
                    actualHours: null,
                    resolutionNotes: null,
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

        await this.prisma.activityLog.create({
            data: {
                organizationId,
                action: 'ASSIGNED',
                entityType: 'WORK_ORDER',
                entityId: workOrderId,
                entityName: workOrder.workOrderNumber,
                remarks: `Work order ${workOrder.workOrderNumber} was assigned to ${technician.fullName}.`,
                performedById: assignedById,
            },
        });

        await this.chatService.publishSystemMessage(workOrderId, `Technician Assigned: ${technician.fullName}`, organizationId);

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
                    status: 'IN_PROGRESS',
                    startDate: new Date(),
                    breakdownStartedAt: new Date(),
                },
            });

        await this.prisma.workOrderActivity.create({
            data: {
                workOrderId,

                action: 'STATUS_CHANGED',

                remarks:
                    'Work Order Accepted - Time Started',

                performedById: technicianId,
            },
        });

        await this.prisma.activityLog.create({
            data: {
                organizationId,
                action: 'ACCEPTED',
                entityType: 'WORK_ORDER',
                entityId: workOrderId,
                entityName: workOrder.workOrderNumber,
                remarks: `Work order ${workOrder.workOrderNumber} was accepted by technician. Timer started.`,
                performedById: technicianId,
            },
        });

        await this.chatService.publishSystemMessage(workOrderId, `Work Order Accepted - Time Started`, organizationId);

        this.gateway.server.emit('work-order-status-updated', {
            workOrderId,
            status: 'IN_PROGRESS',
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

        await this.prisma.activityLog.create({
            data: {
                organizationId,
                action: 'REJECTED',
                entityType: 'WORK_ORDER',
                entityId: workOrderId,
                entityName: workOrder.workOrderNumber,
                remarks: `Work order ${workOrder.workOrderNumber} was rejected by technician. Reason: ${reason}`,
                performedById: technicianId,
            },
        });

        await this.chatService.publishSystemMessage(workOrderId, `Work Order Rejected by Technician. Reason: ${reason}`, organizationId);

        this.gateway.server.emit('work-order-status-updated', {
            workOrderId,
            status: 'REJECTED',
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
            IN_PROGRESS: ['ON_HOLD', 'COMPLETED', 'UNDER_REVIEW'],
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

        const targetStatus = nextStatus === 'COMPLETED' ? 'UNDER_REVIEW' : nextStatus;

        const updateData: any = {
            status: targetStatus,
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
            `Status changed from ${currentStatus} to ${targetStatus}`;
        let activityAction = 'STATUS_CHANGED';

        if (nextStatus === 'COMPLETED') {
            activityAction = 'WORK_ORDER_SUBMITTED_FOR_REVIEW';
            remarks = 'Work Order Submitted for Review';
        } else if (dto.reason) {
            remarks += ` | Reason: ${dto.reason}`;
        }

        await this.prisma.workOrderActivity.create({
            data: {
                workOrderId,
                action: activityAction,
                remarks,
                performedById: technicianId,
            },
        });

        await this.prisma.activityLog.create({
            data: {
                organizationId,
                action: nextStatus === 'COMPLETED' ? 'COMPLETED' : 'UPDATED',
                entityType: 'WORK_ORDER',
                entityId: workOrderId,
                entityName: workOrder.workOrderNumber,
                remarks: nextStatus === 'COMPLETED'
                    ? `Work order ${workOrder.workOrderNumber} was submitted for supervisor review.`
                    : `Work order ${workOrder.workOrderNumber} status changed from ${currentStatus} to ${nextStatus}.${dto.reason ? ' Reason: ' + dto.reason : ''}`,
                performedById: technicianId,
            },
        });

        // Publish Work Order Chat system notifications
        if (nextStatus === 'COMPLETED') {
            await this.chatService.publishSystemMessage(workOrderId, `Checklist Completed`, organizationId);
            await this.chatService.publishSystemMessage(workOrderId, `Actual Hours Updated: ${dto.actualHours}`, organizationId);
            await this.chatService.publishSystemMessage(workOrderId, `Work Order moved to UNDER REVIEW.`, organizationId);
            await this.chatService.publishSystemMessage(workOrderId, `Technician has submitted Work Order ${workOrder.workOrderNumber} for review.`, organizationId);
        } else {
            await this.chatService.publishSystemMessage(workOrderId, `Status Updated: ${currentStatus} -> ${nextStatus}`, organizationId);
        }

        if (nextStatus === 'CLOSED') {
            await this.chatService.publishSystemMessage(workOrderId, `Work Order Closed`, organizationId);
        }

        this.gateway.server.emit('work-order-status-updated', {
            workOrderId,
            status: targetStatus,
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

        await this.prisma.activityLog.create({
            data: {
                organizationId,
                action: 'UPDATED',
                entityType: 'WORK_ORDER',
                entityId: workOrderId,
                entityName: workOrder.workOrderNumber,
                remarks: `Added a comment on work order ${workOrder.workOrderNumber}: ${comment}`,
                performedById: userId,
            },
        });

        await this.chatService.publishSystemMessage(workOrderId, `Comment Added: "${comment}"`, organizationId);

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

        const attachment = await this.prisma.workOrderAttachment.create({
            data: {
                workOrderId,
                fileName: file.originalname,
                fileUrl,
                fileType: file.mimetype,
                attachmentType,
                uploadedById,
            },
        });

        await this.chatService.publishSystemMessage(workOrderId, `Attachment Uploaded: ${file.originalname}`, organizationId);

        return attachment;
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

    private async getWorkOrderFilter(
        organizationId: string,
        role: string,
        userId: string,
    ): Promise<any> {
        const whereClause: any = {
            organizationId,
        };

        if (role === 'TECHNICIAN') {
            whereClause.assignedTechnicianId = userId;
        }

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
                whereClause.asset = {
                    siteId: site.id,
                };
            } else {
                whereClause.id = 'none';
            }
        }

        return whereClause;
    }

    async getDashboardStats(
        organizationId: string,
        role: string,
        userId: string,
    ) {
        const where = await this.getWorkOrderFilter(organizationId, role, userId);

        const [open, assigned, inProgress, completed, closed, overdue, resolvedOrders] = await Promise.all([
            this.prisma.workOrder.count({
                where: { ...where, status: 'OPEN' },
            }),
            this.prisma.workOrder.count({
                where: { ...where, status: 'ASSIGNED' },
            }),
            this.prisma.workOrder.count({
                where: { ...where, status: 'IN_PROGRESS' },
            }),
            this.prisma.workOrder.count({
                where: { ...where, status: 'CLOSED' },
            }),
            this.prisma.workOrder.count({
                where: { ...where, status: 'CLOSED' },
            }),
            this.prisma.workOrder.count({
                where: {
                    ...where,
                    status: {
                        notIn: ['CLOSED', 'COMPLETED', 'UNDER_REVIEW'],
                    },
                    dueDate: {
                        lt: new Date(),
                    },
                },
            }),
            this.prisma.workOrder.findMany({
                where: {
                    ...where,
                    status: 'CLOSED',
                    assetRestoredAt: { not: null },
                    startDate: { not: null },
                },
                select: {
                    startDate: true,
                    assetRestoredAt: true,
                    createdAt: true,
                },
            }),
        ]);

        let totalHours = 0;
        resolvedOrders.forEach((wo) => {
            const start = wo.startDate || wo.createdAt;
            const end = wo.assetRestoredAt;
            if (start && end) {
                const diffMs = end.getTime() - start.getTime();
                totalHours += diffMs / (1000 * 60 * 60);
            }
        });

        const avg = resolvedOrders.length > 0 ? (totalHours / resolvedOrders.length).toFixed(1) : '0.0';
        const avgTime = `${avg} hrs`;

        return {
            open,
            assigned,
            inProgress,
            completed,
            closed,
            overdue,
            avgTime,
        };
    }

    async getDashboardPriority(
        organizationId: string,
        role: string,
        userId: string,
    ) {
        const where = await this.getWorkOrderFilter(organizationId, role, userId);

        const priorityCounts = await this.prisma.workOrder.groupBy({
            by: ['priority'],
            where: {
                ...where,
                status: {
                    notIn: ['COMPLETED', 'CLOSED'],
                },
            },
            _count: {
                id: true,
            },
        });

        const priorityColors: { [key: string]: string } = {
            CRITICAL: '#ef4444',
            HIGH: '#f59e0b',
            MEDIUM: '#3b82f6',
            LOW: '#10b981',
        };

        const result = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((p) => {
            const match = priorityCounts.find((pc) => pc.priority === p);
            const value = match ? match._count.id : 0;
            const name = p.charAt(0).toUpperCase() + p.slice(1).toLowerCase();
            return {
                name,
                value,
                color: priorityColors[p] || '#cccccc',
            };
        });

        return result;
    }

    async getDashboardProductivity(
        organizationId: string,
        role: string,
        userId: string,
    ) {
        const where = await this.getWorkOrderFilter(organizationId, role, userId);

        const technicians = await this.prisma.user.findMany({
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

        const result = await Promise.all(
            technicians.map(async (tech) => {
                const assigned = await this.prisma.workOrder.count({
                    where: {
                        ...where,
                        assignedTechnicianId: tech.id,
                    },
                });

                const completed = await this.prisma.workOrder.count({
                    where: {
                        ...where,
                        assignedTechnicianId: tech.id,
                        status: {
                            in: ['COMPLETED', 'CLOSED'],
                        },
                    },
                });

                return {
                    name: tech.fullName,
                    assigned,
                    completed,
                };
            }),
        );

        return result;
    }

    async getDashboardTrend(
        organizationId: string,
        role: string,
        userId: string,
    ) {
        const where = await this.getWorkOrderFilter(organizationId, role, userId);

        const days: Date[] = [];
        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            d.setHours(0, 0, 0, 0);
            days.push(d);
        }

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        thirtyDaysAgo.setHours(0, 0, 0, 0);

        const workOrders = await this.prisma.workOrder.findMany({
            where: {
                ...where,
                createdAt: {
                    gte: thirtyDaysAgo,
                },
            },
            select: {
                createdAt: true,
                status: true,
                dueDate: true,
                updatedAt: true,
                assetRestoredAt: true,
            },
        });

        return days.map((day) => {
            const nextDay = new Date(day);
            nextDay.setDate(nextDay.getDate() + 1);

            const created = workOrders.filter(
                (wo) => wo.createdAt >= day && wo.createdAt < nextDay,
            ).length;

            const completed = workOrders.filter((wo) => {
                const date = wo.assetRestoredAt || (['COMPLETED', 'CLOSED'].includes(wo.status) ? wo.updatedAt : null);
                return date && date >= day && date < nextDay;
            }).length;

            const overdue = workOrders.filter((wo) => {
                return (
                    wo.dueDate &&
                    wo.dueDate >= day &&
                    wo.dueDate < nextDay &&
                    !['COMPLETED', 'CLOSED'].includes(wo.status) &&
                    wo.dueDate < new Date()
                );
            }).length;

            const dateStr = day.toLocaleDateString('default', { month: 'short', day: 'numeric' });
            return {
                date: dateStr,
                created,
                completed,
                overdue,
            };
        });
    }

    async getDashboardCategories(
        organizationId: string,
        role: string,
        userId: string,
    ) {
        const where = await this.getWorkOrderFilter(organizationId, role, userId);

        const counts = await this.prisma.workOrder.groupBy({
            by: ['category'],
            where,
            _count: {
                id: true,
            },
        });

        const defaultCats = ['Electrical', 'Mechanical', 'HVAC', 'Civil', 'Fire', 'Utility'];
        return defaultCats.map((cat) => {
            const match = counts.find((c) => c.category?.toLowerCase() === cat.toLowerCase());
            return {
                category: cat,
                count: match ? match._count.id : 0,
            };
        });
    }

    async getDashboardSites(
        organizationId: string,
        role: string,
        userId: string,
    ) {
        const whereClause = await this.getWorkOrderFilter(organizationId, role, userId);

        const sites = await this.prisma.site.findMany({
            where: {
                organizationId,
                status: true,
            },
            select: {
                id: true,
                name: true,
            },
        });

        return Promise.all(
            sites.map(async (site) => {
                const open = await this.prisma.workOrder.count({
                    where: {
                        ...whereClause,
                        status: 'OPEN',
                        asset: {
                            siteId: site.id,
                        },
                    },
                });

                const completed = await this.prisma.workOrder.count({
                    where: {
                        ...whereClause,
                        status: {
                            in: ['COMPLETED', 'CLOSED'],
                        },
                        asset: {
                            siteId: site.id,
                        },
                    },
                });

                const overdue = await this.prisma.workOrder.count({
                    where: {
                        ...whereClause,
                        status: {
                            notIn: ['COMPLETED', 'CLOSED'],
                        },
                        dueDate: {
                            lt: new Date(),
                        },
                        asset: {
                            siteId: site.id,
                        },
                    },
                });

                return {
                    siteName: site.name,
                    open,
                    completed,
                    overdue,
                };
            }),
        );
    }

    async getDashboardWorkload(
        organizationId: string,
        role: string,
        userId: string,
    ) {
        const whereClause = await this.getWorkOrderFilter(organizationId, role, userId);

        const technicians = await this.prisma.user.findMany({
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

        return Promise.all(
            technicians.map(async (tech) => {
                const [assigned, completed, pending, resolvedOrders] = await Promise.all([
                    this.prisma.workOrder.count({
                        where: { ...whereClause, assignedTechnicianId: tech.id },
                    }),
                    this.prisma.workOrder.count({
                        where: {
                            ...whereClause,
                            assignedTechnicianId: tech.id,
                            status: { in: ['COMPLETED', 'CLOSED'] },
                        },
                    }),
                    this.prisma.workOrder.count({
                        where: {
                            ...whereClause,
                            assignedTechnicianId: tech.id,
                            status: { notIn: ['COMPLETED', 'CLOSED'] },
                        },
                    }),
                    this.prisma.workOrder.findMany({
                        where: {
                            ...whereClause,
                            assignedTechnicianId: tech.id,
                            status: { in: ['COMPLETED', 'CLOSED'] },
                            assetRestoredAt: { not: null },
                        },
                        select: {
                            createdAt: true,
                            startDate: true,
                            assetRestoredAt: true,
                        },
                    }),
                ]);

                let totalHours = 0;
                resolvedOrders.forEach((wo) => {
                    const start = wo.startDate || wo.createdAt;
                    const end = wo.assetRestoredAt;
                    if (start && end) {
                        totalHours += (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                    }
                });

                const avg = resolvedOrders.length > 0 ? (totalHours / resolvedOrders.length).toFixed(1) : '0.0';

                return {
                    technician: tech.fullName,
                    assigned,
                    completed,
                    pending,
                    avgTime: `${avg} hrs`,
                };
            }),
        );
    }

    async getDashboardSLA(
        organizationId: string,
        role: string,
        userId: string,
    ) {
        const whereClause = await this.getWorkOrderFilter(organizationId, role, userId);

        const workOrders = await this.prisma.workOrder.findMany({
            where: {
                ...whereClause,
                dueDate: { not: null },
            },
            select: {
                status: true,
                dueDate: true,
                assetRestoredAt: true,
                updatedAt: true,
            },
        });

        if (workOrders.length === 0) {
            return {
                withinSLA: 100,
                outsideSLA: 0,
            };
        }

        let withinCount = 0;
        workOrders.forEach((wo) => {
            const due = wo.dueDate;
            if (!due) return;

            if (['COMPLETED', 'CLOSED'].includes(wo.status)) {
                const completionDate = wo.assetRestoredAt || wo.updatedAt;
                if (completionDate <= due) {
                    withinCount++;
                }
            } else {
                if (due >= new Date()) {
                    withinCount++;
                }
            }
        });

        const withinSLAPercent = Math.round((withinCount / workOrders.length) * 100);
        const outsideSLAPercent = 100 - withinSLAPercent;

        return {
            withinSLA: withinSLAPercent,
            outsideSLA: outsideSLAPercent,
        };
    }

    async getDashboardRecent(
        organizationId: string,
        role: string,
        userId: string,
    ) {
        const whereClause = await this.getWorkOrderFilter(organizationId, role, userId);

        const recent = await this.prisma.workOrder.findMany({
            where: whereClause,
            select: {
                workOrderNumber: true,
                title: true,
                priority: true,
                status: true,
                dueDate: true,
                asset: {
                    select: {
                        assetName: true,
                    },
                },
                assignedTechnician: {
                    select: {
                        fullName: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 10,
        });

        return recent.map((wo) => ({
            workOrderNumber: wo.workOrderNumber,
            title: wo.title,
            priority: wo.priority,
            status: wo.status,
            dueDate: wo.dueDate,
            assetName: wo.asset?.assetName || 'N/A',
            technicianName: wo.assignedTechnician?.fullName || 'Unassigned',
        }));
    }

    async getDashboardCritical(
        organizationId: string,
        role: string,
        userId: string,
    ) {
        const whereClause = await this.getWorkOrderFilter(organizationId, role, userId);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const critical = await this.prisma.workOrder.findMany({
            where: {
                ...whereClause,
                priority: 'CRITICAL',
                status: {
                    notIn: ['COMPLETED', 'CLOSED'],
                },
                dueDate: {
                    lte: todayEnd,
                },
            },
            select: {
                id: true,
                workOrderNumber: true,
                title: true,
                priority: true,
                status: true,
                dueDate: true,
                asset: {
                    select: {
                        assetName: true,
                    },
                },
                assignedTechnician: {
                    select: {
                        fullName: true,
                    },
                },
            },
            orderBy: {
                dueDate: 'asc',
            },
        });

        return critical.map((wo) => ({
            id: wo.id,
            workOrderNumber: wo.workOrderNumber,
            title: wo.title,
            priority: wo.priority,
            status: wo.status,
            dueDate: wo.dueDate,
            assetName: wo.asset?.assetName || 'N/A',
            technicianName: wo.assignedTechnician?.fullName || 'Unassigned',
        }));
    }

    async getDashboardCompletionTime(
        organizationId: string,
        role: string,
        userId: string,
    ) {
        const whereClause = await this.getWorkOrderFilter(organizationId, role, userId);
        const now = new Date();

        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);

        const weekStart = new Date(now);
        const dayOfWeek = weekStart.getDay();
        const diff = weekStart.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        weekStart.setDate(diff);
        weekStart.setHours(0, 0, 0, 0);

        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        const completedOrders = await this.prisma.workOrder.findMany({
            where: {
                ...whereClause,
                status: { in: ['COMPLETED', 'CLOSED'] },
                assetRestoredAt: { gte: monthStart },
            },
            select: {
                startDate: true,
                createdAt: true,
                assetRestoredAt: true,
            },
        });

        const calcAvgHours = (orders: typeof completedOrders) => {
            if (orders.length === 0) return '0.0 hrs';
            let total = 0;
            orders.forEach((o) => {
                const start = o.startDate || o.createdAt;
                const end = o.assetRestoredAt;
                if (start && end) {
                    total += (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                }
            });
            return `${(total / orders.length).toFixed(1)} hrs`;
        };

        const todayOrders = completedOrders.filter(o => o.assetRestoredAt && o.assetRestoredAt >= todayStart);
        const weekOrders = completedOrders.filter(o => o.assetRestoredAt && o.assetRestoredAt >= weekStart);

        return {
            today: calcAvgHours(todayOrders),
            thisWeek: calcAvgHours(weekOrders),
            thisMonth: calcAvgHours(completedOrders),
        };
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
    async getMyWorkOrders(
        technicianId: string,
        organizationId: string,
    ) {
        const workOrders = await this.prisma.workOrder.findMany({
            where: {
                organizationId,
                assignedTechnicianId: technicianId,
            },
            include: {
                asset: {
                    select: {
                        id: true,
                        assetName: true,
                        location: true,
                        imageUrl: true,
                    },
                },
                checklistTemplate: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                preventiveMaintenance: {
                    select: {
                        id: true,
                        pmNumber: true,
                    },
                },
                attachments: {
                    select: {
                        id: true,
                        fileName: true,
                        fileUrl: true,
                        fileType: true,
                        attachmentType: true,
                    },
                },
            },
            orderBy: [
                {
                    priority: 'desc',
                },
                {
                    dueDate: 'asc',
                },
            ],
        });

        return {
            count: workOrders.length,
            workOrders,
        };
    }

    async approveWorkOrder(
        workOrderId: string,
        supervisorId: string,
        organizationId: string,
    ) {
        const workOrder = await this.prisma.workOrder.findFirst({
            where: {
                id: workOrderId,
                organizationId,
            },
        });

        if (!workOrder) {
            throw new BadRequestException('Work Order Not Found');
        }

        if (workOrder.status !== 'UNDER_REVIEW') {
            throw new BadRequestException('Work Order is not under review');
        }

        const updatedWorkOrder = await this.prisma.workOrder.update({
            where: { id: workOrderId },
            data: {
                status: 'CLOSED',
                reviewedById: supervisorId,
                reviewedAt: new Date(),
                reviewResult: 'APPROVED',
            },
        });

        await this.prisma.workOrderActivity.create({
            data: {
                workOrderId,
                action: 'SUPERVISOR_APPROVED',
                remarks: 'Supervisor Approved',
                performedById: supervisorId,
            },
        });

        await this.prisma.workOrderActivity.create({
            data: {
                workOrderId,
                action: 'WORK_ORDER_CLOSED',
                remarks: 'Work Order Closed',
                performedById: supervisorId,
            },
        });

        await this.prisma.activityLog.create({
            data: {
                organizationId,
                action: 'CLOSED',
                entityType: 'WORK_ORDER',
                entityId: workOrderId,
                entityName: workOrder.workOrderNumber,
                remarks: `Work order ${workOrder.workOrderNumber} was approved by supervisor and closed.`,
                performedById: supervisorId,
            },
        });

        // Publish system messages
        await this.chatService.publishSystemMessage(workOrderId, 'Supervisor approved the Work Order.', organizationId);
        await this.chatService.publishSystemMessage(workOrderId, 'Work Order Closed.', organizationId);
        await this.chatService.publishSystemMessage(workOrderId, 'Supervisor approved your completed Work Order.', organizationId);

        this.gateway.server.emit('work-order-status-updated', {
            workOrderId,
            status: 'CLOSED',
        });

        return {
            message: 'Work Order Approved Successfully',
            workOrder: updatedWorkOrder,
        };
    }

    async rejectWorkOrderSupervisor(
        workOrderId: string,
        reason: string,
        reassignTechnicianId: string,
        supervisorId: string,
        organizationId: string,
    ) {
        const workOrder = await this.prisma.workOrder.findFirst({
            where: {
                id: workOrderId,
                organizationId,
            },
        });

        if (!workOrder) {
            throw new BadRequestException('Work Order Not Found');
        }

        if (workOrder.status !== 'UNDER_REVIEW') {
            throw new BadRequestException('Work Order is not under review');
        }

        const technician = await this.prisma.user.findFirst({
            where: {
                id: reassignTechnicianId,
                organizationId,
            },
            include: {
                role: true,
            },
        });

        if (!technician) {
            throw new BadRequestException('Technician Not Found');
        }

        if (technician.role.name !== 'TECHNICIAN') {
            throw new BadRequestException('Selected user is not a technician');
        }

        // Transition through REOPENED -> ASSIGNED -> IN_PROGRESS
        const updatedWorkOrder = await this.prisma.workOrder.update({
            where: { id: workOrderId },
            data: {
                status: 'IN_PROGRESS',
                assignedTechnicianId: reassignTechnicianId,
                reviewedById: supervisorId,
                reviewedAt: new Date(),
                reviewResult: 'REJECTED',
                reviewNotes: reason,
                // Reset completed details to let technician perform it again
                startDate: null,
                breakdownStartedAt: null,
                assetRestoredAt: null,
                actualHours: null,
                resolutionNotes: null,
            },
        });

        // Create sequential timeline activities
        await this.prisma.workOrderActivity.create({
            data: {
                workOrderId,
                action: 'SUPERVISOR_REJECTED',
                remarks: `Supervisor Rejected: ${reason}`,
                performedById: supervisorId,
            },
        });

        await this.prisma.workOrderActivity.create({
            data: {
                workOrderId,
                action: 'WORK_ORDER_REOPENED',
                remarks: 'Work Order Reopened',
                performedById: supervisorId,
            },
        });

        await this.prisma.workOrderActivity.create({
            data: {
                workOrderId,
                action: 'TECHNICIAN_ASSIGNED',
                remarks: `Assigned to ${technician.fullName}`,
                performedById: supervisorId,
            },
        });

        await this.prisma.activityLog.create({
            data: {
                organizationId,
                action: 'REOPENED',
                entityType: 'WORK_ORDER',
                entityId: workOrderId,
                entityName: workOrder.workOrderNumber,
                remarks: `Work order ${workOrder.workOrderNumber} was rejected by supervisor and reassigned to ${technician.fullName}. Reason: ${reason}`,
                performedById: supervisorId,
            },
        });

        // Publish system messages sequentially in the chat
        await this.chatService.publishSystemMessage(workOrderId, 'Supervisor rejected the Work Order.', organizationId);
        await this.chatService.publishSystemMessage(workOrderId, `Reason: ${reason}`, organizationId);
        await this.chatService.publishSystemMessage(workOrderId, 'Work Order Reopened.', organizationId);
        await this.chatService.publishSystemMessage(workOrderId, `Assigned to Technician ${technician.fullName}`, organizationId);
        await this.chatService.publishSystemMessage(workOrderId, `Supervisor rejected the Work Order. Reason: ${reason}`, organizationId);

        this.gateway.server.emit('work-order-status-updated', {
            workOrderId,
            status: 'IN_PROGRESS',
        });

        return {
            message: 'Work Order Rejected and Reassigned Successfully',
            workOrder: updatedWorkOrder,
        };
    }
}
