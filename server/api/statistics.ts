import { createError, defineEventHandler } from 'h3';
import { getStorage } from './utils';

export default defineEventHandler(async (event) => {
  try {
    const storageType = (event.node.req.headers['x-storage-type'] as string) || 'prisma';
    const storage = getStorage(storageType);

    // 全書籍数
    const booksResult = await storage.getBooks({ page: 1, itemsPerPage: 10000 });
    const books = booksResult.books;
    const totalBooks = booksResult.totalItems;

    // コレクション統計
    const collections = await storage.getCollections();
    const totalCollections = collections.length;
    const avgBooksPerCollection = totalCollections > 0 ? Math.round(totalBooks / totalCollections * 10) / 10 : 0;

    // タグ統計
    const tags = await storage.getTags();
    const totalTags = tags.length;

    // 著者統計
    const authorMap = new Map();
    books.forEach((book: any) => {
      if (book.authors && book.authors.length > 0) {
        book.authors.forEach((authorBook: any) => {
          const authorId = authorBook.author.id;
          authorMap.set(authorId, authorBook.author.name);
        });
      }
    });
    const totalAuthors = authorMap.size;
    const topAuthor = authorMap.size > 0 ? Array.from(authorMap.values())[0] : null;

    // 出版社統計
    const publisherMap = new Map();
    books.forEach((book: any) => {
      if (book.publisher) {
        publisherMap.set(book.publisher.id, {
          name: book.publisher.name,
          count: (publisherMap.get(book.publisher.id)?.count || 0) + 1,
        });
      }
    });
    const totalPublishers = publisherMap.size;
    const topPublisher = Array.from(publisherMap.values()).sort((a: any, b: any) => b.count - a.count)[0];

    // シリーズ統計
    const seriesMap = new Map();
    books.forEach((book: any) => {
      if (book.series) {
        seriesMap.set(book.series.id, {
          name: book.series.name,
          count: (seriesMap.get(book.series.id)?.count || 0) + 1,
        });
      }
    });
    const totalSeries = seriesMap.size;
    const topSeries = Array.from(seriesMap.values()).sort((a: any, b: any) => b.count - a.count)[0];

    // 巻数統計
    const volumeStats = {
      min: books.length > 0 ? Math.min(...books.map((b: any) => b.volume || 0)) : 0,
      max: books.length > 0 ? Math.max(...books.map((b: any) => b.volume || 0)) : 0,
      avg: books.length > 0 ? Math.round(
        books.reduce((sum: number, b: any) => sum + (b.volume || 0), 0) / books.length * 10
      ) / 10 : 0,
    };

    // 出版年統計
    const publishYears = books
      .map((b: any) => b.publishedDate ? new Date(b.publishedDate).getFullYear() : null)
      .filter((y: any): y is number => y !== null);
    const oldestYear = publishYears.length > 0 ? Math.min(...publishYears) : null;
    const newestYear = publishYears.length > 0 ? Math.max(...publishYears) : null;

    // ページ数統計
    const pageNumbers = books.map((b: any) => b.pageNumber).filter((p: any) => p !== null && p !== 0);
    const pageStats = pageNumbers.length > 0 ? {
      min: Math.min(...pageNumbers),
      max: Math.max(...pageNumbers),
      avg: Math.round(
        pageNumbers.reduce((sum: number, p: any) => sum + p, 0) / pageNumbers.length * 10
      ) / 10,
    } : null;

    return {
      summary: {
        totalBooks,
        totalCollections,
        totalTags,
        totalAuthors,
        totalPublishers,
        totalSeries,
      },
      average: {
        booksPerCollection: avgBooksPerCollection,
      },
      topItems: {
        author: topAuthor,
        publisher: topPublisher?.name || null,
        series: topSeries?.name || null,
      },
      volume: volumeStats,
      publishYear: {
        oldest: oldestYear,
        newest: newestYear,
      },
      pageNumber: pageStats,
      distributionByPublisher: Array.from(publisherMap.values())
        .sort((a: any, b: any) => b.count - a.count)
        .slice(0, 10)
        .map((p: any) => ({
          name: p.name,
          count: p.count,
          percentage: Math.round(p.count / totalBooks * 1000) / 10,
        })),
      distributionBySeries: Array.from(seriesMap.values())
        .sort((a: any, b: any) => b.count - a.count)
        .slice(0, 10)
        .map((s: any) => ({
          name: s.name,
          count: s.count,
          percentage: Math.round(s.count / totalBooks * 1000) / 10,
        })),
    };
  } catch (error) {
    console.error('Error fetching statistics:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch statistics',
    });
  }
});
