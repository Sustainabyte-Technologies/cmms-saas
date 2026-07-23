import { PartialType } from '@nestjs/mapped-types';
import { CreateFailureLibraryDto } from './create-failure-library.dto';

export class UpdateFailureLibraryDto extends PartialType(CreateFailureLibraryDto) {}
