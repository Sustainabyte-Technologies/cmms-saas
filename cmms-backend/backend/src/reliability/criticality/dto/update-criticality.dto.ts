import { PartialType } from '@nestjs/mapped-types';
import { CreateAssetCriticalityDto } from './create-criticality.dto';

export class UpdateAssetCriticalityDto extends PartialType(CreateAssetCriticalityDto) {}
