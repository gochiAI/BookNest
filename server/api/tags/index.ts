import { defineEventHandler, readBody, createError } from 'h3';
import { getStorage } from '../utils';

export default defineEventHandler(async (event) => {
  const storage = getStorage();
  const method = event.node.req.method;

  try {
    if (method === 'GET') {
      // タグ一覧を取得
      const tags = await storage.getTags();
      return { data: tags };
    } else if (method === 'POST') {
      // 新規タグを作成
      const body = await readBody(event);
      const { name } = body;

      if (!name || typeof name !== 'string' || name.trim() === '') {
        throw new Error('Tag name is required');
      }

      const tag = await storage.createTag(name);
      return { data: tag };
    } else {
      throw createError({ statusCode: 405, message: 'Method not allowed' });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    throw createError({ statusCode: 500, message: errorMessage });
  }
});
