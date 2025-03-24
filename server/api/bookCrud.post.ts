import { defineEventHandler, readBody, sendError } from 'h3';
import { validateBookData, getStorage } from './utils';

export default defineEventHandler(async (event) => {
  const storageType = (event.node.req.headers['x-storage-type'] as string) || 'prisma';
  const storage = getStorage(storageType);

  try {
    const body = await readBody(event);

    // ISBNのバリデーション（空白を許可）
    const isbnRegex = /^\d{13}$/;
    if (body.isbn && !isbnRegex.test(body.isbn)) {
      throw new Error('ISBN must be a 13-digit number or empty.');
    }

    // 必須フィールドのバリデーション
    if (!body.author || !body.author.name) {
      throw new Error('Author name is required');
    }
    if (!body.publisher || !body.publisher.name) {
      throw new Error('Publisher name is required');
    }

    // 書籍を作成
    const newBook = await storage.createBook(body);
    return newBook;
  } catch (error) {
    console.error('Error creating book:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return sendError(event, new Error(errorMessage));
  }
});