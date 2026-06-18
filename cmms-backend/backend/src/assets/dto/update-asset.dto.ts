import { PartialType } from '@nestjs/mapped-types';
import { CreateAssetDto } from './create-asset.dto';
import { AssetStatus } from '@prisma/client';
import { IsOptional, IsEnum } from 'class-validator';

export class UpdateAssetDto extends PartialType(
  CreateAssetDto,
) {
  @IsOptional()
  @IsEnum(AssetStatus)
  status?: AssetStatus;
}