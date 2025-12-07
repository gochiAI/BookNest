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
      // 本にタグを追加
      const body = await readBody(event);
      const { tagId } = body;

      if (!tagId) {
        throw new Error('Tag ID is required');
      }

      await storage.addTagToBook(bookId, tagId);
      return { message: 'Tag added to book' };
    } else if (method === 'DELETE') {
      // 本からタグを削除
      const tagId = event.node.req.headers['x-tag-id'] as string;

      if (!tagId) {
        throw new Error('Tag ID is required');
      }

      await storage.removeTagFromBook(bookId, tagId);
      return { message: 'Tag removed from book' };
    } else {
      throw createError({ statusCode: 405, message: 'Method not allowed' });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    throw createError({ statusCode: 500, message: errorMessage });
  }
});
