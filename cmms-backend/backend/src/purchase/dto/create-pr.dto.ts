import { IsString, IsOptional, IsEnum, IsArray, ValidateNested, IsNumber, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { PurchaseRequestPriority, PurchaseRequestStatus } from '@prisma/client';

export class PrItemDto {
  @IsOptional()
  @IsString()
  sparePartId?: string;

  @IsString()
  partDescription: string;

  @IsInt()
  quantity: number;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsNumber()
  estimatedUnitPrice?: number;
}

export class CreatePrDto {
  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  warehouseId?: string;

  @IsOptional()
  @IsEnum(PurchaseRequestPriority)
  priority?: PurchaseRequestPriority;

  @IsOptional()
  @IsString()
  requiredDate?: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PrItemDto)
  items: PrItemDto[];
}

export class UpdatePrStatusDto {
  @IsEnum(PurchaseRequestStatus)
  status: PurchaseRequestStatus;

  @IsOptional()
  @IsString()
  rejectionReason?: string;

  @IsOptional()
  @IsString()
  approvalStep?: string;
}
