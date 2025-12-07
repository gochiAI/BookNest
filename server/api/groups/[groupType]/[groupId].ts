import { defineEventHandler, createError, getQuery } from 'h3';
import { getStorage } from '~/server/api/utils';

export default defineEventHandler(async (event) => {
  try {
    const storageType = (event.node.req.headers['x-storage-type'] as string) || 'prisma';
    const storage = getStorage(storageType);
    const groupType = event.context.params?.groupType as string; // 'author', 'publisher', 'series'
    const groupId = event.context.params?.groupId as string;

    // クエリパラメーターで必要な情報を指定
    const query = getQuery(event);
    const fields = (query.fields as string)?.split(',') || ['id', 'title', 'volume'];

    if (!groupType || !groupId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'groupType and groupId are required',
      });
    }

    // 全書籍を取得
    const booksResult = await storage.getBooks({ page: 1, itemsPerPage: 10000 });
    const allBooks = booksResult.books;

    // グループタイプに応じてフィルタリング
    let filteredBooks: any[] = [];

    if (groupType === 'author') {
      filteredBooks = allBooks.filter((book: any) => {
        if (!book.authors) return false;
        return book.authors.some((ab: any) => ab.author.id === groupId);
      });
    } else if (groupType === 'publisher') {
      filteredBooks = allBooks.filter((book: any) => {
        return book.publisher && book.publisher.id === groupId;
      });
    } else if (groupType === 'series') {
      filteredBooks = allBooks.filter((book: any) => {
        return book.series && book.series.id === groupId;
      });
    } else {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid groupType. Must be "author", "publisher", or "series"',
      });
    }

    // 必要なフィールドのみを返す
    const booksWithSelectedFields = filteredBooks.map((book: any) => {
      const result: any = {};
      for (const field of fields) {
        if (field === 'id') result.id = book.id;
        else if (field === 'title') result.title = book.title;
        else if (field === 'volume') result.volume = book.volume;
        else if (field === 'author') result.authors = book.authors;
        else if (field === 'coverUrl') result.coverUrl = book.coverUrl;
        else if (field === 'isbn') result.isbn = book.isbn;
      }
      return result;
    });

    return {
      groupType,
      groupId,
      count: filteredBooks.length,
      books: booksWithSelectedFields,
    };
  } catch (error) {
    console.error('Error fetching group books:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch group books',
    });
  }
});
