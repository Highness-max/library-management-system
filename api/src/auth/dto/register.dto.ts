import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { Role } from '@prisma/client';

export class RegisterDto {
  @IsString()
  name!: string; // <-- Added !

  @IsEmail()
  email!: string; // <-- Added !

  @IsString()
  @MinLength(6)
  password!: string; // <-- Added !

  @IsOptional()
  @IsEnum(Role)
  role?: Role; // This one is optional, so it already has a ?
}