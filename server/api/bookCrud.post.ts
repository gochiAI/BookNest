import { defineEventHandler, readBody, sendError } from 'h3';
import { validateBookData, getStorage } from './utils';

export default defineEventHandler(async (event) => {
  const storageType = (event.node.req.headers['x-storage-type'] as string) || 'prisma';
  const storage = getStorage(storageType);

  try {
    const body = await readBody(event);
    console.log('Request Body:', body); // デバッグ用ログ

    await validateBookData(body, storageType);

    const newBook = await storage.createBook(body);
    console.log('Created Book:', newBook); // デバッグ用ログ
    return newBook;
  } catch (error) {
    console.error('Error creating book:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return sendError(event, new Error(errorMessage));
  }
});