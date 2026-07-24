import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { RcaStatus } from '@prisma/client';

export class CreateRcaDto {
  @IsString()
  @IsNotEmpty()
  assetId: string;

  @IsString()
  @IsOptional()
  incidentId?: string;

  @IsString()
  @IsOptional()
  workOrderId?: string;

  @IsString()
  @IsNotEmpty()
  rootCause: string;

  @IsString()
  @IsNotEmpty()
  causeCategory: string;

  @IsString()
  @IsOptional()
  investigationNotes?: string;

  @IsString()
  @IsOptional()
  correctiveAction?: string;

  @IsString()
  @IsOptional()
  preventiveAction?: string;

  @IsString()
  @IsOptional()
  investigatorId?: string;

  @IsEnum(RcaStatus)
  @IsOptional()
  status?: RcaStatus;
}
