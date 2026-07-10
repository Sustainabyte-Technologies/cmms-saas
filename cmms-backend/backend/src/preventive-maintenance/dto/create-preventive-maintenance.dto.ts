import {
    IsString,
    IsOptional,
    IsEnum,
    IsUUID,
    IsDateString,
    IsNumber,
} from 'class-validator';

import {
    PMFrequency,
} from '@prisma/client';

export class CreatePreventiveMaintenanceDto {
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsUUID()
    assetId: string;

    @IsOptional()
    @IsUUID()
    checklistTemplateId?: string;

    @IsEnum(PMFrequency)
    frequency: PMFrequency;

    @IsDateString()
    startDate: string;

    @IsOptional()
    @IsUUID()
    assignedTechnicianId?: string;

    @IsOptional()
    @IsNumber()
    estimatedHours?: number;
}