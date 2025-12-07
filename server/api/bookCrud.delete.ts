import { defineEventHandler, readBody, createError } from 'h3';
import { getStorage } from './utils';

export default defineEventHandler(async (event) => {
  const storageType = (event.node.req.headers['x-storage-type'] as string) || 'prisma';
  const storage = getStorage(storageType);

  try {
    const { id } = await readBody(event);

    // 書籍を削除
    const deletedBook = await storage.deleteBook(id);
    return deletedBook;
  } catch (error) {
    console.error('Error deleting book:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    throw createError({ statusCode: 500, message: errorMessage });
  }
});
