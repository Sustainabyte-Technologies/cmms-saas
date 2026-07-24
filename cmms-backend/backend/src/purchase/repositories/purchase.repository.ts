import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  Prisma,
  PurchaseRequestStatus,
  PurchaseOrderStatus,
  InvoicePaymentStatus,
} from '@prisma/client';

@Injectable()
export class PurchaseRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ── Purchase Requests ─────────────────────────
  async createPR(data: Prisma.PurchaseRequestCreateInput) {
    return this.prisma.purchaseRequest.create({
      data,
      include: {
        requestedBy: { select: { id: true, fullName: true, email: true } },
        warehouse: true,
        items: { include: { sparePart: true } },
      },
    });
  }

  async findAllPRs(organizationId: string, query?: { status?: PurchaseRequestStatus; search?: string }) {
    const where: Prisma.PurchaseRequestWhereInput = { organizationId };
    if (query?.status) where.status = query.status;
    if (query?.search) {
      where.OR = [
        { prNumber: { contains: query.search, mode: 'insensitive' } },
        { reason: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.purchaseRequest.findMany({
      where,
      include: {
        requestedBy: { select: { id: true, fullName: true, email: true } },
        warehouse: true,
        items: { include: { sparePart: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findPRById(id: string, organizationId: string) {
    return this.prisma.purchaseRequest.findFirst({
      where: { id, organizationId },
      include: {
        requestedBy: { select: { id: true, fullName: true, email: true } },
        warehouse: true,
        items: { include: { sparePart: true } },
      },
    });
  }

  async updatePR(id: string, data: Prisma.PurchaseRequestUpdateInput) {
    return this.prisma.purchaseRequest.update({
      where: { id },
      data,
      include: {
        requestedBy: { select: { id: true, fullName: true, email: true } },
        warehouse: true,
        items: { include: { sparePart: true } },
      },
    });
  }

  // ── Purchase Orders ───────────────────────────
  async createPO(data: Prisma.PurchaseOrderCreateInput) {
    return this.prisma.purchaseOrder.create({
      data,
      include: {
        vendor: true,
        createdBy: { select: { id: true, fullName: true, email: true } },
        warehouse: true,
        items: { include: { sparePart: true } },
      },
    });
  }

  async findAllPOs(organizationId: string, query?: { status?: PurchaseOrderStatus; search?: string; vendorId?: string }) {
    const where: Prisma.PurchaseOrderWhereInput = { organizationId };
    if (query?.status) where.status = query.status;
    if (query?.vendorId) where.vendorId = query.vendorId;
    if (query?.search) {
      where.OR = [
        { poNumber: { contains: query.search, mode: 'insensitive' } },
        { vendor: { vendorName: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    return this.prisma.purchaseOrder.findMany({
      where,
      include: {
        vendor: true,
        createdBy: { select: { id: true, fullName: true, email: true } },
        approvedBy: { select: { id: true, fullName: true, email: true } },
        warehouse: true,
        items: { include: { sparePart: true } },
        goodsReceipts: true,
        invoices: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findPOById(id: string, organizationId: string) {
    return this.prisma.purchaseOrder.findFirst({
      where: { id, organizationId },
      include: {
        vendor: true,
        createdBy: { select: { id: true, fullName: true, email: true } },
        approvedBy: { select: { id: true, fullName: true, email: true } },
        warehouse: true,
        items: { include: { sparePart: true } },
        goodsReceipts: { include: { items: true, receivedBy: { select: { id: true, fullName: true } } } },
        invoices: true,
      },
    });
  }

  async updatePO(id: string, data: Prisma.PurchaseOrderUpdateInput) {
    return this.prisma.purchaseOrder.update({
      where: { id },
      data,
      include: {
        vendor: true,
        items: { include: { sparePart: true } },
      },
    });
  }

  // ── Goods Receipts (GRN) ──────────────────────
  async createGRN(data: Prisma.GoodsReceiptCreateInput) {
    return this.prisma.goodsReceipt.create({
      data,
      include: {
        vendor: true,
        purchaseOrder: true,
        receivedBy: { select: { id: true, fullName: true, email: true } },
        items: { include: { sparePart: true } },
      },
    });
  }

  async findAllGRNs(organizationId: string) {
    return this.prisma.goodsReceipt.findMany({
      where: { organizationId },
      include: {
        vendor: true,
        purchaseOrder: true,
        receivedBy: { select: { id: true, fullName: true, email: true } },
        items: { include: { sparePart: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ── Invoices ─────────────────────────────────
  async createInvoice(data: Prisma.VendorInvoiceCreateInput) {
    return this.prisma.vendorInvoice.create({
      data,
      include: {
        vendor: true,
        purchaseOrder: true,
      },
    });
  }

  async findAllInvoices(organizationId: string, query?: { paymentStatus?: InvoicePaymentStatus }) {
    const where: Prisma.VendorInvoiceWhereInput = { organizationId };
    if (query?.paymentStatus) where.paymentStatus = query.paymentStatus;

    return this.prisma.vendorInvoice.findMany({
      where,
      include: {
        vendor: true,
        purchaseOrder: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateInvoice(id: string, data: Prisma.VendorInvoiceUpdateInput) {
    return this.prisma.vendorInvoice.update({
      where: { id },
      data,
      include: { vendor: true, purchaseOrder: true },
    });
  }

  // ── Dashboard Metrics ─────────────────────────
  async getDashboardStats(organizationId: string) {
    const [
      totalPRs,
      pendingPRs,
      approvedPOs,
      openPOs,
      grnToday,
      invoices,
      totalSpend,
    ] = await Promise.all([
      this.prisma.purchaseRequest.count({ where: { organizationId } }),
      this.prisma.purchaseRequest.count({ where: { organizationId, status: 'PENDING' } }),
      this.prisma.purchaseOrder.count({ where: { organizationId, status: 'APPROVED' } }),
      this.prisma.purchaseOrder.count({
        where: { organizationId, status: { in: ['CREATED', 'PENDING_APPROVAL', 'APPROVED', 'SENT', 'PARTIALLY_RECEIVED'] } },
      }),
      this.prisma.goodsReceipt.count({
        where: {
          organizationId,
          createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      }),
      this.prisma.vendorInvoice.findMany({
        where: { organizationId },
        select: { invoiceAmount: true, paidAmount: true, paymentStatus: true },
      }),
      this.prisma.purchaseOrder.aggregate({
        where: { organizationId, status: 'RECEIVED' },
        _sum: { grandTotal: true },
      }),
    ]);

    const totalInvoiceAmount = invoices.reduce((sum, inv) => sum + inv.invoiceAmount, 0);
    const totalPaid = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
    const pendingInvoices = invoices.filter((i) => i.paymentStatus === 'PENDING').length;

    return {
      totalPurchaseRequests: totalPRs,
      pendingApprovalPRs: pendingPRs,
      approvedOrders: approvedPOs,
      openPurchaseOrders: openPOs,
      todayReceipts: grnToday,
      monthlyPurchaseCost: totalSpend._sum.grandTotal || 0,
      totalInvoiceAmount,
      totalPaidAmount: totalPaid,
      pendingInvoicesCount: pendingInvoices,
    };
  }
}
