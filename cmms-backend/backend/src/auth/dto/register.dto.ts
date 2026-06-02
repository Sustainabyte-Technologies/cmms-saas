import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  companyName: string;

  @IsString()
  adminName: string;

  @IsEmail()
  adminEmail: string;

  @MinLength(8)
  password: string;
}