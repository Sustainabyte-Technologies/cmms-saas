import {
    IsString,
    IsOptional,
    IsNumber,
    IsBoolean,
    IsUUID,
} from 'class-validator';

export class CreateSparePartDto {
    @IsString()
    partCode: string;

    @IsString()
    partName: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    unit?: string;

    @IsOptional()
    @IsNumber()
    currentStock?: number;

    @IsOptional()
    @IsNumber()
    minimumStock?: number;

    @IsOptional()
    @IsNumber()
    maximumStock?: number;

    @IsOptional()
    @IsNumber()
    unitCost?: number;

    @IsOptional()
    @IsString()
    manufacturer?: string;

    @IsOptional()
    @IsString()
    imageUrl?: string;

    @IsOptional()
    @IsUUID()
    categoryId?: string;

    @IsOptional()
    @IsUUID()
    warehouseId?: string;
}
