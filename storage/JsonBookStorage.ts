import { BookStorage } from '~/interfaces/BookStorage';
import { Book } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const filePath = path.join(process.cwd(),'assets','', 'books.json');

export class JsonBookStorage implements BookStorage {
  private async readFile(): Promise<Book[]> {
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data);
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
    await fs.writeFile(filePath, JSON.stringify(books, null, 2));
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