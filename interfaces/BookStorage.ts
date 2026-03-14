import { Book, Author, Publisher, Series, Collection, Tag } from '@prisma/client';

// 追加: 保存時に受け取る拡張入力型
export type SaveBookInput = Partial<Book> & {
  authorNames?: string[];
  publisherName?: string;
  seriesName?: string;
  collectionIds?: string[];
  tagIds?: string[];
};

// Bookに関連データを含む型
export type BookWithRelations = Book & {
  authors: Array<{ author: Author; role: string | null }>;
  publisher: Publisher | null;
  series: Series | null;
  collections: Array<{ collection: Collection }>;
  tags: Array<{ tag: Tag }>;
};

export type CollectionWithBooks = Collection & {
  books?: BookWithRelations[];
};

// 検索・フィルタリング・ページネーション条件をまとめた型
export interface GetBooksParams {
  page?: number;
  itemsPerPage?: number;
  readStatus?: string;
  bookType?: string;
  search?: string;
  tag?: string; // 単一タグ検索を追加
  sortOption?: string;
  collectionId?: string;
  tagIds?: string[];
  tagNames?: string[];
}

// 取得結果の型
export interface GetBooksResult {
  books: BookWithRelations[];
  totalItems: number;
}

export interface BookStorage {
  getBooks(params: GetBooksParams): Promise<GetBooksResult>;
  getBookById?(id: string): Promise<BookWithRelations | null>;
  createBook(book: SaveBookInput): Promise<Book>;          // 更新
  updateBook(id: string, book: SaveBookInput): Promise<Book>; // 更新
  deleteBook(id: string): Promise<void>;

  findExistingBooks(queries: Array<{ isbn?: string | null; title?: string; volume?: number | null }>): Promise<{
    existingIsbns: string[];
    existingTitleVolumes: Array<{ title: string; volume: number | null; id: string }>;
  }>;
  
  // Collection管理
  getCollections(): Promise<CollectionWithBooks[]>;
  getCollectionWithBooks?(collectionId: string): Promise<CollectionWithBooks | null>;
  createCollection(name: string, description?: string): Promise<Collection>;
  updateCollection(id: string, name?: string, description?: string): Promise<Collection>;
  deleteCollection(id: string): Promise<void>;
  addBookToCollection(bookId: string, collectionId: string): Promise<void>;
  removeBookFromCollection(bookId: string, collectionId: string): Promise<void>;
  
  // Tag管理
  getTags(): Promise<Tag[]>;
  createTag(name: string): Promise<Tag>;
  deleteTag(id: string): Promise<void>;
  addTagToBook(bookId: string, tagId: string): Promise<void>;
  removeTagFromBook(bookId: string, tagId: string): Promise<void>;
}
