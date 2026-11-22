import { IsString, IsInt, IsOptional, Min, IsNotEmpty } from 'class-validator';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  title!: string; // <-- Added !

  @IsString()
  @IsNotEmpty()
  author!: string; // <-- Added !

  @IsString()
  @IsNotEmpty()
  isbn!: string; // <-- Added !

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  publishedYear?: number;

  @IsInt()
  @Min(1)
  totalCopies!: number; // <-- Added !

  @IsInt()
  genreId!: number; // <-- Added !
}