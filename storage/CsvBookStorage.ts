import type { BookStorage, GetBooksParams, GetBooksResult } from 'interfaces/BookStorage.js';
import { Book } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';
import { parse, stringify } from 'csv';

const filePath = path.join(process.cwd(),'assets','storage', 'books.csv');

export class CsvBookStorage implements BookStorage {
  // Implementation of CsvBookStorage

  async getBooks(params: GetBooksParams): Promise<GetBooksResult> {
    // Provide a valid implementation for getBooks
    throw new Error('Method not implemented.');
  }

  async createBook(book: Partial<Book>): Promise<Book> {
    // Provide a valid implementation for createBook
    throw new Error('Method not implemented.');
  }

  async updateBook(id: string, book: Partial<Book>): Promise<Book> {
    // Provide a valid implementation for updateBook
    throw new Error('Method not implemented.');
  }

  async deleteBook(id: string): Promise<void> {
    // Provide a valid implementation for deleteBook
    throw new Error('Method not implemented.');
  }
}