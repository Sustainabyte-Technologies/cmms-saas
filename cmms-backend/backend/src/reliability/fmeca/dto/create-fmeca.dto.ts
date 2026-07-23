import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class CreateFmecaDto {
  @IsString()
  @IsNotEmpty()
  assetId: string;

  @IsString()
  @IsOptional()
  failureModeId?: string;

  @IsString()
  @IsNotEmpty()
  failureModeText: string;

  @IsString()
  @IsNotEmpty()
  failureCause: string;

  @IsString()
  @IsNotEmpty()
  failureEffect: string;

  @IsNumber()
  @Min(1)
  @Max(10)
  @IsNotEmpty()
  severity: number;

  @IsNumber()
  @Min(1)
  @Max(10)
  @IsNotEmpty()
  occurrence: number;

  @IsNumber()
  @Min(1)
  @Max(10)
  @IsNotEmpty()
  detection: number;

  @IsString()
  @IsOptional()
  recommendedAction?: string;
}
