import { $fetch } from 'ofetch';
import type { Ref } from 'vue';
import type { Book, CoverCandidate } from './types';

type CoverResponse = {
  coverUrl?: string | null;
  source?: string | null;
  remoteUrl?: string | null;
  candidates?: CoverCandidate[];
};

interface CoverFlowDeps {
  selectedBooks: Ref<Book[]>;
  notifyInfo: (message: string) => void;
  notifySuccess: (message: string) => void;
  notifyWarning: (message: string) => void;
}

const sanitizeIsbn = (isbn?: string): string => (isbn || '').replace(/\D/g, '');

export const createCoverController = ({
  selectedBooks,
  notifyInfo,
  notifySuccess,
  notifyWarning,
}: CoverFlowDeps) => {
  const applyCoverToBook = (book: Book, response: CoverResponse): boolean => {
    if (!response.coverUrl) {
      book.coverStatus = 'error';
      book.coverPreviewUrl = undefined;
      return false;
    }

    book.coverUrl = response.coverUrl;
    book.coverPreviewUrl = `${response.coverUrl}${response.coverUrl.includes('?') ? '&' : '?'}t=${Date.now()}`;
    book.coverSource = response.source || undefined;
    book.selectedCoverRemoteUrl = response.remoteUrl || undefined;
    book.coverStatus = 'done';
    return true;
  };

  const fetchCoverForBook = async (book: Book, force = false): Promise<void> => {
    const isbn = sanitizeIsbn(book.isbn);
    const title = (book.title || '').trim();

    if (!isbn && !title) {
      notifyWarning('ISBNまたはタイトルがないため書影を取得できません。');
      return;
    }

    book.coverStatus = 'loading';

    try {
      const response = await $fetch<CoverResponse>('/api/bookCrud/cover', {
        method: 'POST',
        body: {
          isbn: isbn || undefined,
          title: title || undefined,
          volume: book.volume ?? undefined,
          force,
        },
      });

      if (Array.isArray(response.candidates)) {
        book.coverCandidates = response.candidates;
      }

      if (applyCoverToBook(book, response)) {
        if ((book.coverCandidates?.length || 0) > 1) {
          notifyInfo(`「${book.title || isbn}」は複数候補があります。必要なら候補選択で変更できます`);
        }
        notifySuccess(`「${book.title || isbn}」の書影を取得しました`);
      } else {
        notifyInfo(`「${book.title || isbn}」の書影は見つかりませんでした`);
      }
    } catch (error) {
      book.coverStatus = 'error';
      book.coverPreviewUrl = undefined;
      console.warn('[coverFlow] fetchCoverForBook failed:', error);
      notifyWarning(`「${book.title || isbn}」の書影取得に失敗しました`);
    }
  };

  const selectCoverCandidateForBook = async (
    book: Book,
    candidate: CoverCandidate,
    force = false,
  ): Promise<void> => {
    const isbn = sanitizeIsbn(book.isbn);
    const title = (book.title || '').trim();

    if (!candidate?.remoteUrl) {
      notifyWarning('候補のURLが不正なため書影を変更できません。');
      return;
    }

    book.coverStatus = 'loading';

    try {
      const response = await $fetch<CoverResponse>('/api/bookCrud/cover', {
        method: 'POST',
        body: {
          isbn: isbn || undefined,
          title: title || undefined,
          volume: book.volume ?? undefined,
          candidateUrl: candidate.remoteUrl,
          candidateSource: candidate.source,
          force,
        },
      });

      if (applyCoverToBook(book, response)) {
        book.selectedCoverRemoteUrl = candidate.remoteUrl;
        notifySuccess(`「${book.title || isbn}」の書影を候補から変更しました`);
      } else {
        notifyWarning(`「${book.title || isbn}」の候補適用に失敗しました`);
      }
    } catch (error) {
      book.coverStatus = 'error';
      book.coverPreviewUrl = undefined;
      console.warn('[coverFlow] selectCoverCandidateForBook failed:', error);
      notifyWarning(`「${book.title || isbn}」の書影変更に失敗しました`);
    }
  };

  const fetchCoversForSelected = async (force = false): Promise<void> => {
    const targets = selectedBooks.value.filter(book => book.selected);
    if (targets.length === 0) {
      notifyWarning('書影取得する書籍を選択してください。');
      return;
    }

    for (const book of targets) {
      await fetchCoverForBook(book, force);
    }
  };

  return {
    fetchCoverForBook,
    fetchCoversForSelected,
    selectCoverCandidateForBook,
  };
};
