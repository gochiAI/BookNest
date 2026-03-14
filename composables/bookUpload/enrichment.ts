import { ref, type Ref } from 'vue';
import { fetchFromGoogleBooks, fetchFromNDL, fetchFromOpenBD } from './bookInfoApis';
import { mergeVolume, normalizeTitleKey } from './textNormalization';
import type { Book, EnrichmentCandidate } from './types';

interface EnrichmentControllerDeps {
  selectedBooks: Ref<Book[]>;
  notifyInfo: (message: string) => void;
  notifySuccess: (message: string) => void;
}

export const createEnrichmentController = ({
  selectedBooks,
  notifyInfo,
  notifySuccess,
}: EnrichmentControllerDeps) => {
  const enrichmentCandidates = ref<EnrichmentCandidate[]>([]);
  const currentEnrichingBook = ref<Book | null>(null);
  const showCandidateSelector = ref(false);

  const enrichBookInfo = async (book: Book): Promise<Book | null> => {
    const missingFields: string[] = [];
    if (!book.title) missingFields.push('title');
    if (!book.author) missingFields.push('author');
    if (!book.publisher) missingFields.push('publisher');
    if (missingFields.length === 0) return book;

    if (book.title) {
      const localMatch = selectedBooks.value.find(
        b =>
          normalizeTitleKey(b.title || '') === normalizeTitleKey(book.title || '') &&
          b.author &&
          b.author.trim() &&
          b.id !== book.id,
      );
      if (localMatch) {
        return {
          ...book,
          author: localMatch.author,
          publisher: book.publisher || localMatch.publisher,
          publishedYear: book.publishedYear || localMatch.publishedYear,
          isbn: book.isbn || localMatch.isbn,
          volume: mergeVolume(book.volume, localMatch.volume),
        };
      }
    }

    let candidates: EnrichmentCandidate[] = [];

    if (book.isbn) {
      const openBDResults = await fetchFromOpenBD(book.isbn);
      if (openBDResults.length > 0) {
        candidates.push(...openBDResults);
      }
    }

    if (candidates.length === 0 && book.title) {
      const googleResults = await fetchFromGoogleBooks(book.title, book.isbn);
      if (googleResults.length > 0) {
        candidates.push(...googleResults);
      }

      if (candidates.length === 0) {
        const ndlResults = await fetchFromNDL(book.title);
        if (ndlResults.length > 0) {
          candidates.push(...ndlResults);
        }
      }
    }

    if (candidates.length === 0) {
      return null;
    }

    if (candidates.length === 1) {
      const enrichedData = candidates[0];
      notifyInfo(`${enrichedData.source}から「${enrichedData.title}」の情報を取得しました`);
      return {
        ...book,
        title: book.title || enrichedData.title,
        author: book.author || enrichedData.author,
        publisher: book.publisher || enrichedData.publisher,
        publishedYear: book.publishedYear || enrichedData.publishedYear,
        isbn: book.isbn || enrichedData.isbn,
        volume: mergeVolume(book.volume, enrichedData.volume),
      };
    }

    currentEnrichingBook.value = book;
    enrichmentCandidates.value = candidates;
    showCandidateSelector.value = true;

    return new Promise<Book | null>(resolve => {
      const checkSelection = setInterval(() => {
        if (!showCandidateSelector.value) {
          clearInterval(checkSelection);
          resolve(currentEnrichingBook.value || null);
        }
      }, 100);
    });
  };

  const selectEnrichmentCandidate = (candidate: EnrichmentCandidate): void => {
    if (!currentEnrichingBook.value) return;

    const book = currentEnrichingBook.value;
    const enrichedBook: Book = {
      ...book,
      title: book.title || candidate.title,
      author: book.author || candidate.author,
      publisher: book.publisher || candidate.publisher,
      publishedYear: book.publishedYear || candidate.publishedYear,
      isbn: book.isbn || candidate.isbn,
      volume: mergeVolume(book.volume, candidate.volume),
    };

    const index = selectedBooks.value.findIndex(b => b.id === book.id);
    if (index !== -1) {
      selectedBooks.value[index] = { ...selectedBooks.value[index], ...enrichedBook };
    }

    currentEnrichingBook.value = enrichedBook;
    showCandidateSelector.value = false;
    enrichmentCandidates.value = [];

    notifySuccess(`「${candidate.title}」を選択しました（${candidate.source}）`);
  };

  const cancelEnrichment = (): void => {
    showCandidateSelector.value = false;
    enrichmentCandidates.value = [];
  };

  return {
    enrichmentCandidates,
    showCandidateSelector,
    enrichBookInfo,
    selectEnrichmentCandidate,
    cancelEnrichment,
  };
};
