// storage/PrismaBookStorage.ts
import { PrismaClient, type Book } from '@prisma/client';
import type { BookStorage, GetBooksParams, GetBooksResult } from 'interfaces/BookStorage.js';

const prisma = new PrismaClient();

export class PrismaBookStorage implements BookStorage {
  async getBooks(params: GetBooksParams): Promise<GetBooksResult> {
    const {
      page = 1,
      itemsPerPage = 15,
      readStatus,
      bookType,
      search,
    } = params;

    // フィルタリング条件を構築
    const where: any = {};
    if (readStatus) {
      where.readStatus = readStatus;
    }
    if (bookType) {
      where.bookType = bookType;
    }
    if (search) {
      where.title = { contains: search };
    }

    // フィルタリング後の全件数を取得
    const totalItems = await prisma.book.count({ where });

    // ページネーションを適用して書籍を取得
    const books = await prisma.book.findMany({
      where,
      skip: (page - 1) * itemsPerPage,
      take: itemsPerPage,
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

    return { books, totalItems };
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
  async createBook(book: Partial<Book>): Promise<Book> {
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
            title: book.title || 'Untitled',
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
    book: Partial<Book>
  ): Promise<Book> {
    return prisma.$transaction(async (tx) => {
      const { author, publisher, series, releaseDate, ...updateData } = book;
  
      const bookUpdate: Prisma.BookUpdateInput = {
        ...updateData,
        releaseDate: releaseDate ? new Date(releaseDate) : null, // 修正: Date オブジェクトに変換
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