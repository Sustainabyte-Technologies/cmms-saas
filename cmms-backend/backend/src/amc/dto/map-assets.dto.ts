import { IsArray, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { AssetCoverageDto } from './create-amc.dto';

export class MapAMCAssetsDto {
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => AssetCoverageDto)
  assets: AssetCoverageDto[];
}
