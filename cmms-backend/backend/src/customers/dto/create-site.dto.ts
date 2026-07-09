import {
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateSiteDto {
  @IsString()
  name: string;

  @IsString()
  customerId: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  assignedSupervisorId?: string | null;
}
