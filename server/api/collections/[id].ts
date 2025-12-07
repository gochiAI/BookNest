import { defineEventHandler, readBody, getRouterParam, createError } from 'h3';
import { getStorage } from '../utils';

export default defineEventHandler(async (event) => {
  const storage = getStorage();
  const collectionId = getRouterParam(event, 'id');
  const method = event.node.req.method;

  if (!collectionId) {
    throw createError({ statusCode: 400, message: 'Collection ID is required' });
  }

  try {
    if (method === 'GET') {
      // コレクション詳細と関連する本を取得
      const collection = await storage.getCollectionWithBooks(collectionId);
      return { data: collection };
    } else if (method === 'PUT') {
      // コレクションを更新
      const body = await readBody(event);
      const { name, description } = body;

      const collection = await storage.updateCollection(collectionId, name, description);
      return { data: collection };
    } else if (method === 'DELETE') {
      // コレクションを削除
      await storage.deleteCollection(collectionId);
      return { message: 'Collection deleted successfully' };
    } else {
      throw createError({ statusCode: 405, message: 'Method not allowed' });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    throw createError({ statusCode: 500, message: errorMessage });
  }
});
