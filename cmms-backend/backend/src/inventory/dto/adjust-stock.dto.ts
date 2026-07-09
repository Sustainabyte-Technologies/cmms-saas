import { IsUUID, IsNumber, IsOptional, IsString } from 'class-validator';

export class AdjustStockDto {
    @IsUUID()
    sparePartId: string;

    @IsUUID()
    warehouseId: string;

    @IsNumber()
    quantity: number;

    @IsOptional()
    @IsString()
    notes?: string;
}
