import { getStorage } from './utils';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  // ストレージタイプを取得（デフォルトは Prisma）
  const storageType = (event.node.req.headers['x-storage-type'] as string) || 'prisma';
  const storage = getStorage(storageType);


  // クエリパラメータを取得
  const page = parseInt(query.page as string) || 1; // ページ番号（デフォルト: 1）
  const itemsPerPage = parseInt(query.itemsPerPage as string) || 15; // 表示数（デフォルト: 15）
  const readStatus = query.readStatus as string; // 読書ステータス
  const bookType = query.bookType as string; // 書籍タイプ
  const search = query.search as string; // 検索キーワード

  try {
    // 書籍を取得
    const books = await storage.getAllBooks(page, itemsPerPage);

    // フィルタリング
    const filteredBooks = books.filter((book) => {
      const matchesReadStatus = !readStatus || book.readStatus === readStatus;
      const matchesBookType = !bookType || book.bookType === bookType;
      const matchesSearch = !search || book.title.toLowerCase().includes(search.toLowerCase());
      return matchesReadStatus && matchesBookType && matchesSearch;
    });

    return {
      books: filteredBooks,
      currentPage: page,
      totalItems: books.length,
    };
  } catch (error) {
    console.error('Error fetching books:', error);
    throw createError({ statusCode: 500, message: 'Failed to fetch books' });
  }
});