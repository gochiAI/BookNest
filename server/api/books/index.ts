import { defineEventHandler, readBody, createError, getQuery } from 'h3';
import { BookStorage } from '~/interfaces/BookStorage';
import { PrismaBookStorage } from '~/storage/PrismaBookStorage';
import { JsonBookStorage } from '~/storage/JsonBookStorage';
import { CsvBookStorage } from '~/storage/CsvBookStorage';
import { MongoBookStorage } from '~/storage/MongoBookStorage';
import fs from 'fs/promises';
import path from 'path';

const settingsFilePath = path.join(process.cwd(), 'config', 'settings.json');

let bookStorage: BookStorage;

async function loadStorageType() {
  try {
    const data = await fs.readFile(settingsFilePath, 'utf-8');
    const settings = JSON.parse(data);
    switch (settings.storageType) {
      case 'json':
        bookStorage = new JsonBookStorage();
        break;
      case 'csv':
        bookStorage = new CsvBookStorage();
        break;
      case 'mongo':
        bookStorage = new MongoBookStorage();
        break;
      case 'prisma':
      default:
        bookStorage = new PrismaBookStorage();
        break;
    }
  } catch (error) {
    console.error('Error loading storage type:', error);
    bookStorage = new PrismaBookStorage(); // デフォルトのストレージタイプ
  }
}

loadStorageType();

export default defineEventHandler(async (event) => {
  const method = event.node.req.method;

  if (method === 'GET') {
    try {
      const query = getQuery(event);
      const { readStatus, bookType, search } = query;

      let books = await bookStorage.getAllBooks();

      if (readStatus && readStatus !== 'all') {
        books = books.filter(book => book.readStatusId === readStatus);
      }

      if (bookType && bookType !== 'all') {
        books = books.filter(book => book.bookTypeId === bookType);
      }

      if (search) {
        const searchLower = typeof search === 'string' ? search.toLowerCase() : '';
        books = books.filter(book => book.title.toLowerCase().includes(searchLower));
      }

      return books;
    } catch (e: any) {
      throw createError({
        status: 500,
        statusText: 'Internal Server Error',
        message: e.message,
      });
    }
  } else if (method === 'POST') {
    const body = await readBody(event);
    if (!body.title || !body.authorName || !body.publisherName || !body.bookTypeId || !body.readStatusId) {
      throw createError({
        status: 400,
        statusText: 'Bad Request',
        message: 'title, authorName, publisherName, bookTypeId, and readStatusId are required',
      });
    }

    try {
      const newBook = await bookStorage.createBook(body);
      return newBook;
    } catch (e: any) {
      throw createError({
        status: 500,
        statusText: 'Internal Server Error',
        message: e.message,
      });
    }
  }
});
