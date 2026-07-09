import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InventoryController {
    constructor(private readonly inventoryService: InventoryService) {}

    // ─── Dashboard Stats ──────────────────────────────────────────

    @Get('dashboard')
    @Roles('ADMIN', 'SITE_INCHARGE', 'SUPERVISOR', 'INVENTORY_MANAGER', 'MAINTENANCE_MANAGER')
    getDashboardStats(@Req() req) {
        return this.inventoryService.getDashboardStats(req.user.organizationId);
    }

    // ─── Spare Parts ──────────────────────────────────────────────

    @Post('spare-parts')
    @Roles('ADMIN', 'SITE_INCHARGE', 'INVENTORY_MANAGER')
    createSparePart(@Body() dto: CreateSparePartDto, @Req() req) {
        return this.inventoryService.createSparePart(dto, req.user.organizationId, req.user.sub);
    }

    @Get('spare-parts')
    @Roles('ADMIN', 'CUSTOMER_MANAGER', 'SITE_INCHARGE', 'SUPERVISOR', 'TECHNICIAN', 'INVENTORY_MANAGER', 'MAINTENANCE_MANAGER')
    getSpareParts(
        @Req() req,
        @Query('search') search?: string,
        @Query('categoryId') categoryId?: string,
        @Query('warehouseId') warehouseId?: string,
    ) {
        return this.inventoryService.getSpareParts(req.user.organizationId, search, categoryId, warehouseId);
    }

    @Get('spare-parts/:id')
    @Roles('ADMIN', 'CUSTOMER_MANAGER', 'SITE_INCHARGE', 'SUPERVISOR', 'TECHNICIAN', 'INVENTORY_MANAGER', 'MAINTENANCE_MANAGER')
    getSparePartById(@Param('id') id: string, @Req() req) {
        return this.inventoryService.getSparePartById(id, req.user.organizationId);
    }

    @Patch('spare-parts/:id')
    @Roles('ADMIN', 'SITE_INCHARGE', 'INVENTORY_MANAGER')
    updateSparePart(@Param('id') id: string, @Body() dto: UpdateSparePartDto, @Req() req) {
        return this.inventoryService.updateSparePart(id, dto, req.user.organizationId);
    }

    @Delete('spare-parts/:id')
    @Roles('ADMIN', 'INVENTORY_MANAGER')
    deleteSparePart(@Param('id') id: string, @Req() req) {
        return this.inventoryService.deleteSparePart(id, req.user.organizationId);
    }

    // ─── Categories ───────────────────────────────────────────────

    @Post('categories')
    @Roles('ADMIN', 'SITE_INCHARGE', 'INVENTORY_MANAGER')
    createCategory(@Body() dto: CreateCategoryDto, @Req() req) {
        return this.inventoryService.createCategory(dto, req.user.organizationId);
    }

    @Get('categories')
    @Roles('ADMIN', 'CUSTOMER_MANAGER', 'SITE_INCHARGE', 'SUPERVISOR', 'TECHNICIAN', 'INVENTORY_MANAGER', 'MAINTENANCE_MANAGER')
    getCategories(@Req() req) {
        return this.inventoryService.getCategories(req.user.organizationId);
    }

    @Patch('categories/:id')
    @Roles('ADMIN', 'SITE_INCHARGE', 'INVENTORY_MANAGER')
    updateCategory(@Param('id') id: string, @Body() dto: CreateCategoryDto, @Req() req) {
        return this.inventoryService.updateCategory(id, dto, req.user.organizationId);
    }

    @Delete('categories/:id')
    @Roles('ADMIN', 'INVENTORY_MANAGER')
    deleteCategory(@Param('id') id: string, @Req() req) {
        return this.inventoryService.deleteCategory(id, req.user.organizationId);
    }

    // ─── Warehouses ───────────────────────────────────────────────

    @Post('warehouses')
    @Roles('ADMIN', 'INVENTORY_MANAGER')
    createWarehouse(@Body() dto: CreateWarehouseDto, @Req() req) {
        return this.inventoryService.createWarehouse(dto, req.user.organizationId);
    }

    @Get('warehouses')
    @Roles('ADMIN', 'CUSTOMER_MANAGER', 'SITE_INCHARGE', 'SUPERVISOR', 'TECHNICIAN', 'INVENTORY_MANAGER', 'MAINTENANCE_MANAGER')
    getWarehouses(@Req() req) {
        return this.inventoryService.getWarehouses(req.user.organizationId);
    }

    @Patch('warehouses/:id')
    @Roles('ADMIN', 'INVENTORY_MANAGER')
    updateWarehouse(@Param('id') id: string, @Body() dto: CreateWarehouseDto, @Req() req) {
        return this.inventoryService.updateWarehouse(id, dto, req.user.organizationId);
    }

    @Delete('warehouses/:id')
    @Roles('ADMIN', 'INVENTORY_MANAGER')
    deleteWarehouse(@Param('id') id: string, @Req() req) {
        return this.inventoryService.deleteWarehouse(id, req.user.organizationId);
    }

    // ─── Stock Adjustments ────────────────────────────────────────

    @Get('low-stock')
    @Roles('ADMIN', 'SITE_INCHARGE', 'SUPERVISOR', 'INVENTORY_MANAGER', 'MAINTENANCE_MANAGER')
    getLowStock(@Req() req) {
        return this.inventoryService.getLowStock(req.user.organizationId);
    }

    @Post('receive')
    @Roles('ADMIN', 'SITE_INCHARGE', 'INVENTORY_MANAGER')
    receiveStock(@Body() dto: ReceiveStockDto, @Req() req) {
        return this.inventoryService.receiveStock(dto, req.user.organizationId, req.user.sub);
    }

    @Post('adjust')
    @Roles('ADMIN', 'INVENTORY_MANAGER')
    adjustStock(@Body() dto: AdjustStockDto, @Req() req) {
        return this.inventoryService.adjustStock(dto, req.user.organizationId, req.user.sub);
    }

    @Get('transactions')
    @Roles('ADMIN', 'SITE_INCHARGE', 'INVENTORY_MANAGER', 'MAINTENANCE_MANAGER')
    getTransactions(@Req() req, @Query('search') search?: string) {
        return this.inventoryService.getTransactions(req.user.organizationId, search);
    }

    // ─── Parts Requests ───────────────────────────────────────────

    @Post('parts-requests')
    @Roles('ADMIN', 'SUPERVISOR', 'TECHNICIAN', 'INVENTORY_MANAGER')
    createPartsRequest(@Body() dto: CreatePartsRequestDto, @Req() req) {
        return this.inventoryService.createPartsRequest(dto, req.user.organizationId, req.user.sub);
    }

    @Get('parts-requests')
    @Roles('ADMIN', 'CUSTOMER_MANAGER', 'SITE_INCHARGE', 'SUPERVISOR', 'TECHNICIAN', 'INVENTORY_MANAGER', 'MAINTENANCE_MANAGER')
    getPartsRequests(
        @Req() req,
        @Query('workOrderId') workOrderId?: string,
        @Query('status') status?: string,
    ) {
        return this.inventoryService.getPartsRequests(req.user.organizationId, workOrderId, status);
    }

    @Get('parts-requests/:id')
    @Roles('ADMIN', 'CUSTOMER_MANAGER', 'SITE_INCHARGE', 'SUPERVISOR', 'TECHNICIAN', 'INVENTORY_MANAGER', 'MAINTENANCE_MANAGER')
    getPartsRequestById(@Param('id') id: string, @Req() req) {
        return this.inventoryService.getPartsRequestById(id, req.user.organizationId);
    }

    @Patch('parts-requests/:id/approve')
    @Roles('ADMIN', 'SUPERVISOR', 'SITE_INCHARGE', 'MAINTENANCE_MANAGER')
    approvePartsRequest(@Param('id') id: string, @Body() dto: ApproveRequestDto, @Req() req) {
        return this.inventoryService.approvePartsRequest(id, dto, req.user.organizationId, req.user.sub);
    }

    @Patch('parts-requests/:id/reject')
    @Roles('ADMIN', 'SUPERVISOR', 'SITE_INCHARGE', 'MAINTENANCE_MANAGER')
    rejectPartsRequest(@Param('id') id: string, @Body() dto: RejectRequestDto, @Req() req) {
        return this.inventoryService.rejectPartsRequest(id, dto, req.user.organizationId, req.user.sub);
    }

    @Post('parts-requests/:id/issue')
    @Roles('ADMIN', 'SITE_INCHARGE', 'INVENTORY_MANAGER')
    issuePartsRequest(@Param('id') id: string, @Body() dto: IssueStockDto, @Req() req) {
        return this.inventoryService.issuePartsRequest(id, dto, req.user.organizationId, req.user.sub);
    }
}
