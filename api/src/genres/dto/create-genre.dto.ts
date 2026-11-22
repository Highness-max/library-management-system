import { IsString, IsNotEmpty } from 'class-validator';

export class CreateGenreDto {
  @IsString()
  @IsNotEmpty()
  name!: string; // <-- Added !

  @IsString()
  @IsNotEmpty()
  slug!: string; // <-- Added !
}