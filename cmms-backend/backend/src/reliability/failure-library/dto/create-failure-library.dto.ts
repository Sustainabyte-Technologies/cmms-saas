import { IsString, IsNotEmpty, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { FailureSeverity } from '@prisma/client';

export class CreateFailureLibraryDto {
  @IsString()
  @IsNotEmpty()
  failureCode: string;

  @IsString()
  @IsNotEmpty()
  failureMode: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  failureCategory: string;

  @IsString()
  @IsNotEmpty()
  assetCategory: string;

  @IsEnum(FailureSeverity)
  @IsOptional()
  severity?: FailureSeverity;

  @IsString()
  @IsOptional()
  recommendedAction?: string;

  @IsBoolean()
  @IsOptional()
  status?: boolean;
}
