import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsBoolean,
  Min,
} from 'class-validator';

export class RenewAMCDto {
  @IsDateString()
  newStartDate: string;

  @IsDateString()
  newEndDate: string;

  @IsNumber()
  @Min(0)
  newContractValue: number;

  @IsOptional()
  @IsString()
  remarks?: string;

  @IsOptional()
  @IsBoolean()
  cloneContract?: boolean;
}
