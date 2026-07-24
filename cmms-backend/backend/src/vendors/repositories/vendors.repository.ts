import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, VendorStatus } from '@prisma/client';

@Injectable()
export class VendorsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.VendorCreateInput) {
    return this.prisma.vendor.create({
      data,
      include: {
        createdBy: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });
  }

  async findAll(organizationId: string, query?: { search?: string; status?: VendorStatus; category?: string }) {
    const where: Prisma.VendorWhereInput = { organizationId };

    if (query?.status) {
      where.status = query.status;
    }

    if (query?.category && query.category !== 'ALL') {
      where.supplierCategory = query.category;
    }

    if (query?.search) {
      where.OR = [
        { vendorName: { contains: query.search, mode: 'insensitive' } },
        { vendorCode: { contains: query.search, mode: 'insensitive' } },
        { contactPerson: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.vendor.findMany({
      where,
      include: {
        createdBy: { select: { id: true, fullName: true, email: true } },
        _count: {
          select: {
            purchaseOrders: true,
            goodsReceipts: true,
            invoices: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, organizationId: string) {
    return this.prisma.vendor.findFirst({
      where: { id, organizationId },
      include: {
        createdBy: { select: { id: true, fullName: true, email: true } },
        purchaseOrders: {
          include: { items: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        goodsReceipts: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        invoices: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
  }

  async update(id: string, organizationId: string, data: Prisma.VendorUpdateInput) {
    return this.prisma.vendor.update({
      where: { id },
      data,
    });
  }

  async delete(id: string, organizationId: string) {
    return this.prisma.vendor.delete({
      where: { id },
    });
  }

  async getDashboardStats(organizationId: string) {
    const [total, active, inactive, blacklisted, topRated, pendingDeliveries, pos] = await Promise.all([
      this.prisma.vendor.count({ where: { organizationId } }),
      this.prisma.vendor.count({ where: { organizationId, status: VendorStatus.ACTIVE } }),
      this.prisma.vendor.count({ where: { organizationId, status: VendorStatus.INACTIVE } }),
      this.prisma.vendor.count({ where: { organizationId, status: VendorStatus.BLACKLISTED } }),
      this.prisma.vendor.count({ where: { organizationId, rating: { gte: 4.5 } } }),
      this.prisma.purchaseOrder.count({
        where: {
          organizationId,
          status: { in: ['APPROVED', 'SENT', 'PARTIALLY_RECEIVED'] },
        },
      }),
      this.prisma.purchaseOrder.aggregate({
        where: { organizationId, status: 'RECEIVED' },
        _sum: { grandTotal: true },
        _count: true,
      }),
    ]);

    return {
      totalVendors: total,
      activeVendors: active,
      inactiveVendors: inactive,
      blacklistedVendors: blacklisted,
      topRatedVendors: topRated,
      pendingDeliveries,
      totalPurchaseVolume: pos._sum.grandTotal || 0,
      totalCompletedOrders: pos._count || 0,
    };
  }
}
