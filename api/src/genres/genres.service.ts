import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';

@Injectable()
export class GenresService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateGenreDto) {
    const existing = await this.prisma.genre.findFirst({
      where: { OR: [{ name: dto.name }, { slug: dto.slug }] }
    });
    if (existing) throw new ConflictException('Genre name or slug already exists');
    
    return this.prisma.genre.create({ data: dto });
  }

  async findAll() {
    return this.prisma.genre.findMany({
      include: { _count: { select: { books: true } } }, // Shows how many books are in each genre
    });
  }

  async findOne(id: number) {
    const genre = await this.prisma.genre.findUnique({ 
      where: { id },
      include: { books: true } 
    });
    if (!genre) throw new NotFoundException(`Genre with ID ${id} not found`);
    return genre;
  }

  async update(id: number, dto: UpdateGenreDto) {
    await this.findOne(id); 
    return this.prisma.genre.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    try {
      return await this.prisma.genre.delete({ where: { id } });
    } catch (error) {
      throw new ConflictException('Cannot delete genre because it has associated books.');
    }
  }
}