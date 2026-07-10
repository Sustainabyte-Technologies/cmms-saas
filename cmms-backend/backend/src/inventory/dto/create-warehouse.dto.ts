import { IsString, IsOptional } from 'class-validator';

export class CreateWarehouseDto {
    @IsString()
    name: string;

    @IsString()
    code: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsString()
    description?: string;
}
