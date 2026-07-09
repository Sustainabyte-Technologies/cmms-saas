import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async saveMessage(senderId: string, receiverId: string, message: string) {
    return this.prisma.chatMessage.create({
      data: {
        senderId,
        receiverId,
        message,
      },
      include: {
        sender: {
          select: { id: true, fullName: true, email: true },
        },
        receiver: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });
  }

  async getMessages(userId: string, otherUserId: string) {
    return this.prisma.chatMessage.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      },
      orderBy: {
        createdAt: 'asc',
      },
      include: {
        sender: {
          select: { id: true, fullName: true, email: true },
        },
        receiver: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });
  }

  async getAvailableUsers(userId: string, role: string, organizationId: string) {
    const users = await this.prisma.user.findMany({
      where: {
        organizationId,
        id: { not: userId },
      },
      include: {
        role: true,
        supervisedSites: { select: { name: true } },
        supervisedDepartments: { select: { name: true } },
      },
    });

    const ROLE_RANKS: Record<string, number> = {
      ADMIN: 1,
      CUSTOMER_MANAGER: 2,
      SITE_INCHARGE: 3,
      SUPERVISOR: 4,
      TECHNICIAN: 5,
    };

    const mappedUsers = users.map((user) => {
      let deptName = '';
      let siteName = '';
      if (user.supervisedDepartments && user.supervisedDepartments.length > 0) {
        deptName = user.supervisedDepartments.map((d: any) => d.name).join(', ');
      }
      if (user.supervisedSites && user.supervisedSites.length > 0) {
        siteName = user.supervisedSites.map((s: any) => s.name).join(', ');
      }
      return {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role.name,
        department: deptName || null,
        site: siteName || null,
        status: 'offline', // Future-ready
      };
    });

    mappedUsers.sort((a, b) => {
      const rankA = ROLE_RANKS[a.role] || 99;
      const rankB = ROLE_RANKS[b.role] || 99;
      if (rankA !== rankB) return rankA - rankB;
      return a.fullName.localeCompare(b.fullName);
    });

    return mappedUsers;
  }

  async checkCommunicationPermission(senderId: string, receiverId: string, organizationId: string): Promise<boolean> {
    const receiver = await this.prisma.user.findFirst({
      where: { id: receiverId, organizationId },
    });
    return !!receiver;
  }
}
