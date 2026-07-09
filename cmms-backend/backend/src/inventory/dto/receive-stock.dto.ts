import { IsUUID, IsNumber, IsOptional, IsString } from 'class-validator';

export class ReceiveStockDto {
    @IsUUID()
    sparePartId: string;

    @IsUUID()
    warehouseId: string;

    @IsNumber()
    quantity: number;

    @IsOptional()
    @IsString()
    notes?: string;

    @IsOptional()
    @IsString()
    referenceNumber?: string;
}
