import { IsOptional, IsString } from 'class-validator';

export class IssueStockDto {
    @IsOptional()
    @IsString()
    notes?: string;
}
