import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateChecklistTemplateDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}