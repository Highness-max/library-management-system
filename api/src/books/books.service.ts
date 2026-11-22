import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class BooksService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateBookDto) {
    const existing = await this.prisma.book.findUnique({ where: { isbn: dto.isbn } });
    if (existing) throw new ConflictException('Book with this ISBN already exists');

    return this.prisma.book.create({
      data: {
        ...dto,
        availableCopies: dto.totalCopies, // Initialize available copies
      },
      include: { genre: true },
    });
  }

  async findAll(query: { genreId?: string; search?: string; page?: string; limit?: string }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.BookWhereInput = {};

    if (query.genreId) where.genreId = Number(query.genreId);
    
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { author: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [total, data] = await Promise.all([
      this.prisma.book.count({ where }),
      this.prisma.book.findMany({
        where,
        skip,
        take: limit,
        include: { genre: true },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const book = await this.prisma.book.findUnique({
      where: { id },
      include: { genre: true, reviews: true },
    });
    if (!book) throw new NotFoundException(`Book with ID ${id} not found`);
    return book;
  }

  async update(id: number, dto: UpdateBookDto) {
    await this.findOne(id);
    return this.prisma.book.update({
      where: { id },
      data: dto,
      include: { genre: true },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    try {
      return await this.prisma.book.delete({ where: { id } });
    } catch (error) {
      throw new ConflictException('Cannot delete book because it has active borrow requests or reviews.');
    }
  }
}