import type { Ref } from 'vue';
import { parseCSV, parseRowSmart, parseRowWithHeaders } from './csvUtils';
import { deriveAvailableFilters } from './filtering';
import type { Book, CsvEncoding } from './types';
import type { ExistingBooksFilter } from './deduplication';

interface UploadFlowDeps {
  selectedBooks: Ref<Book[]>;
  isLoading: Ref<boolean>;
  encoding: Ref<CsvEncoding>;
  availableFilters: Ref<string[]>;
  selectedFilters: Ref<string[]>;
  filterExistingBooks: ExistingBooksFilter;
  notifyInfo: (message: string) => void;
  notifySuccess: (message: string) => void;
  notifyError: (message: string) => void;
}

export const createUploadCSVHandler = ({
  selectedBooks,
  isLoading,
  encoding,
  availableFilters,
  selectedFilters,
  filterExistingBooks,
  notifyInfo,
  notifySuccess,
  notifyError,
}: UploadFlowDeps) => {
  const uploadCSV = async (file: File | null, selectedEncoding: CsvEncoding | null = null): Promise<void> => {
    if (!file) return;

    isLoading.value = true;
    const tryEncoding = selectedEncoding || encoding.value;

    try {
      const reader = new FileReader();

      reader.onload = async (event: ProgressEvent<FileReader>) => {
        try {
          const text = typeof event.target?.result === 'string' ? event.target.result : '';

          if (text.includes('�') && tryEncoding === 'UTF-8') {
            isLoading.value = false;
            notifyInfo('エンコーディングを自動検出中...');
            setTimeout(() => uploadCSV(file, 'Shift_JIS'), 100);
            return;
          }

          const parsed = parseCSV(text);
          const { rows, headerMapping } = parsed;

          const parsedBooks: Book[] = rows
            .map((row, index): Book => {
              let book: Book;

              if (headerMapping) {
                book = parseRowWithHeaders(row, headerMapping);
              } else {
                book = parseRowSmart(row);
              }

              return {
                id: index,
                ...book,
                coverStatus: 'idle',
                coverCandidates: [],
                selected: true,
              };
            })
            .filter(book => book.title || book.isbn);

          const { filtered, removedCount } = await filterExistingBooks(parsedBooks);
          selectedBooks.value = filtered;

          availableFilters.value = deriveAvailableFilters(selectedBooks.value);
          selectedFilters.value = [];

          encoding.value = tryEncoding;
          isLoading.value = false;
          const removedNote = removedCount > 0 ? `（${removedCount}冊は既存データのため除外）` : '';
          notifySuccess(`${selectedBooks.value.length}冊の書籍情報を読み込みました。(${tryEncoding})${removedNote}`);
        } catch (error) {
          isLoading.value = false;
          notifyError('CSVの解析に失敗しました。');
          console.error(error);
        }
      };

      reader.onerror = () => {
        isLoading.value = false;
        notifyError('ファイルの読み込みに失敗しました。');
      };

      reader.readAsText(file, tryEncoding);
    } catch (error) {
      isLoading.value = false;
      notifyError('ファイルの処理に失敗しました。');
      console.error(error);
    }
  };

  return uploadCSV;
};
