import { PartialType } from '@nestjs/mapped-types';
import { CreateRcaDto } from './create-rca.dto';

export class UpdateRcaDto extends PartialType(CreateRcaDto) {}
