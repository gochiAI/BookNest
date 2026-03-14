import { $fetch } from 'ofetch';
import type { Ref } from 'vue';
import type { Book } from './types';
import type { ExistingBooksFilter } from './deduplication';

interface RegisterFlowDeps {
  selectedBooks: Ref<Book[]>;
  isLoading: Ref<boolean>;
  filterExistingBooks: ExistingBooksFilter;
  enrichBookInfo: (book: Book) => Promise<Book | null>;
  notifyInfo: (message: string) => void;
  notifyWarning: (message: string) => void;
  notifySuccess: (message: string) => void;
  notifyError: (message: string) => void;
}

export const createRegisterBooksHandler = ({
  selectedBooks,
  isLoading,
  filterExistingBooks,
  enrichBookInfo,
  notifyInfo,
  notifyWarning,
  notifySuccess,
  notifyError,
}: RegisterFlowDeps) => {
  const fetchLocalCoverUrl = async (book: Book): Promise<string | undefined> => {
    try {
      if (book.coverUrl && book.coverUrl.startsWith('/covers/')) {
        return book.coverUrl;
      }

      const isbn = (book.isbn || '').replace(/\D/g, '');
      const title = (book.title || '').trim();
      if (!isbn && !title) return undefined;

      const response = await $fetch<{ coverUrl?: string | null }>('/api/bookCrud/cover', {
        method: 'POST',
        body: {
          isbn: isbn || undefined,
          title: title || undefined,
          volume: book.volume ?? undefined,
          candidateUrl: book.selectedCoverRemoteUrl || undefined,
          candidateSource: book.coverSource || undefined,
        },
      });

      return response.coverUrl || undefined;
    } catch (error) {
      // 書影取得に失敗しても登録自体は継続する
      console.warn('[registerBooks] cover fetch failed:', error);
      return undefined;
    }
  };

  const registerBooks = async (): Promise<void> => {
    let booksToRegister = selectedBooks.value.filter(book => book.selected);

    if (booksToRegister.length === 0) {
      notifyWarning('登録する書籍を選択してください。');
      return;
    }

    const { filtered: dedupedBooks, removedCount: skippedCount } = await filterExistingBooks(booksToRegister);
    if (skippedCount > 0) {
      notifyInfo(`${skippedCount}冊は既に登録済みのため除外しました。`);
    }

    if (dedupedBooks.length === 0) {
      notifyInfo('既存データのみのため、新規登録はありません。');
      const dedupIds = new Set(dedupedBooks.map(b => b.id));
      selectedBooks.value = selectedBooks.value.filter(book => !book.selected || dedupIds.has(book.id));
      return;
    }

    const dedupIds = new Set(dedupedBooks.map(b => b.id));
    selectedBooks.value = selectedBooks.value.filter(book => !book.selected || dedupIds.has(book.id));
    booksToRegister = dedupedBooks;

    isLoading.value = true;

    try {
      let successCount = 0;
      let enrichedCount = 0;

      for (const book of booksToRegister) {
        let bookToRegister: Book | null = { ...book };

        const hasTitle = !!book.title;
        const hasAuthor = !!book.author;
        const hasPublisher = !!book.publisher;

        if (!hasTitle || !hasAuthor || !hasPublisher) {
          notifyInfo(`「${book.title || book.isbn || '不明'}」の情報を補完中...`);
          bookToRegister = await enrichBookInfo(book);

          if (!bookToRegister) {
            notifyWarning('タイトルが不明、または補完候補が選択されなかった書籍をスキップしました');
            continue;
          }

          if (
            bookToRegister.title !== book.title ||
            bookToRegister.author !== book.author ||
            bookToRegister.publisher !== book.publisher
          ) {
            enrichedCount++;
            const index = selectedBooks.value.findIndex(b => b.id === book.id);
            if (index !== -1) {
              selectedBooks.value[index] = { ...selectedBooks.value[index], ...bookToRegister };
            }
          }
        }

        if (!bookToRegister || !bookToRegister.title) {
          notifyWarning('タイトルが不明、または補完候補が選択されなかった書籍をスキップしました');
          continue;
        }

        const authorNames = bookToRegister.author
          ? bookToRegister.author
              .split(/[,、]/)
              .map(a => a.trim())
              .filter(a => a)
          : [];

        if (authorNames.length === 0) {
          authorNames.push('不明');
        }

        const localCoverUrl = await fetchLocalCoverUrl(bookToRegister);

        await $fetch('/api/bookCrud', {
          method: 'POST',
          body: {
            title: bookToRegister.title,
            authorNames,
            bookType: 'General',
            readStatus: 'Unread',
            isbn: bookToRegister.isbn || undefined,
            publisherName: bookToRegister.publisher || undefined,
            releaseDate: bookToRegister.publishedYear
              ? new Date(`${bookToRegister.publishedYear}-01-01`).toISOString()
              : undefined,
            volume: bookToRegister.volume || undefined,
            coverUrl: localCoverUrl || bookToRegister.coverUrl || undefined,
          },
        });

        successCount++;
      }

      isLoading.value = false;

      if (enrichedCount > 0) {
        notifySuccess(`${successCount}冊の書籍を登録しました（${enrichedCount}冊は外部APIから情報を補完）`);
      } else {
        notifySuccess(`${successCount}冊の書籍を登録しました`);
      }

      selectedBooks.value = selectedBooks.value.filter(book => !book.selected);
    } catch (error) {
      isLoading.value = false;
      notifyError('書籍の登録に失敗しました。');
      console.error(error);
    }
  };

  return registerBooks;
};
