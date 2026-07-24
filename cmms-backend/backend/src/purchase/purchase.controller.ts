import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards, Req } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { CreatePrDto, UpdatePrStatusDto } from './dto/create-pr.dto';
import { CreatePoDto, UpdatePoStatusDto } from './dto/create-po.dto';
import { CreateGrnDto, CreateInvoiceDto, UpdateInvoicePaymentDto } from './dto/create-grn.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PurchaseRequestStatus, PurchaseOrderStatus, InvoicePaymentStatus } from '@prisma/client';

@Controller('purchase')
@UseGuards(JwtAuthGuard)
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

  @Get('dashboard')
  getDashboard(@Req() req: any) {
    return this.purchaseService.getDashboard(req.user.organizationId);
  }

  // ── Purchase Requests ─────────────────────────
  @Post('requests')
  createPR(@Body() dto: CreatePrDto, @Req() req: any) {
    return this.purchaseService.createPR(dto, req.user.organizationId, req.user.id);
  }

  @Get('requests')
  findAllPRs(
    @Query('status') status: PurchaseRequestStatus,
    @Query('search') search: string,
    @Req() req: any,
  ) {
    return this.purchaseService.findAllPRs(req.user.organizationId, { status, search });
  }

  @Get('requests/:id')
  findPRById(@Param('id') id: string, @Req() req: any) {
    return this.purchaseService.findPRById(id, req.user.organizationId);
  }

  @Patch('requests/:id/status')
  updatePRStatus(@Param('id') id: string, @Body() dto: UpdatePrStatusDto, @Req() req: any) {
    return this.purchaseService.updatePRStatus(id, dto, req.user.organizationId);
  }

  // ── Purchase Orders ───────────────────────────
  @Post('orders')
  createPO(@Body() dto: CreatePoDto, @Req() req: any) {
    return this.purchaseService.createPO(dto, req.user.organizationId, req.user.id);
  }

  @Get('orders')
  findAllPOs(
    @Query('status') status: PurchaseOrderStatus,
    @Query('search') search: string,
    @Query('vendorId') vendorId: string,
    @Req() req: any,
  ) {
    return this.purchaseService.findAllPOs(req.user.organizationId, { status, search, vendorId });
  }

  @Get('orders/:id')
  findPOById(@Param('id') id: string, @Req() req: any) {
    return this.purchaseService.findPOById(id, req.user.organizationId);
  }

  @Patch('orders/:id/status')
  updatePOStatus(@Param('id') id: string, @Body() dto: UpdatePoStatusDto, @Req() req: any) {
    return this.purchaseService.updatePOStatus(id, dto, req.user.organizationId);
  }

  // ── Goods Receipts (GRN) ──────────────────────
  @Post('grn')
  createGRN(@Body() dto: CreateGrnDto, @Req() req: any) {
    return this.purchaseService.createGRN(dto, req.user.organizationId, req.user.id);
  }

  @Get('grn')
  findAllGRNs(@Req() req: any) {
    return this.purchaseService.findAllGRNs(req.user.organizationId);
  }

  // ── Invoices & Payments ───────────────────────
  @Post('invoices')
  createInvoice(@Body() dto: CreateInvoiceDto, @Req() req: any) {
    return this.purchaseService.createInvoice(dto, req.user.organizationId);
  }

  @Get('invoices')
  findAllInvoices(@Query('paymentStatus') paymentStatus: InvoicePaymentStatus, @Req() req: any) {
    return this.purchaseService.findAllInvoices(req.user.organizationId, { paymentStatus });
  }

  @Patch('invoices/:id/payment')
  updateInvoicePayment(
    @Param('id') id: string,
    @Body() dto: UpdateInvoicePaymentDto,
    @Req() req: any,
  ) {
    return this.purchaseService.updateInvoicePayment(id, dto, req.user.organizationId);
  }
}
