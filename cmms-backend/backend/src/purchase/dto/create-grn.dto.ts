import { IsString, IsOptional, IsArray, ValidateNested, IsInt, IsNumber, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { InvoicePaymentStatus } from '@prisma/client';

export class GrnItemDto {
  @IsOptional()
  @IsString()
  sparePartId?: string;

  @IsInt()
  receivedQty: number;

  @IsOptional()
  @IsInt()
  rejectedQty?: number;

  @IsOptional()
  @IsNumber()
  unitPrice?: number;

  @IsOptional()
  @IsString()
  remarks?: string;
}

export class CreateGrnDto {
  @IsString()
  purchaseOrderId: string;

  @IsString()
  vendorId: string;

  @IsOptional()
  @IsString()
  warehouseId?: string;

  @IsOptional()
  @IsString()
  receivedDate?: string;

  @IsOptional()
  @IsString()
  remarks?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GrnItemDto)
  items: GrnItemDto[];
}

export class CreateInvoiceDto {
  @IsString()
  invoiceNumber: string;

  @IsString()
  vendorId: string;

  @IsOptional()
  @IsString()
  purchaseOrderId?: string;

  @IsNumber()
  invoiceAmount: number;

  @IsOptional()
  @IsString()
  invoiceDate?: string;

  @IsOptional()
  @IsString()
  paymentDueDate?: string;

  @IsOptional()
  @IsString()
  attachmentUrl?: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}

export class UpdateInvoicePaymentDto {
  @IsEnum(InvoicePaymentStatus)
  paymentStatus: InvoicePaymentStatus;

  @IsNumber()
  paidAmount: number;

  @IsOptional()
  @IsString()
  paymentDate?: string;
}
