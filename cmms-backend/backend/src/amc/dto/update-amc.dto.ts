import { PartialType } from '@nestjs/mapped-types';
import { CreateAMCDto } from './create-amc.dto';

export class UpdateAMCDto extends PartialType(CreateAMCDto) {}
