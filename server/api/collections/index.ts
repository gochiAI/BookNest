import { defineEventHandler, readBody, createError, getQuery } from 'h3';
import { getStorage } from '../utils';

export default defineEventHandler(async (event) => {
  const storage = getStorage();
  const method = event.node.req.method;

  console.log(`[Collections API] ${method} request received`);

  try {
    if (method === 'GET') {
      // コレクション一覧を取得
      console.log('[Collections API] Fetching collections...');
      const query = getQuery(event);
      const includeBooks = query.includeBooks === 'true';
      const limit = parseInt(query.limit as string) || 5;
      
      const collections = await storage.getCollections();
      console.log(`[Collections API] Found ${collections.length} collections`);
      
      // includeBooksがtrueの場合、各コレクションに本のプレビューを追加
      if (includeBooks) {
        for (const collection of collections) {
          if (collection.books && collection.books.length > limit) {
            collection.books = collection.books.slice(0, limit);
          }
        }
      }
      
      return { data: collections };
    } else if (method === 'POST') {
      // 新規コレクションを作成
      const body = await readBody(event);
      const { name, description } = body;

      if (!name || typeof name !== 'string' || name.trim() === '') {
        throw new Error('Collection name is required');
      }

      const collection = await storage.createCollection(name, description);
      return { data: collection };
    } else {
      throw createError({ statusCode: 405, message: 'Method not allowed' });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    console.error('[Collections API] Error:', errorMessage);
    throw createError({ statusCode: 500, message: errorMessage });
  }
});
