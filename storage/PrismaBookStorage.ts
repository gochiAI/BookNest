import { Prisma, PrismaClient, Book, BookType, ReadStatus, Collection, Tag } from '@prisma/client';
import type {
  BookStorage,
  GetBooksParams,
  GetBooksResult,
  BookWithRelations,
  SaveBookInput,           // ← これを使う
} from '../interfaces/BookStorage.js';

const prisma = new PrismaClient();

export class PrismaBookStorage implements BookStorage {

  // ========================================================================
  // 📚 Book Methods
  // ========================================================================

  async getBooks(params: GetBooksParams): Promise<GetBooksResult> {
    const {
      page = 1,
      itemsPerPage = 15,
      readStatus,
      bookType,
      search,
      tag,
      sortOption,
      collectionId,
      tagIds,
      tagNames,
    } = params;

    const where: Prisma.BookWhereInput = {};

    // 基本フィルタ
    if (readStatus) where.readStatus = readStatus as ReadStatus;
    if (bookType) where.bookType = bookType as BookType;

    // 検索 (タイトル、著者名、出版社、シリーズ)
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { authors: { some: { author: { name: { contains: search } } } } },
        { publisher: { name: { contains: search } } },
        { series: { name: { contains: search } } },
      ];
    }

    // コレクションフィルタ
    if (collectionId) {
      where.collections = { some: { collectionId } };
    }


    // タグフィルタ
    const tagConditions: Prisma.BookWhereInput[] = [];

    if (tag) {
      tagConditions.push({ tags: { some: { tag: { name: { contains: tag } } } } });
    }
    if (tagIds && tagIds.length > 0) {
      tagConditions.push({ tags: { some: { tagId: { in: tagIds } } } });
    }
    if (tagNames && tagNames.length > 0) {
      tagConditions.push({ tags: { some: { tag: { name: { in: tagNames } } } } });
    }

    // 条件がある場合のみ AND に追加
    if (tagConditions.length > 0) {
      where.AND = [
        ...(Array.isArray(where.AND) ? where.AND : []), // 既存のANDがあれば保持
        ...tagConditions
      ];
    }

    const totalItems = await prisma.book.count({ where });

    // ソート設定
    const orderBy: Prisma.BookOrderByWithRelationInput[] = [];
    if (sortOption === 'title-asc') {
      orderBy.push({ title: 'asc' }, { volume: 'asc' }, { volumeSuffix: 'asc' });
    } else if (sortOption === 'title-desc') {
      orderBy.push({ title: 'desc' }, { volume: 'desc' });
    } else if (sortOption === 'date-asc') {
      orderBy.push({ releaseDate: 'asc' });
    } else if (sortOption === 'date-desc') {
      orderBy.push({ releaseDate: 'desc' });
    } else {
      orderBy.push({ createdAt: 'desc' });
    }

    const books = await prisma.book.findMany({
      where,
      skip: (page - 1) * itemsPerPage,
      take: itemsPerPage,
      include: {
        authors: { include: { author: true } },
        publisher: true,
        series: true,
        collections: { include: { collection: true } },
        tags: { include: { tag: true } },
      },
      orderBy,
    });

    return { books: books as unknown as BookWithRelations[], totalItems };
  }

  async getBookById(id: string): Promise<BookWithRelations | null> {
    const book = await prisma.book.findUnique({
      where: { id },
      include: {
        authors: { include: { author: true } },
        publisher: true,
        series: true,
        collections: { include: { collection: true } },
        tags: { include: { tag: true } },
      },
    });
    return book as unknown as BookWithRelations | null;
  }

  async createBook(bookInput: SaveBookInput): Promise<Book> {
    try {
      return prisma.$transaction(async (tx) => {
        const {
          authorNames = [],
          publisherName,
          seriesName,
          collectionIds = [],
          tagIds = [],
          ...bookData
        } = bookInput;

        // Publisher
        const publisherId = publisherName
          ? (await tx.publisher.upsert({
              where: { name: publisherName as string },
              update: {},
              create: { name: publisherName as string },
            })).id
          : undefined;

        // Series
        const seriesId = seriesName
          ? (await tx.series.upsert({
              where: { name: seriesName as string },
              update: {},
              create: { name: seriesName as string },
            })).id
          : undefined;

        // Book
        const createdBook = await tx.book.create({
          data: {
            title: bookData.title ?? 'Untitled',
            releaseDate: bookData.releaseDate ? new Date(bookData.releaseDate) : null,
            coverUrl: bookData.coverUrl,
            volume: bookData.volume,
            volumeSuffix: bookData.volumeSuffix,
            isbn: bookData.isbn,
            bookType: bookData.bookType ?? 'General',
            readStatus: bookData.readStatus ?? 'Unread',
            publisherId,
            seriesId,
          },
        });

        // Authors (重複除去)
        for (const name of Array.from(new Set(authorNames))) {
          const author = await tx.author.upsert({
            where: { name: name as string },
            update: {},
            create: { name: name as string },
          });
          await tx.bookAuthor.create({
            data: { bookId: createdBook.id, authorId: author.id, role: 'Author' },
          });
        }

        // Collections: 存在チェックしてから登録
        if (collectionIds.length > 0) {
          const validCollections = await tx.collection.findMany({
            where: { id: { in: collectionIds } },
            select: { id: true },
          });
          if (validCollections.length > 0) {
            const collectionData = validCollections.map(({ id }) => ({ bookId: createdBook.id, collectionId: id }));
            if (collectionData.length > 0) {
              await tx.bookCollection.createMany({
                data: collectionData,
              });
            }
          }
        }

        // Tags: 存在チェックしてから登録
        if (tagIds.length > 0) {
          const validTags = await tx.tag.findMany({
            where: { id: { in: tagIds } },
            select: { id: true },
          });
          if (validTags.length > 0) {
            const tagData = validTags.map(({ id }) => ({ bookId: createdBook.id, tagId: id }));
            if (tagData.length > 0) {
              await tx.bookTag.createMany({
                data: tagData,
              });
            }
          }
        }

        return createdBook;
      });
    } catch (e) {
      console.error('[createBook] failed:', e);
      const msg = e instanceof Error ? e.message : 'Failed to create book';
      throw new Error(msg);
    }
  }

  async updateBook(id: string, bookInput: SaveBookInput): Promise<Book> {
    try {
      return prisma.$transaction(async (tx) => {
        const {
          authorNames,
          publisherName,
          seriesName,
          collectionIds,
          tagIds,
          publisherId,
          seriesId,
          ...bookData
        } = bookInput;

        // Book 基本情報更新
        const updated = await tx.book.update({
          where: { id },
          data: {
            ...bookData,
            releaseDate: bookData.releaseDate ? new Date(bookData.releaseDate) : undefined,
            publisher: publisherName
              ? {
                  connectOrCreate: {
                    where: { name: publisherName as string },
                    create: { name: publisherName as string },
                  },
                }
              : undefined,
            series: seriesName
              ? {
                  connectOrCreate: {
                    where: { name: seriesName as string },
                    create: { name: seriesName as string },
                  },
                }
              : undefined,
          },
        });

        // Authors 全置換（指定があれば）
        if (authorNames) {
          await tx.bookAuthor.deleteMany({ where: { bookId: id } });
          for (const name of Array.from(new Set(authorNames))) {
            const author = await tx.author.upsert({
              where: { name: name as string },
              update: {},
              create: { name: name as string },
            });
            await tx.bookAuthor.create({
              data: { bookId: id, authorId: author.id, role: 'Author' },
            });
          }
        }

        // Collections 全置換（指定があれば）
        if (collectionIds) {
          await tx.bookCollection.deleteMany({ where: { bookId: id } });
          if (collectionIds.length > 0) {
            const collectionData = (collectionIds as string[]).map((cid) => ({ bookId: id, collectionId: cid }));
            if (collectionData.length > 0) {
              await tx.bookCollection.createMany({
                data: collectionData,
              });
            }
          }
        }

        // Tags 全置換（指定があれば）
        if (tagIds) {
          await tx.bookTag.deleteMany({ where: { bookId: id } });
          if (tagIds.length > 0) {
            const tagData = (tagIds as string[]).map((tid) => ({ bookId: id, tagId: tid }));
            if (tagData.length > 0) {
              await tx.bookTag.createMany({
                data: tagData,
              });
            }
          }
        }

        return updated;
      });
    } catch (e) {
      console.error('[updateBook] failed:', e);
      const msg = e instanceof Error ? e.message : 'Failed to update book';
      throw new Error(msg);
    }
  }

  async deleteBook(id: string): Promise<void> {
    await prisma.book.delete({ where: { id } });
  }

  // ========================================================================
  // 📂 Collection Methods
  // ========================================================================

  async getCollections(): Promise<any[]> {
    const collections = await prisma.collection.findMany({ 
      orderBy: { name: 'asc' },
      include: {
        books: {
          include: {
            book: {
              include: {
                authors: { include: { author: true } },
                publisher: true,
                series: true,
              },
            },
          },
        },
      },
    });

    return collections.map(collection => ({
      ...collection,
      books: collection.books.map(cb => cb.book),
    }));
  }

  async getCollectionWithBooks(collectionId: string): Promise<any> {
    return prisma.collection.findUnique({
      where: { id: collectionId },
      include: {
        books: {
          include: {
            book: {
              include: {
                authors: { include: { author: true } },
                publisher: true,
                series: true,
              },
            },
          },
        },
      },
    }).then(collection => {
      if (!collection) return null;
      return {
        ...collection,
        books: collection.books.map(cb => cb.book),
      };
    });
  }

  async createCollection(name: string, description?: string): Promise<Collection> {
    return prisma.collection.create({ data: { name, description } });
  }

  async updateCollection(id: string, name?: string, description?: string): Promise<Collection> {
    return prisma.collection.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
      },
    });
  }

  async deleteCollection(id: string): Promise<void> {
    await prisma.collection.delete({ where: { id } });
  }

  async addBookToCollection(bookId: string, collectionId: string): Promise<void> {
    // 重複防止のため createMany か upsert 的なロジック推奨だが、
    // Prisma の create は複合主キーの重複でエラーになるため try-catch しても良い
    // ここではシンプルに作成を試みる
    try {
      await prisma.bookCollection.create({
        data: { bookId, collectionId }
      });
    } catch (e) {
      // 既に存在する場合は無視
    }
  }

  async removeBookFromCollection(bookId: string, collectionId: string): Promise<void> {
    try {
      await prisma.bookCollection.delete({
        where: { bookId_collectionId: { bookId, collectionId } },
      });
    } catch (e) {
      // 存在しない場合は無視
    }
  }

  // ========================================================================
  // 🏷️ Tag Methods
  // ========================================================================

  async getTags(): Promise<Tag[]> {
    return prisma.tag.findMany({ 
      include: { _count: { select: { books: true } } },
      orderBy: { name: 'asc' } 
    });
  }

  async createTag(name: string): Promise<Tag> {
    return prisma.tag.create({ data: { name } });
  }

  async deleteTag(id: string): Promise<void> {
    await prisma.tag.delete({ where: { id } });
  }

  async addTagToBook(bookId: string, tagId: string): Promise<void> {
    try {
      await prisma.bookTag.create({
        data: { bookId, tagId }
      });
    } catch (e) {
      // 重複無視
    }
  }

  async removeTagFromBook(bookId: string, tagId: string): Promise<void> {
    try {
      await prisma.bookTag.delete({
        where: { bookId_tagId: { bookId, tagId } },
      });
    } catch (e) {
      // 存在しない場合無視
    }
  }
}