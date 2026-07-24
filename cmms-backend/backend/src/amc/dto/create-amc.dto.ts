import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
  IsArray,
  IsBoolean,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ContractType, AMCStatus } from '../enums/amc.enums';
import { PMFrequency } from '@prisma/client';

export class AssetCoverageDto {
  @IsString()
  @IsNotEmpty()
  assetId: string;

  @IsOptional()
  @IsString()
  coverageType?: string;

  @IsOptional()
  @IsBoolean()
  warrantyIncluded?: boolean;

  @IsOptional()
  @IsString()
  remarks?: string;
}

export class CreateAMCDto {
  @IsString()
  @IsNotEmpty()
  contractName: string;

  @IsString()
  @IsNotEmpty()
  customerId: string;

  @IsString()
  @IsNotEmpty()
  siteId: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsEnum(ContractType)
  contractType: ContractType;

  @IsOptional()
  @IsEnum(AMCStatus)
  status?: AMCStatus;

  @IsNumber()
  @Min(0)
  contractValue: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  slaResponseTime?: number; // in hours

  @IsOptional()
  @IsNumber()
  @Min(1)
  slaResolutionTime?: number; // in hours

  @IsOptional()
  @IsEnum(PMFrequency)
  serviceFrequency?: PMFrequency;

  @IsOptional()
  @IsNumber()
  @Min(1)
  numberOfVisits?: number;

  @IsOptional()
  @IsString()
  assignedManagerId?: string;

  @IsOptional()
  @IsString()
  remarks?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AssetCoverageDto)
  assets?: AssetCoverageDto[];
}
