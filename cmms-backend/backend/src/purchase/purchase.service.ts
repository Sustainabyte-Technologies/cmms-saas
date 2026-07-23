import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PurchaseRepository } from './repositories/purchase.repository';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePrDto, UpdatePrStatusDto } from './dto/create-pr.dto';
import { CreatePoDto, UpdatePoStatusDto } from './dto/create-po.dto';
import { CreateGrnDto } from './dto/create-grn.dto';
import { CreateInvoiceDto, UpdateInvoicePaymentDto } from './dto/create-grn.dto';
import {
  PurchaseRequestStatus,
  PurchaseOrderStatus,
  InvoicePaymentStatus,
} from '@prisma/client';

@Injectable()
export class PurchaseService {
  constructor(
    private readonly purchaseRepository: PurchaseRepository,
    private readonly prisma: PrismaService,
  ) {}

  private generatePrNumber(): string {
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `PR-${new Date().getFullYear()}-${rand}`;
  }

  private generatePoNumber(): string {
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `PO-${new Date().getFullYear()}-${rand}`;
  }

  private generateGrnNumber(): string {
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `GRN-${new Date().getFullYear()}-${rand}`;
  }

  // ── Purchase Requests ─────────────────────────────────────────
  async createPR(dto: CreatePrDto, organizationId: string, userId: string) {
    const prNumber = this.generatePrNumber();
    const totalAmount = dto.items.reduce(
      (sum, item) => sum + (item.quantity * (item.estimatedUnitPrice || 0)),
      0,
    );

    return this.purchaseRepository.createPR({
      prNumber,
      organization: { connect: { id: organizationId } },
      requestedBy: { connect: { id: userId } },
      departmentId: dto.departmentId,
      warehouse: dto.warehouseId ? { connect: { id: dto.warehouseId } } : undefined,
      priority: dto.priority,
      requiredDate: dto.requiredDate ? new Date(dto.requiredDate) : undefined,
      reason: dto.reason,
      totalAmount,
      status: PurchaseRequestStatus.PENDING,
      approvalStep: 'STOREKEEPER',
      items: {
        create: dto.items.map((item) => ({
          sparePartId: item.sparePartId,
          partDescription: item.partDescription,
          quantity: item.quantity,
          unit: item.unit || 'Pcs',
          estimatedUnitPrice: item.estimatedUnitPrice || 0,
          lineTotal: item.quantity * (item.estimatedUnitPrice || 0),
        })),
      },
    });
  }

  async findAllPRs(organizationId: string, query?: { status?: PurchaseRequestStatus; search?: string }) {
    return this.purchaseRepository.findAllPRs(organizationId, query);
  }

  async findPRById(id: string, organizationId: string) {
    const pr = await this.purchaseRepository.findPRById(id, organizationId);
    if (!pr) throw new NotFoundException(`Purchase Request ${id} not found`);
    return pr;
  }

  async updatePRStatus(id: string, dto: UpdatePrStatusDto, organizationId: string) {
    await this.findPRById(id, organizationId);
    return this.purchaseRepository.updatePR(id, {
      status: dto.status,
      approvalStep: dto.approvalStep || (dto.status === PurchaseRequestStatus.APPROVED ? 'APPROVED' : 'REJECTED'),
      rejectionReason: dto.rejectionReason,
    });
  }

  // ── Purchase Orders ───────────────────────────────────────────
  async createPO(dto: CreatePoDto, organizationId: string, userId: string) {
    const poNumber = this.generatePoNumber();

    const subtotal = dto.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice - (item.discount || 0) + (item.tax || 0),
      0,
    );
    const grandTotal = subtotal + (dto.shipping || 0) + (dto.tax || 0) - (dto.discount || 0);

    const po = await this.purchaseRepository.createPO({
      poNumber,
      organization: { connect: { id: organizationId } },
      vendor: { connect: { id: dto.vendorId } },
      purchaseRequest: dto.purchaseRequestId ? { connect: { id: dto.purchaseRequestId } } : undefined,
      warehouse: dto.warehouseId ? { connect: { id: dto.warehouseId } } : undefined,
      expectedDelivery: dto.expectedDelivery ? new Date(dto.expectedDelivery) : undefined,
      currency: dto.currency || 'USD',
      tax: dto.tax || 0,
      discount: dto.discount || 0,
      shipping: dto.shipping || 0,
      subtotal,
      grandTotal,
      status: PurchaseOrderStatus.APPROVED,
      createdBy: userId ? { connect: { id: userId } } : undefined,
      notes: dto.notes,
      items: {
        create: dto.items.map((item) => ({
          sparePartId: item.sparePartId,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit || 'Pcs',
          unitPrice: item.unitPrice,
          discount: item.discount || 0,
          tax: item.tax || 0,
          lineTotal: item.quantity * item.unitPrice - (item.discount || 0) + (item.tax || 0),
        })),
      },
    });

    // If linked to a PR, mark the PR as CONVERTED_TO_PO
    if (dto.purchaseRequestId) {
      await this.purchaseRepository.updatePR(dto.purchaseRequestId, {
        status: PurchaseRequestStatus.CONVERTED_TO_PO,
      });
    }

