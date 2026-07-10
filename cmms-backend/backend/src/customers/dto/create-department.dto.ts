import {
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateDepartmentDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  siteId: string;

  @IsOptional()
  @IsString()
  assignedSupervisorId?: string | null;
}