import { defineEventHandler, createError, getQuery } from 'h3';
import { getStorage } from '~/server/api/utils';

export default defineEventHandler(async (event) => {
  try {
    const storageType = (event.node.req.headers['x-storage-type'] as string) || 'prisma';
    const storage = getStorage(storageType);
    const query = getQuery(event);
    const includeBooks = query.includeBooks === 'true';
    const limit = parseInt(query.limit as string) || 5; // デフォルト5冊

    // 全書籍を取得
    const booksResult = await storage.getBooks({ page: 1, itemsPerPage: 10000 });
    const books = booksResult.books;

    // 著者でグループ化
    const authorMap = new Map<string, { id: string; name: string; bookCount: number; books?: any[] }>();
    books.forEach((book: any) => {
      if (book.authors && book.authors.length > 0) {
        book.authors.forEach((authorBook: any) => {
          const author = authorBook.author;
          if (!authorMap.has(author.id)) {
            authorMap.set(author.id, {
              id: author.id,
              name: author.name,
              bookCount: 0,
              ...(includeBooks && { books: [] }),
            });
          }
          const entry = authorMap.get(author.id);
          if (entry) {
            entry.bookCount += 1;
            if (includeBooks && entry.books && entry.books.length < limit) {
              entry.books.push(book);
            }
          }
        });
      }
    });

    // 出版社でグループ化
    const publisherMap = new Map<string, { id: string; name: string; bookCount: number; books?: any[] }>();
    books.forEach((book: any) => {
      if (book.publisher) {
        const publisher = book.publisher;
        if (!publisherMap.has(publisher.id)) {
          publisherMap.set(publisher.id, {
            id: publisher.id,
            name: publisher.name,
            bookCount: 0,
            ...(includeBooks && { books: [] }),
          });
        }
        const entry = publisherMap.get(publisher.id);
        if (entry) {
          entry.bookCount += 1;
          if (includeBooks && entry.books && entry.books.length < limit) {
            entry.books.push(book);
          }
        }
      }
    });

    // シリーズでグループ化
    const seriesMap = new Map<string, { id: string; name: string; bookCount: number; books?: any[] }>();
    books.forEach((book: any) => {
      if (book.series) {
        const series = book.series;
        if (!seriesMap.has(series.id)) {
          seriesMap.set(series.id, {
            id: series.id,
            name: series.name,
            bookCount: 0,
            ...(includeBooks && { books: [] }),
          });
        }
        const entry = seriesMap.get(series.id);
        if (entry) {
          entry.bookCount += 1;
          if (includeBooks && entry.books && entry.books.length < limit) {
            entry.books.push(book);
          }
        }
      }
    });

    return {
      authors: Array.from(authorMap.values()).sort((a, b) => b.bookCount - a.bookCount),
      publishers: Array.from(publisherMap.values()).sort((a, b) => b.bookCount - a.bookCount),
      series: Array.from(seriesMap.values()).sort((a, b) => b.bookCount - a.bookCount),
    };
  } catch (error) {
    console.error('Error fetching groups:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch groups',
    });
  }
});
