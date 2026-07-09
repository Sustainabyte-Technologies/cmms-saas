import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSparePartDto } from './dto/create-spare-part.dto';
import { UpdateSparePartDto } from './dto/update-spare-part.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { CreatePartsRequestDto } from './dto/create-parts-request.dto';
import { ApproveRequestDto } from './dto/approve-request.dto';
import { RejectRequestDto } from './dto/reject-request.dto';
import { IssueStockDto } from './dto/issue-stock.dto';
import { ReceiveStockDto } from './dto/receive-stock.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { PartsRequestStatus, StockTransactionType } from '@prisma/client';

@Injectable()
export class InventoryService {
    constructor(private readonly prisma: PrismaService) {}

    // ─── Spare Parts CRUD ──────────────────────────────────────────

    async createSparePart(dto: CreateSparePartDto, organizationId: string, userId: string) {
        return this.prisma.sparePart.create({
            data: {
                partCode: dto.partCode,
                partName: dto.partName,
                description: dto.description,
                unit: dto.unit || 'PCS',
                currentStock: dto.currentStock || 0,
                minimumStock: dto.minimumStock || 0,
                maximumStock: dto.maximumStock || 0,
                unitCost: dto.unitCost || 0,
                manufacturer: dto.manufacturer,
                imageUrl: dto.imageUrl,
                categoryId: dto.categoryId,
                warehouseId: dto.warehouseId,
                organizationId,
                createdById: userId,
            },
            include: {
                category: true,
                warehouse: true,
            },
        });
    }

