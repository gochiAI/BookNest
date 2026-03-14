import { $fetch } from 'ofetch';
import { normalizeIsbnDigits, normalizeTitleKey, normalizeWidth } from './textNormalization';
import type { Book, ExistingBooksResponse } from './types';

export type ExistingBooksFilter = (
  books: Book[],
) => Promise<{ filtered: Book[]; removedCount: number }>;

export const createExistingBooksFilter = (
  notifyWarning: (message: string) => void,
): ExistingBooksFilter => {
  const volumeKey = (volume: number | null | undefined): string =>
    volume === null || volume === undefined ? 'null' : String(volume);

  return async (books: Book[]): Promise<{ filtered: Book[]; removedCount: number }> => {
    if (!books || books.length === 0) {
      return { filtered: [], removedCount: 0 };
    }

    try {
      const payloadMap = new Map<string, { isbn: string | null; title: string; volume: number | null }>();
      books.forEach(book => {
        const isbn = book.isbn || null;
        const volume = book.volume ?? null;
        const rawTitle = (book.title || '').trim();
        const normalizedTitle = normalizeWidth(rawTitle).trim();
        const queryTitles = new Set([rawTitle]);

        if (normalizedTitle) {
          queryTitles.add(normalizedTitle);
        }

        queryTitles.forEach(title => {
          const key = `${isbn || ''}||${title}||${volumeKey(volume)}`;
          if (!payloadMap.has(key)) {
            payloadMap.set(key, { isbn, title, volume });
          }
        });
      });

      const payload = Array.from(payloadMap.values());

      const { existingIsbns = [], existingTitleVolumes = [] } =
        await $fetch<ExistingBooksResponse>('/api/bookCrud/exists', {
          method: 'POST',
          body: { books: payload },
        });

      const isbnSet = new Set(existingIsbns.map(isbn => normalizeIsbnDigits(isbn)).filter(Boolean));
      const titleVolumeSet = new Set(
        existingTitleVolumes.map(tv => `${normalizeTitleKey(tv.title || '')}||${volumeKey(tv.volume)}`),
      );

      const filtered = books.filter(book => {
        if (book.isbn && isbnSet.has(normalizeIsbnDigits(book.isbn))) return false;
        const key = `${normalizeTitleKey(book.title || '')}||${volumeKey(book.volume)}`;
        return !titleVolumeSet.has(key);
      });

      return { filtered, removedCount: books.length - filtered.length };
    } catch (error) {
      console.warn('Duplicate check failed:', error);
      notifyWarning('既存データ確認に失敗したため、重複チェックをスキップしました。');
      return { filtered: books, removedCount: 0 };
    }
  };
};
