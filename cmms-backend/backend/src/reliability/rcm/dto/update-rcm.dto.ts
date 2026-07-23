import { PartialType } from '@nestjs/mapped-types';
import { CreateRcmDto } from './create-rcm.dto';

export class UpdateRcmDto extends PartialType(CreateRcmDto) {}
