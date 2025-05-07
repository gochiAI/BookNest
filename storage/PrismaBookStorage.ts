// storage/PrismaBookStorage.ts
import { Prisma, PrismaClient,Book } from '@prisma/client';
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
      sortOption, // ソート条件を受け取る
    } = params;

    const where: any = {};
    if (readStatus) {
      where.readStatus = readStatus;
    }
    if (bookType) {
      where.bookType = bookType;
    }
    if (search) {
      where.OR = [
        { title: { contains: search} }, // タイトルで検索
        { author: { name: { contains: search,} } }, // 著者名で検索
        { publisher: { name: { contains: search,} } }, // 出版社名で検索
        { series: { name: { contains: search,} } }, // シリーズ名で検索
      ];
    }

    const totalItems = await prisma.book.count({ where });

    // ソート条件を動的に設定
    const orderBy: any[] = [];
    if (sortOption === 'title-asc') {
      orderBy.push({ title: 'asc' });
      orderBy.push({ volume: 'asc' });
    } else if (sortOption === 'title-desc') {
      orderBy.push({ title: 'desc' });
      orderBy.push({ volume: 'desc' });
    } else if (sortOption === 'date-asc') {
      orderBy.push({ releaseDate: 'asc' });
    } else if (sortOption === 'date-desc') {
      orderBy.push({ releaseDate: 'desc' });
    }
    

    const books = await prisma.book.findMany({
      where,
      skip: (page - 1) * itemsPerPage,
      take: itemsPerPage,
      include: {
        author: true,
        publisher: true,
        series: true,
      },
      orderBy, // 動的なソート条件を適用
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
  async createBook(book: Book): Promise<Book> {
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

        const series = await tx.series.upsert({
          where: { name: book.series.name },
          update: {},
          create: { name: book.series.name }
        });

        // releaseDateをDateオブジェクトに変換
        const releaseDate = book.releaseDate ? new Date(book.releaseDate) : null;

        return tx.book.create({
          data: {
            title: book.title || 'Untitled',
            releaseDate: releaseDate, // Dateオブジェクトを渡す
            coverUrl: book.coverUrl,
            volume: book.volume,
            isbn: book.isbn|| undefined,
            author: {
              connect: { id: author.id }, // リレーションを設定
            },
            publisher: {
              connect: { id: publisher.id }, // リレーションを設定
            },
            series: series
              ? {
                  connect: { id: series.id }, // リレーションを設定
                }
              : undefined,
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