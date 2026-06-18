import {
  IsString,
  IsNotEmpty,
} from 'class-validator';

export class CreateWorkOrderCommentDto {
  @IsString()
  @IsNotEmpty()
  comment: string;
}