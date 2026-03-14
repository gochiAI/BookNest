import { defineEventHandler, readBody, getRouterParam, createError } from 'h3';
import { getStorage } from '../../utils';

export default defineEventHandler(async (event) => {
  const storage = getStorage();
  const bookId = getRouterParam(event, 'bookId');
  const method = event.node.req.method;

  if (!bookId) {
    throw createError({ statusCode: 400, message: 'Book ID is required' });
  }

  try {
    if (method === 'POST') {
      // コレクションに本を追加
      const body = await readBody(event);
      const { collectionId } = body;

      if (!collectionId) {
        throw new Error('Collection ID is required');
      }

      await storage.addBookToCollection(bookId, collectionId);
      return { message: 'Book added to collection' };
    } else if (method === 'DELETE') {
      // コレクションから本を削除
      const collectionId = event.node.req.headers['x-collection-id'] as string;

      if (!collectionId) {
        throw new Error('Collection ID is required');
      }

      await storage.removeBookFromCollection(bookId, collectionId);
      return { message: 'Book removed from collection' };
    } else {
      throw createError({ statusCode: 405, message: 'Method not allowed' });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    throw createError({ statusCode: 500, message: errorMessage });
  }
});
