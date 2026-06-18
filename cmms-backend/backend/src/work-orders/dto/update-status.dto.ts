import {
  IsEnum,
  IsOptional,
  IsString,
  IsNumber,
} from 'class-validator';

import { WorkOrderStatus } from '@prisma/client';

export class UpdateWorkOrderStatusDto {
  @IsEnum(WorkOrderStatus)
  status: WorkOrderStatus;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  resolutionNotes?: string;

  @IsOptional()
  @IsNumber()
  actualHours?: number;
}