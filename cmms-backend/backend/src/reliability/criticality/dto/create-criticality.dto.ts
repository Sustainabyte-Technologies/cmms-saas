import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class CreateAssetCriticalityDto {
  @IsString()
  @IsNotEmpty()
  assetId: string;

  @IsString()
  @IsOptional()
  customerId?: string;

  @IsString()
  @IsOptional()
  siteId?: string;

  @IsString()
  @IsOptional()
  departmentId?: string;

  @IsString()
  @IsOptional()
  systemId?: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  safetyImpact?: number;

  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  productionImpact?: number;

  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  financialImpact?: number;

  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  environmentalImpact?: number;

  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  maintenanceImpact?: number;

  @IsString()
  @IsOptional()
  reviewNotes?: string;
}
