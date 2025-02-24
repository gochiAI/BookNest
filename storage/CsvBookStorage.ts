import { BookStorage } from '~/interfaces/BookStorage';
import { Book } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';
import { parse, stringify } from 'csv';

const filePath = path.join(process.cwd(),'assets','storage', 'books.csv');

export class CsvBookStorage implements BookStorage {
  private async readFile(): Promise<Book[]> {
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      return parse(data, { columns: true }) as Book[];
    } catch (error) {
      // ファイルが存在しない場合は空の配列を返す
      if (error.code === 'ENOENT') {
        await this.writeFile([]);
        return [];
      }
      throw error;
    }
  }

  private async writeFile(books: Book[]): Promise<void> {
    const data = stringify(books, { header: true });
    await fs.writeFile(filePath, data);
  }

  async getAllBooks(): Promise<Book[]> {
    return this.readFile();
  }

  async getBookById(id: string): Promise<Book | null> {
    const books = await this.readFile();
    return books.find(book => book.id === id) || null;
  }

  async createBook(book: Partial<Book>): Promise<Book> {
    const books = await this.readFile();
    const newBook = { ...book, id: String(books.length + 1) } as Book;
    books.push(newBook);
    await this.writeFile(books);
    return newBook;
  }

  async updateBook(id: string, book: Partial<Book>): Promise<Book> {
    const books = await this.readFile();
    const index = books.findIndex(b => b.id === id);
    if (index === -1) throw new Error('Book not found');
    books[index] = { ...books[index], ...book };
    await this.writeFile(books);
    return books[index];
  }

  async deleteBook(id: string): Promise<void> {
    const books = await this.readFile();
    const index = books.findIndex(b => b.id === id);
    if (index === -1) throw new Error('Book not found');
    books.splice(index, 1);
    await this.writeFile(books);
  }
}