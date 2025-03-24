import { defineEventHandler, readBody, sendError } from 'h3';
import { validateBookData, getStorage } from './utils';

export default defineEventHandler(async (event) => {
  const storageType = (event.node.req.headers['x-storage-type'] as string) || 'prisma';
  const storage = getStorage(storageType);

  try {
    const body = await readBody(event);
    const { id, ...updateData } = body;

    // バリデーション
    await validateBookData(body, storageType);

    // 書籍を更新
    const updatedBook = await storage.updateBook(id, updateData);
    return updatedBook;
  } catch (error) {
    console.error('Error updating book:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error put';
    return sendError(event, new Error(errorMessage));
  }
});