    return po;
  }

  async findAllPOs(
    organizationId: string,
    query?: { status?: PurchaseOrderStatus; search?: string; vendorId?: string },
  ) {
    return this.purchaseRepository.findAllPOs(organizationId, query);
  }

  async findPOById(id: string, organizationId: string) {
    const po = await this.purchaseRepository.findPOById(id, organizationId);
    if (!po) throw new NotFoundException(`Purchase Order ${id} not found`);
    return po;
  }

  async updatePOStatus(id: string, dto: UpdatePoStatusDto, organizationId: string) {
    await this.findPOById(id, organizationId);
    return this.purchaseRepository.updatePO(id, {
      status: dto.status,
    });
  }

  // ── Goods Receipt (GRN) & Stock Auto-Update ─────────────────
  async createGRN(dto: CreateGrnDto, organizationId: string, userId: string) {
    const grnNumber = this.generateGrnNumber();
    const po = await this.findPOById(dto.purchaseOrderId, organizationId);

    const totalReceived = dto.items.reduce((sum, i) => sum + i.receivedQty, 0);
    const totalRejected = dto.items.reduce((sum, i) => sum + (i.rejectedQty || 0), 0);

    // Transaction for atomic GRN creation and inventory stock updates
    return this.prisma.$transaction(async (tx) => {
      // 1. Create GRN
      const grn = await tx.goodsReceipt.create({
        data: {
          grnNumber,
          organization: { connect: { id: organizationId } },
          vendor: { connect: { id: dto.vendorId } },
          purchaseOrder: { connect: { id: dto.purchaseOrderId } },
          warehouse: dto.warehouseId ? { connect: { id: dto.warehouseId } } : undefined,
          receivedDate: dto.receivedDate ? new Date(dto.receivedDate) : new Date(),
          receivedBy: userId ? { connect: { id: userId } } : undefined,
          receivedQuantity: totalReceived,
          rejectedQuantity: totalRejected,
          remarks: dto.remarks,
          items: {
            create: dto.items.map((item) => ({
              sparePartId: item.sparePartId,
              receivedQty: item.receivedQty,
              rejectedQty: item.rejectedQty || 0,
              unitPrice: item.unitPrice || 0,
              remarks: item.remarks,
            })),
          },
        },
        include: {
          items: true,
          vendor: true,
          purchaseOrder: true,
        },
      });

      // 2. Automatically update SparePart stock and log StockTransaction for each received item
      for (const item of dto.items) {
        if (item.sparePartId && item.receivedQty > 0) {
          // Increment stock
          const sparePart = await tx.sparePart.update({
            where: { id: item.sparePartId },
            data: {
              currentStock: { increment: item.receivedQty },
              unitCost: item.unitPrice && item.unitPrice > 0 ? item.unitPrice : undefined,
            },
          });

          // Log StockTransaction
          await tx.stockTransaction.create({
            data: {
              organizationId,
              sparePartId: item.sparePartId,
              warehouseId: dto.warehouseId || sparePart.warehouseId,
              transactionType: 'IN',
              quantity: item.receivedQty,
              unitCost: item.unitPrice || sparePart.unitCost,
              totalCost: item.receivedQty * (item.unitPrice || sparePart.unitCost),
              referenceType: 'PURCHASE_RECEIPT',
              referenceId: grn.id,
              notes: `Goods Receipt ${grnNumber} from PO ${po.poNumber}`,
              performedById: userId,
            },
          });
        }
      }

      // 3. Update PO status to RECEIVED or PARTIALLY_RECEIVED
      const newStatus = totalReceived >= po.items.reduce((s, i) => s + i.quantity, 0)
        ? PurchaseOrderStatus.RECEIVED
        : PurchaseOrderStatus.PARTIALLY_RECEIVED;

      await tx.purchaseOrder.update({
        where: { id: dto.purchaseOrderId },
        data: { status: newStatus },
      });

      return grn;
    });
  }

  async findAllGRNs(organizationId: string) {
    return this.purchaseRepository.findAllGRNs(organizationId);
  }

  // ── Invoice & Payment Management ──────────────────────────────
  async createInvoice(dto: CreateInvoiceDto, organizationId: string) {
    return this.purchaseRepository.createInvoice({
      invoiceNumber: dto.invoiceNumber,
      organization: { connect: { id: organizationId } },
      vendor: { connect: { id: dto.vendorId } },
      purchaseOrder: dto.purchaseOrderId ? { connect: { id: dto.purchaseOrderId } } : undefined,
      invoiceAmount: dto.invoiceAmount,
      invoiceDate: dto.invoiceDate ? new Date(dto.invoiceDate) : new Date(),
      paymentDueDate: dto.paymentDueDate ? new Date(dto.paymentDueDate) : undefined,
      paymentStatus: InvoicePaymentStatus.PENDING,
      paidAmount: 0,
      attachmentUrl: dto.attachmentUrl,
      remarks: dto.remarks,
    });
  }

  async findAllInvoices(organizationId: string, query?: { paymentStatus?: InvoicePaymentStatus }) {
    return this.purchaseRepository.findAllInvoices(organizationId, query);
  }

  async updateInvoicePayment(id: string, dto: UpdateInvoicePaymentDto, organizationId: string) {
    return this.purchaseRepository.updateInvoice(id, {
      paymentStatus: dto.paymentStatus,
      paidAmount: dto.paidAmount,
      paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : new Date(),
    });
  }

  // ── Dashboard Metrics ─────────────────────────────────────────
  async getDashboard(organizationId: string) {
    return this.purchaseRepository.getDashboardStats(organizationId);
  }
}
