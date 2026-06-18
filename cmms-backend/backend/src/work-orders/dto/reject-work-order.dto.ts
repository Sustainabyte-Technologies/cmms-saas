import {
  IsString,
  IsNotEmpty,
} from 'class-validator';

export class RejectWorkOrderDto {
  @IsString()
  @IsNotEmpty()
  reason: string;
}