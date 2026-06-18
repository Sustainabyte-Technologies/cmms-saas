import {
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateWorkOrderAttachmentDto {
  @IsOptional()
  @IsString()
  attachmentType?: string;
}