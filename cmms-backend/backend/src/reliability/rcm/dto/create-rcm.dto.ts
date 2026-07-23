import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber } from 'class-validator';
import { RcmStrategy } from '@prisma/client';

export class CreateRcmDto {
  @IsString()
  @IsNotEmpty()
  assetId: string;

  @IsString()
  @IsNotEmpty()
  assetFunction: string;

  @IsString()
  @IsNotEmpty()
  functionalFailure: string;

  @IsString()
  @IsNotEmpty()
  failureModeText: string;

  @IsEnum(RcmStrategy)
  @IsNotEmpty()
  maintenanceStrategy: RcmStrategy;

  @IsString()
  @IsOptional()
  tasksDescription?: string;

  @IsNumber()
  @IsOptional()
  intervalDays?: number;

  @IsString()
  @IsOptional()
  assignedRoleId?: string;
}
