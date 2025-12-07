import { defineEventHandler, readBody, createError } from 'h3';
import { validateBookData, getStorage } from './utils';

export default defineEventHandler(async (event) => {
  const storageType = (event.node.req.headers['x-storage-type'] as string) || 'prisma';
  const storage = getStorage(storageType);

  try {
    const body = await readBody(event);
    const bookId = Array.isArray(event.node.req.headers['x-book-id'])
      ? event.node.req.headers['x-book-id'][0]
      : event.node.req.headers['x-book-id'];

    if (!bookId) {
      throw new Error('Book ID is required');
    }

    await validateBookData(body);

    const updatedBook = await storage.updateBook(bookId, body);
    return updatedBook;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    throw createError({ statusCode: 500, message: errorMessage });
  }
});