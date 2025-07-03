import { Book } from '@prisma/client';


// 検索・フィルタリング・ページネーション条件をまとめた型
export interface GetBooksParams {
  page?: number; // ページ番号 (デフォルト値を持つ場合があるためオプショナル)
  itemsPerPage?: number; // 表示数 (デフォルト値を持つ場合があるためオプショナル)
  readStatus?: string; // 読書ステータス (オプショナル)
  bookType?: string; // 書籍タイプ (オプショナル)
  search?: string; // 検索キーワード (オプショナル)
  sortOption?: string; // ソート条件 (オプショナル)
}

// 取得結果の型 (アイテムリストと合計件数を含む)
export interface GetBooksResult {
  books: Book[];
  totalItems: number; // フィルタリング後の全件数
}

export interface BookStorage {
  // 検索、フィルタリング、ページネーション条件を受け取るメソッド
  getBooks(params: GetBooksParams): Promise<GetBooksResult>;
  createBook(book: Partial<Book>): Promise<Book>;
  updateBook(id: string, book: Partial<Book>): Promise<Book>;
  deleteBook(id: string): Promise<void>;
}