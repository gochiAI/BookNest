import { defineEventHandler, createError } from 'h3';
import { getStorage } from '../utils';

export default defineEventHandler(async (event) => {
  const storageType = (event.node.req.headers['x-storage-type'] as string) || 'prisma';
  const storage = getStorage(storageType);

  try {
    const bookId = Array.isArray(event.node.req.headers['x-book-id'])
      ? event.node.req.headers['x-book-id'][0]
      : event.node.req.headers['x-book-id']; // ヘッダーからIDを取得

    if (!bookId) {
      throw new Error('Book ID is required');
    }

    if (!storage.getBookById) {
      throw new Error('getBookById is not implemented for this storage');
    }

    // 書籍情報を取得
    const book = await storage.getBookById(bookId);

    if (!book) {
      throw new Error(`Book with ID ${bookId} not found`);
    }

    return book;
  } catch (error) {
    console.error('Error fetching book:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    throw createError({ statusCode: 500, message: errorMessage });
  }
});