    async getSpareParts(organizationId: string, search?: string, categoryId?: string, warehouseId?: string) {
        return this.prisma.sparePart.findMany({
            where: {
                organizationId,
                status: true,
                ...(search && {
                    OR: [
                        { partName: { contains: search, mode: 'insensitive' } },
                        { partCode: { contains: search, mode: 'insensitive' } },
                    ],
                }),
                ...(categoryId && { categoryId }),
                ...(warehouseId && { warehouseId }),
            },
            include: {
                category: true,
                warehouse: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async getSparePartById(id: string, organizationId: string) {
        const part = await this.prisma.sparePart.findFirst({
            where: { id, organizationId },
            include: {
                category: true,
                warehouse: true,
            },
        });
        if (!part) throw new NotFoundException('Spare part not found');
        return part;
    }

    async updateSparePart(id: string, dto: UpdateSparePartDto, organizationId: string) {
        await this.getSparePartById(id, organizationId);
        return this.prisma.sparePart.update({
            where: { id },
            data: {
                partCode: dto.partCode,
                partName: dto.partName,
                description: dto.description,
                unit: dto.unit,
                currentStock: dto.currentStock,
                minimumStock: dto.minimumStock,
                maximumStock: dto.maximumStock,
                unitCost: dto.unitCost,
                manufacturer: dto.manufacturer,
                imageUrl: dto.imageUrl,
                categoryId: dto.categoryId,
                warehouseId: dto.warehouseId,
                status: dto.status,
            },
            include: {
                category: true,
                warehouse: true,
            },
        });
    }

    async deleteSparePart(id: string, organizationId: string) {
        await this.getSparePartById(id, organizationId);
        return this.prisma.sparePart.update({
            where: { id },
            data: { status: false },
        });
    }

    // ─── Categories CRUD ──────────────────────────────────────────

    async createCategory(dto: CreateCategoryDto, organizationId: string) {
        return this.prisma.sparePartCategory.create({
            data: {
                name: dto.name,
                description: dto.description,
                organizationId,
            },
        });
    }

    async getCategories(organizationId: string) {
        return this.prisma.sparePartCategory.findMany({
            where: { organizationId, status: true },
            orderBy: { name: 'asc' },
        });
    }

    async updateCategory(id: string, dto: CreateCategoryDto, organizationId: string) {
        const cat = await this.prisma.sparePartCategory.findFirst({
            where: { id, organizationId },
        });
        if (!cat) throw new NotFoundException('Category not found');
        return this.prisma.sparePartCategory.update({
            where: { id },
            data: {
                name: dto.name,
                description: dto.description,
            },
        });
    }

    async deleteCategory(id: string, organizationId: string) {
        return this.prisma.sparePartCategory.update({
            where: { id, organizationId },
            data: { status: false },
        });
    }

    // ─── Warehouses CRUD ──────────────────────────────────────────

    async createWarehouse(dto: CreateWarehouseDto, organizationId: string) {
        return this.prisma.warehouse.create({
            data: {
                name: dto.name,
                code: dto.code,
                address: dto.address,
                description: dto.description,
                organizationId,
            },
        });
    }

    async getWarehouses(organizationId: string) {
        return this.prisma.warehouse.findMany({
            where: { organizationId, status: true },
            orderBy: { name: 'asc' },
        });
    }

    async updateWarehouse(id: string, dto: CreateWarehouseDto, organizationId: string) {
        const wh = await this.prisma.warehouse.findFirst({
            where: { id, organizationId },
        });
        if (!wh) throw new NotFoundException('Warehouse not found');
        return this.prisma.warehouse.update({
            where: { id },
            data: {
                name: dto.name,
                code: dto.code,
                address: dto.address,
                description: dto.description,
            },
        });
    }

    async deleteWarehouse(id: string, organizationId: string) {
        return this.prisma.warehouse.update({
            where: { id, organizationId },
            data: { status: false },
        });
    }

    // ─── Parts Requests ───────────────────────────────────────────

    async createPartsRequest(dto: CreatePartsRequestDto, organizationId: string, userId: string) {
        // Generate Request Number (e.g. PR-0001)
        const count = await this.prisma.partsRequest.count({
            where: { organizationId },
        });
        const requestNumber = `PR-${String(count + 1).padStart(4, '0')}`;

        return this.prisma.partsRequest.create({
            data: {
                requestNumber,
                workOrderId: dto.workOrderId,
                requestedById: userId,
                reason: dto.reason,
                priority: dto.priority || 'MEDIUM',
                status: PartsRequestStatus.PENDING,
                organizationId,
                items: {
                    create: dto.items.map(item => ({
                        sparePartId: item.sparePartId,
                        requestedQty: item.requestedQty,
                    })),
                },
            },
            include: {
                items: {
                    include: {
                        sparePart: true,
                    },
                },
                workOrder: true,
                requestedBy: true,
            },
        });
    }

    async getPartsRequests(organizationId: string, workOrderId?: string, status?: string) {
        return this.prisma.partsRequest.findMany({
            where: {
                organizationId,
                ...(workOrderId && { workOrderId }),
                ...(status && { status: status as PartsRequestStatus }),
            },
            include: {
                items: {
                    include: {
                        sparePart: {
                            include: {
                                warehouse: true,
                            },
                        },
                    },
                },
                workOrder: true,
                requestedBy: true,
                approvedBy: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async getPartsRequestById(id: string, organizationId: string) {
        const req = await this.prisma.partsRequest.findFirst({
            where: { id, organizationId },
            include: {
                items: {
                    include: {
                        sparePart: {
                            include: {
                                warehouse: true,
                            },
                        },
                    },
                },
                workOrder: true,
                requestedBy: true,
                approvedBy: true,
            },
        });
        if (!req) throw new NotFoundException('Parts request not found');
        return req;
    }

    async approvePartsRequest(id: string, dto: ApproveRequestDto, organizationId: string, userId: string) {
        const req = await this.getPartsRequestById(id, organizationId);
        if (req.status !== PartsRequestStatus.PENDING) {
            throw new BadRequestException('Request is not in PENDING status');
        }

        // Optional: Update reserved stock levels for requested items
        for (const item of req.items) {
            await this.prisma.sparePart.update({
                where: { id: item.sparePartId },
                data: {
                    reservedStock: { increment: item.requestedQty },
                },
            });
        }

        return this.prisma.partsRequest.update({
            where: { id },
            data: {
                status: PartsRequestStatus.APPROVED,
                approvedById: userId,
                approvedAt: new Date(),
                rejectionReason: dto.notes,
            },
            include: {
                items: true,
                approvedBy: true,
            },
        });
    }

    async rejectPartsRequest(id: string, dto: RejectRequestDto, organizationId: string, userId: string) {
        const req = await this.getPartsRequestById(id, organizationId);
        if (req.status !== PartsRequestStatus.PENDING && req.status !== PartsRequestStatus.APPROVED) {
            throw new BadRequestException('Only PENDING or APPROVED requests can be rejected');
        }

        // If it was APPROVED, rollback the reserved stock
        if (req.status === PartsRequestStatus.APPROVED) {
            for (const item of req.items) {
                await this.prisma.sparePart.update({
                    where: { id: item.sparePartId },
                    data: {
                        reservedStock: { decrement: item.requestedQty },
                    },
                });
            }
        }

        return this.prisma.partsRequest.update({
            where: { id },
            data: {
                status: PartsRequestStatus.REJECTED,
                approvedById: userId,
                approvedAt: new Date(),
                rejectionReason: dto.reason,
            },
            include: {
                items: true,
                approvedBy: true,
            },
        });
    }

    async issuePartsRequest(id: string, dto: IssueStockDto, organizationId: string, userId: string) {
        const req = await this.getPartsRequestById(id, organizationId);
        if (req.status !== PartsRequestStatus.APPROVED) {
            throw new BadRequestException('Parts request must be APPROVED to issue items');
        }

        // Check stock availability for all parts in the request
        for (const item of req.items) {
            const availableQty = item.sparePart.currentStock;
            if (availableQty < item.requestedQty) {
                throw new BadRequestException(
                    `Insufficient stock for "${item.sparePart.partName}". Available: ${availableQty}, Requested: ${item.requestedQty}`,
                );
            }
        }

        // Deduct stock, decrease reserved stock, and log transaction
        for (const item of req.items) {
            await this.prisma.sparePart.update({
                where: { id: item.sparePartId },
                data: {
                    currentStock: { decrement: item.requestedQty },
                    reservedStock: { decrement: item.requestedQty },
                },
            });

            // Log Transaction
            await this.prisma.stockTransaction.create({
                data: {
                    transactionType: StockTransactionType.ISSUE,
                    quantity: item.requestedQty,
                    referenceNumber: req.requestNumber,
                    notes: dto.notes || `Issued for Work Order ${req.workOrder.workOrderNumber}`,
                    sparePartId: item.sparePartId,
                    warehouseId: item.sparePart.warehouseId,
                    workOrderId: req.workOrderId,
                    performedById: userId,
                    organizationId,
                },
            });

            // Also update request item with issuedQty
            await this.prisma.partsRequestItem.update({
                where: { id: item.id },
                data: { issuedQty: item.requestedQty },
            });
        }

        return this.prisma.partsRequest.update({
            where: { id },
            data: {
                status: PartsRequestStatus.ISSUED,
            },
            include: {
                items: true,
            },
        });
    }

    // ─── Stock Transactions & Adjustments ────────────────────────

    async getTransactions(organizationId: string, search?: string) {
        return this.prisma.stockTransaction.findMany({
            where: {
                organizationId,
                ...(search && {
                    OR: [
                        { referenceNumber: { contains: search, mode: 'insensitive' } },
                        { sparePart: { partName: { contains: search, mode: 'insensitive' } } },
                        { sparePart: { partCode: { contains: search, mode: 'insensitive' } } },
                    ],
                }),
            },
            include: {
                sparePart: true,
                warehouse: true,
                workOrder: true,
                performedBy: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async receiveStock(dto: ReceiveStockDto, organizationId: string, userId: string) {
        const part = await this.getSparePartById(dto.sparePartId, organizationId);

        // Update Spare Part stock level
        await this.prisma.sparePart.update({
            where: { id: dto.sparePartId },
            data: {
                currentStock: { increment: dto.quantity },
                warehouseId: dto.warehouseId, // Update warehouse location if changed
            },
        });

        // Log Stock Transaction
        return this.prisma.stockTransaction.create({
            data: {
                transactionType: StockTransactionType.RECEIVE,
                quantity: dto.quantity,
                referenceNumber: dto.referenceNumber,
                notes: dto.notes || 'Goods receipt restock',
                sparePartId: dto.sparePartId,
                warehouseId: dto.warehouseId,
                performedById: userId,
                organizationId,
            },
            include: {
                sparePart: true,
                warehouse: true,
            },
        });
    }

    async adjustStock(dto: AdjustStockDto, organizationId: string, userId: string) {
        const part = await this.getSparePartById(dto.sparePartId, organizationId);
        const difference = dto.quantity - part.currentStock;

        // Set Spare Part stock level directly
        await this.prisma.sparePart.update({
            where: { id: dto.sparePartId },
            data: {
                currentStock: dto.quantity,
                warehouseId: dto.warehouseId,
            },
        });

        // Log Stock Transaction
        return this.prisma.stockTransaction.create({
            data: {
                transactionType: StockTransactionType.ADJUSTMENT,
                quantity: difference,
                notes: dto.notes || `Stock audit adjustment (From ${part.currentStock} to ${dto.quantity})`,
                sparePartId: dto.sparePartId,
                warehouseId: dto.warehouseId,
                performedById: userId,
                organizationId,
            },
            include: {
                sparePart: true,
                warehouse: true,
            },
        });
    }

    // ─── Dashboard Stats & Alerts ───────────────────────────────

    async getLowStock(organizationId: string) {
        return this.prisma.sparePart.findMany({
            where: {
                organizationId,
                status: true,
                currentStock: {
                    lt: this.prisma.sparePart.fields.minimumStock,
                },
            },
            include: {
                category: true,
                warehouse: true,
            },
        });
    }

    async getDashboardStats(organizationId: string) {
        const parts = await this.prisma.sparePart.findMany({
            where: { organizationId, status: true },
        });

        const totalSpareParts = parts.length;
        const currentStockValue = parts.reduce((sum, part) => sum + (part.currentStock * part.unitCost), 0);
        const lowStockItems = parts.filter(part => part.currentStock < part.minimumStock).length;

        const pendingRequests = await this.prisma.partsRequest.count({
            where: { organizationId, status: PartsRequestStatus.PENDING },
        });

        // Today's starts & ends
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const transactionsToday = await this.prisma.stockTransaction.findMany({
            where: {
                organizationId,
                createdAt: { gte: startOfToday },
            },
        });

        const issuedToday = transactionsToday
            .filter(tx => tx.transactionType === StockTransactionType.ISSUE)
            .reduce((sum, tx) => sum + tx.quantity, 0);

        const receivedToday = transactionsToday
            .filter(tx => tx.transactionType === StockTransactionType.RECEIVE)
            .reduce((sum, tx) => sum + tx.quantity, 0);

        return {
            totalSpareParts,
            currentStockValue,
            pendingRequests,
            lowStockItems,
            issuedToday,
            receivedToday,
        };
    }
}
