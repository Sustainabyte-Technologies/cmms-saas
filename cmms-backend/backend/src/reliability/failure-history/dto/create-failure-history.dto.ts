import { IsString, IsNotEmpty, IsOptional, IsNumber, IsDateString } from 'class-validator';

export class CreateFailureHistoryDto {
  @IsString()
  @IsNotEmpty()
  assetId: string;

  @IsString()
  @IsOptional()
  workOrderId?: string;

  @IsString()
  @IsOptional()
  incidentId?: string;

  @IsString()
  @IsOptional()
  failureModeId?: string;

  @IsString()
  @IsNotEmpty()
  failureModeText: string;

  @IsString()
  @IsNotEmpty()
  failureCause: string;

  @IsString()
  @IsOptional()
  failureEffect?: string;

  @IsDateString()
  @IsNotEmpty()
  breakdownStart: string;

  @IsDateString()
  @IsOptional()
  breakdownEnd?: string;

  @IsNumber()
  @IsOptional()
  downtimeHours?: number;

  @IsNumber()
  @IsOptional()
  repairTimeHours?: number;

  @IsString()
  @IsOptional()
  technicianId?: string;

  @IsString()
  @IsOptional()
  supervisorId?: string;

  @IsNumber()
  @IsOptional()
  repairCost?: number;
}
