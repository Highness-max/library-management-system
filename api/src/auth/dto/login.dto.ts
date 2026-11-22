import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email!: string; // <-- Added !

  @IsString()
  @MinLength(6)
  password!: string; // <-- Added !
}