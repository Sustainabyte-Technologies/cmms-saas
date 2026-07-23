import { IsOptional, IsString } from 'class-validator';

export class GenerateAMCPMDto {
  @IsOptional()
  @IsString()
  assignedTechnicianId?: string;

  @IsOptional()
  @IsString()
  checklistTemplateId?: string;
}
