import {
    IsString,
    IsOptional,
    IsEnum,
    IsUUID,
    IsNumber,
    IsDateString,
} from 'class-validator';

import {
    WorkOrderPriority,
    WorkOrderType,
} from '@prisma/client';

export class CreateWorkOrderDto {
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    assetId?: string;

    @IsOptional()
    @IsString()
    category?: string;

    @IsOptional()
    @IsString()
    location?: string;

    @IsOptional()
    @IsEnum(WorkOrderPriority)
    priority?: WorkOrderPriority;

    @IsOptional()
    @IsEnum(WorkOrderType)
    workType?: WorkOrderType;

    @IsOptional()
    @IsNumber()
    estimatedHours?: number;

    @IsOptional()
    @IsString()
    assignedTechnicianId?: string;

    @IsOptional()
    @IsDateString()
    startDate?: string;

    @IsOptional()
    @IsDateString()
    dueDate?: string;

    @IsOptional()
    @IsUUID()
    checklistTemplateId?: string;
}