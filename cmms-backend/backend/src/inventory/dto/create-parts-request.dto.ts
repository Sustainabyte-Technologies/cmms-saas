import {
    IsString,
    IsOptional,
    IsEnum,
    IsUUID,
    IsArray,
    ValidateNested,
    IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { WorkOrderPriority } from '@prisma/client';

export class PartsRequestItemDto {
    @IsUUID()
    sparePartId: string;

    @IsNumber()
    requestedQty: number;
}

export class CreatePartsRequestDto {
    @IsUUID()
    workOrderId: string;

    @IsOptional()
    @IsString()
    reason?: string;

    @IsOptional()
    @IsEnum(WorkOrderPriority)
    priority?: WorkOrderPriority;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PartsRequestItemDto)
    items: PartsRequestItemDto[];
}
