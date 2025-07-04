import { defineEventHandler, readBody, sendError } from 'h3';
import { validateBookData, getStorage } from './utils';

export default defineEventHandler(async (event) => {
  const storageType = (event.node.req.headers['x-storage-type'] as string) || 'prisma';
  const storage = getStorage(storageType);

  try {
    const body = await readBody(event);

    await validateBookData(body, storageType);

    const newBook = await storage.createBook(body);
    return newBook;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return sendError(event, new Error(errorMessage));
  }
});