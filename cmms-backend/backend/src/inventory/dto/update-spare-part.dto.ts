import { PartialType } from '@nestjs/mapped-types';
import { CreateSparePartDto } from './create-spare-part.dto';
import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateSparePartDto extends PartialType(CreateSparePartDto) {
    @IsOptional()
    @IsBoolean()
    status?: boolean;
}
