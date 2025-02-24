// storage/PrismaBookStorage.ts
import { PrismaClient, Book } from '@prisma/client';
import { BookStorage } from '~/interfaces/BookStorage';

const prisma = new PrismaClient();

export class PrismaBookStorage implements BookStorage {
  async getAllBooks(): Promise<Book[]> {
    return prisma.book.findMany({
      include: {
        author: true,
        publisher: true,
        series: true,
        bookType: true,
        readStatus: true,
      },
    });
  }

  async getBookById(id: string): Promise<Book | null> {
    return prisma.book.findUnique({
      where: { id },
      include: {
        author: true,
        publisher: true,
        series: true,
        bookType: true,
        readStatus: true,
      },
    });
  }

  async createBook(book: Partial<Book>): Promise<Book> {
    return prisma.book.create({
      data: book,
      include: {
        author: true,
        publisher: true,
        series: true,
        bookType: true,
        readStatus: true,
      },
    });
  }

  async updateBook(id: string, book: Partial<Book>): Promise<Book> {
    return prisma.book.update({
      where: { id },
      data: book,
      include: {
        author: true,
        publisher: true,
        series: true,
        bookType: true,
        readStatus: true,
      },
    });
  }

  async deleteBook(id: string): Promise<void> {
    await prisma.book.delete({
      where: { id },
    });
  }
}