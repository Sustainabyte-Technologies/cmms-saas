import { IsOptional, IsString } from 'class-validator';

export class UpdateChecklistTemplateDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;
}