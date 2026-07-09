import { PartialType } from '@nestjs/mapped-types';
import { CreatePreventiveMaintenanceDto } from './create-preventive-maintenance.dto';

export class UpdatePreventiveMaintenanceDto extends PartialType(
    CreatePreventiveMaintenanceDto,
) {}