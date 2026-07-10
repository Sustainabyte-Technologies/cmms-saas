import { Injectable, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WorkOrderChatGateway } from './work-order-chat.gateway';

@Injectable()
export class WorkOrderChatService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => WorkOrderChatGateway))
    private readonly gateway: WorkOrderChatGateway,
  ) {}

  async checkWorkOrderAccess(
    userId: string,
    workOrderId: string,
    role: string,
    organizationId: string,
  ): Promise<boolean> {
    if (role === 'ADMIN') return true;

    const workOrder = await this.prisma.workOrder.findFirst({
      where: { id: workOrderId, organizationId },
      include: {
        asset: {
          include: {
            department: true,
            site: true,
          },
        },
      },
    });

    if (!workOrder) return false;

    // Allowed if assigned technician
    if (workOrder.assignedTechnicianId === userId) return true;

    // Allowed if creator
    if (workOrder.createdById === userId) return true;

    const deptSupervisorId = workOrder.asset?.department?.assignedSupervisorId;
    const siteSupervisorId = workOrder.asset?.site?.assignedSupervisorId;

    // Allowed if supervising supervisor
    if (role === 'SUPERVISOR' && deptSupervisorId === userId) {
      return true;
    }

    // Allowed if site incharge
    if (role === 'SITE_INCHARGE' && siteSupervisorId === userId) {
      return true;
    }

    // Allowed if customer manager managing customer/site
    if (role === 'CUSTOMER_MANAGER') {
      const customer = await this.prisma.customer.findFirst({
        where: {
          assignedManagerId: userId,
          sites: {
            some: {
              id: workOrder.asset?.siteId || undefined,
            },
          },
        },
      });
      if (customer) return true;
    }

    return false;
  }

  async getMessages(
    workOrderId: string,
    userId: string,
    role: string,
    organizationId: string,
  ) {
    const hasAccess = await this.checkWorkOrderAccess(userId, workOrderId, role, organizationId);
    if (!hasAccess) {
      throw new ForbiddenException('You are not authorized to access this Work Order discussion.');
    }

    return this.prisma.workOrderMessage.findMany({
      where: { workOrderId },
      include: {
        sender: {
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
        attachments: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getWorkOrderRecipients(workOrderId: string, organizationId: string): Promise<string[]> {
    const workOrder = await this.prisma.workOrder.findFirst({
      where: { id: workOrderId, organizationId },
      include: {
        asset: {
          include: {
            department: true,
            site: true,
          },
        },
      },
    });

    if (!workOrder) return [];

    const recipients = new Set<string>();

    if (workOrder.createdById) recipients.add(workOrder.createdById);
    if (workOrder.assignedTechnicianId) recipients.add(workOrder.assignedTechnicianId);

    const deptSupervisorId = workOrder.asset?.department?.assignedSupervisorId;
    if (deptSupervisorId) recipients.add(deptSupervisorId);

    const siteSupervisorId = workOrder.asset?.site?.assignedSupervisorId;
    if (siteSupervisorId) recipients.add(siteSupervisorId);

    // Get all organization admins
    const admins = await this.prisma.user.findMany({
      where: {
        organizationId,
        role: {
          name: 'ADMIN',
        },
      },
      select: { id: true },
    });
    admins.forEach((admin) => recipients.add(admin.id));

    return Array.from(recipients);
  }

  async saveMessage(
    workOrderId: string,
    senderId: string | null,
    message: string,
    messageType: string,
    organizationId: string,
    role?: string,
  ) {
    if (senderId && role) {
      const hasAccess = await this.checkWorkOrderAccess(senderId, workOrderId, role, organizationId);
      if (!hasAccess) {
        throw new ForbiddenException('You are not authorized to access this Work Order discussion.');
      }
    }

    const saved = await this.prisma.workOrderMessage.create({
      data: {
        workOrderId,
        senderId,
        message,
        messageType,
      },
      include: {
        sender: {
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
        attachments: true,
        workOrder: {
          select: {
            workOrderNumber: true,
          },
        },
      },
    });

    // Broadcast to room
    this.gateway.server.to(`workorder:${workOrderId}`).emit('receiveWorkOrderMessage', saved);

    // Broadcast notifications to all recipients
    const recipients = await this.getWorkOrderRecipients(workOrderId, organizationId);
    for (const recipientId of recipients) {
      if (recipientId !== senderId) {
        this.gateway.server.to(recipientId).emit('receiveWorkOrderMessageNotification', saved);
      }
    }

    return saved;
  }

  async publishSystemMessage(
    workOrderId: string,
    message: string,
    organizationId: string,
  ) {
    return this.saveMessage(workOrderId, null, message, 'SYSTEM', organizationId);
  }
}
