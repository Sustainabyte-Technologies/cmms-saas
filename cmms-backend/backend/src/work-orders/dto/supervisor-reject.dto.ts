import {
  IsString,
  IsNotEmpty,
} from 'class-validator';

export class SupervisorRejectDto {
  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsString()
  @IsNotEmpty()
  reassignTechnicianId: string;
}
