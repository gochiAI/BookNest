// storage/PrismaBookStorage.ts
import { Prisma, PrismaClient, type Book } from '@prisma/client';
import type { BookStorage } from 'interfaces/BookStorage.js';

const prisma = new PrismaClient();
type CreateBookInput = Omit<Book, 'id' | 'authorId' | 'publisherId' | 'seriesId'> & {
  author: { name: string },
  publisher: { name: string },
  series?: { name: string }
};

type UpdateBookInput = Partial<Omit<Book, 'id' | 'authorId' | 'publisherId' | 'seriesId'>> & {
  authorId?: string;
  publisherId?: string;
  seriesId?: string | null;
  author?: { name: string };
  publisher?: { name: string };
  series?: { name: string } | null;
};


export class PrismaBookStorage implements BookStorage {
  async getAllBooks(page: number, itemsPerPage: number): Promise<Book[]> {
    const validPage = Number.isInteger(page) && page > 0 ? page : 1;
    const validItemsPerPage = Number.isInteger(itemsPerPage) && itemsPerPage > 0 ? itemsPerPage : 15;

    return prisma.book.findMany({
      skip: (validPage - 1) * validItemsPerPage,
      take: validItemsPerPage,
      include: {
        author: true,
        publisher: true,
        series: true,
      },
      orderBy: [
        { title: 'asc' },
        { releaseDate: 'asc' },
      ],
    });
  }

  async getBookById(id: string): Promise<Book | null> {
    return prisma.book.findUnique({
      where: { id },
      include: {
        author: true,
        publisher: true,
        series: true,
      },
    });
  }

  async createBook(book: CreateBookInput): Promise<Book> {
    try {
      return prisma.$transaction(async (tx) => {
        const author = await tx.author.upsert({
          where: { name: book.author.name },
          update: {},
          create: { name: book.author.name }
        });

        const publisher = await tx.publisher.upsert({
          where: { name: book.publisher.name },
          update: {},
          create: { name: book.publisher.name }
        });

        let series;
        if (book.series) {
          series = await tx.series.upsert({
            where: { name: book.series.name },
            update: {},
            create: { name: book.series.name }
          });
        }

        // releaseDateをDateオブジェクトに変換
        const releaseDate = book.releaseDate ? new Date(book.releaseDate) : null;

        return tx.book.create({
          data: {
            title: book.title,
            releaseDate: releaseDate, // Dateオブジェクトを渡す
            coverUrl: book.coverUrl,
            volume: book.volume,
            isbn: book.isbn|| undefined,
            authorId: author.id,
            publisherId: publisher.id,
            seriesId: series?.id,
            bookType: book.bookType,
            readStatus: book.readStatus,
          },
          include: {
            author: true,
            publisher: true,
            series: true
          }
        });
      });
    } catch (e) {
      console.error(e);
      throw new Error('Error creating book');
    }
  }

  async updateBook(
    id: string,
    book: UpdateBookInput
  ): Promise<Book> {
    return prisma.$transaction(async (tx) => {
      const { author, publisher, series, ...updateData } = book;
  
      const bookUpdate: Prisma.BookUpdateInput = {
        ...updateData,
        author: author?.name
          ? {
              connectOrCreate: {
                where: { name: author.name },
                create: { name: author.name },
              },
            }
          : undefined,
        publisher: publisher?.name
          ? {
              connectOrCreate: {
                where: { name: publisher.name },
                create: { name: publisher.name },
              },
            }
          : undefined,
        series: series?.name
          ? {
              connectOrCreate: {
                where: { name: series.name },
                create: { name: series.name },
              },
            }
          : undefined,
      };
  
      return tx.book.update({
        where: { id },
        data: bookUpdate,
        include: {
          author: true,
          publisher: true,
          series: true,
        },
      });
    });
  }
  
  

  async deleteBook(id: string): Promise<void> {
    try {
      await prisma.book.delete({
        where: { id },
      });
    } catch (e) {
      console.error(e);
      throw new Error('Error deleting book');
    }
  }
}