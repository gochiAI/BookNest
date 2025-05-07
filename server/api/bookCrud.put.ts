import { defineEventHandler, readBody, sendError } from 'h3';
import { validateBookData, getStorage } from './utils';

export default defineEventHandler(async (event) => {
  const storageType = (event.node.req.headers['x-storage-type'] as string) || 'prisma';
  const storage = getStorage(storageType);

  try {
    const body = await readBody(event);
    console.log('Request Body:', body); // デバッグ用ログ
    const bookId = Array.isArray(event.node.req.headers['x-book-id'])
      ? event.node.req.headers['x-book-id'][0]
      : event.node.req.headers['x-book-id'];
    console.log('Book ID:', bookId); // デバッグ用ログ

    if (!bookId) {
      throw new Error('Book ID is required');
    }

    await validateBookData(body, storageType);

    const updatedBook = await storage.updateBook(bookId, body);
    console.log('Updated Book:', updatedBook); // デバッグ用ログ
    return updatedBook;
  } catch (error) {
    console.error('Error updating book:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error put';
    return sendError(event, new Error(errorMessage));
  }
});