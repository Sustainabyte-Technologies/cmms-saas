import { PartialType } from '@nestjs/mapped-types';
import { CreateFmecaDto } from './create-fmeca.dto';

export class UpdateFmecaDto extends PartialType(CreateFmecaDto) {}
