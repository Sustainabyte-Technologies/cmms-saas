import { IsString, IsOptional, IsBoolean, IsNumber, IsEmail, IsEnum } from 'class-validator';
import { VendorStatus } from '@prisma/client';

export class CreateVendorDto {
  @IsString()
  vendorName: string;

  @IsOptional()
  @IsString()
  vendorCode?: string;

  @IsOptional()
  @IsString()
  vendorType?: string;

  @IsOptional()
  @IsString()
  supplierCategory?: string;

  @IsOptional()
  @IsString()
  contactPerson?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  mobile?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsString()
  gstNumber?: string;

  @IsOptional()
  @IsString()
  panNumber?: string;

  @IsOptional()
  @IsString()
  taxRegistration?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsString()
  paymentTerms?: string;

  @IsOptional()
  @IsNumber()
  creditLimit?: number;

  @IsOptional()
  @IsNumber()
  leadTimeDays?: number;

  @IsOptional()
  @IsString()
  supportedCategories?: string;

  @IsOptional()
  @IsString()
  supportedSpareParts?: string;

  @IsOptional()
  @IsBoolean()
  warrantySupport?: boolean;

  @IsOptional()
  @IsBoolean()
  amcSupport?: boolean;

  @IsOptional()
  @IsBoolean()
  serviceSupport?: boolean;

  @IsOptional()
  @IsEnum(VendorStatus)
  status?: VendorStatus;

  @IsOptional()
  @IsNumber()
  rating?: number;

  @IsOptional()
  @IsString()
  remarks?: string;

  @IsOptional()
  @IsString()
  attachments?: string;
}
