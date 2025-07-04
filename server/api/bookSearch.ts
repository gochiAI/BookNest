import { getStorage } from './utils';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  // ストレージタイプを取得（デフォルトは Prisma）
  const storageType = (event.node.req.headers['x-storage-type'] as string) || 'prisma';
  const storage = getStorage(storageType);

  // クエリパラメータを取得
  const page = parseInt(query.page as string) || 1;
  const itemsPerPage = parseInt(query.itemsPerPage as string) || 15;
  const readStatus = query.readStatus as string;
  const bookType = query.bookType as string;
  const search = query.search as string;
  const sortOption = query.sortOption as string; // ソート条件を取得

  try {
    // ストレージ層で検索、フィルタリング、ページネーションを適用
    const { books, totalItems } = await storage.getBooks({
      page,
      itemsPerPage,
      readStatus,
      bookType,
      search,
      sortOption, // ソート条件を渡す
    });

    // レスポンスを返す
    return {
      data: {
        books,
        currentPage: page,
        totalItems,
      },
    };
  } catch (error) {
    console.error('Error fetching books:', error);
    throw createError({ statusCode: 500, message: 'Failed to fetch books' });
  }
});