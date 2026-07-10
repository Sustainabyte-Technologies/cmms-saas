import {
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateSystemDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  departmentId: string;
}