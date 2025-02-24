// interfaces/BookStorage.ts
import { Book } from '@prisma/client';

export interface BookStorage {
  getAllBooks(): Promise<Book[]>;
  getBookById(id: string): Promise<Book | null>;
  createBook(book: Partial<Book>): Promise<Book>;
  updateBook(id: string, book: Partial<Book>): Promise<Book>;
  deleteBook(id: string): Promise<void>;
}