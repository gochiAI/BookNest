import { defineEventHandler, getRouterParam, createError } from 'h3';
import { getStorage } from '../utils';

export default defineEventHandler(async (event) => {
  const storage = getStorage();
  const tagId = getRouterParam(event, 'id');
  const method = event.node.req.method;

  if (!tagId) {
    throw createError({ statusCode: 400, message: 'Tag ID is required' });
  }

  try {
    if (method === 'DELETE') {
      // タグを削除
      await storage.deleteTag(tagId);
      return { message: 'Tag deleted successfully' };
    } else {
      throw createError({ statusCode: 405, message: 'Method not allowed' });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    throw createError({ statusCode: 500, message: errorMessage });
  }
});
