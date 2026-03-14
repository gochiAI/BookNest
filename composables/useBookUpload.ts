import { ref } from 'vue';
import VueToastification from 'vue-toastification';
import { createExistingBooksFilter } from './bookUpload/deduplication';
import { createEnrichmentController } from './bookUpload/enrichment';
import { filterBooksBySelectedFilters, toggleFilterSelection } from './bookUpload/filtering';
import { createRegisterBooksHandler } from './bookUpload/registerFlow';
import { createUploadCSVHandler } from './bookUpload/uploadFlow';
import { createCoverController } from './bookUpload/coverFlow';
import type { Book, CsvEncoding } from './bookUpload/types';

export default function useBookUpload() {
  const selectedBooks = ref<Book[]>([]);
  const isLoading = ref(false);
  const encoding = ref<CsvEncoding>('UTF-8');
  const toastModule = VueToastification as unknown as { useToast?: () => any };
  const toast = typeof toastModule.useToast === 'function'
    ? toastModule.useToast()
    : {
        info: (_message: string) => undefined,
        success: (_message: string) => undefined,
        warning: (_message: string) => undefined,
        error: (_message: string) => undefined,
      };

  const availableFilters = ref<string[]>([]);
  const selectedFilters = ref<string[]>([]);

  const filterExistingBooks = createExistingBooksFilter(message => toast.warning(message));

  const {
    enrichmentCandidates,
    showCandidateSelector,
    enrichBookInfo,
    selectEnrichmentCandidate,
    cancelEnrichment,
  } = createEnrichmentController({
    selectedBooks,
    notifyInfo: message => toast.info(message),
    notifySuccess: message => toast.success(message),
  });

  const uploadCSV = createUploadCSVHandler({
    selectedBooks,
    isLoading,
    encoding,
    availableFilters,
    selectedFilters,
    filterExistingBooks,
    notifyInfo: message => toast.info(message),
    notifySuccess: message => toast.success(message),
    notifyError: message => toast.error(message),
  });

  const registerBooks = createRegisterBooksHandler({
    selectedBooks,
    isLoading,
    filterExistingBooks,
    enrichBookInfo,
    notifyInfo: message => toast.info(message),
    notifyWarning: message => toast.warning(message),
    notifySuccess: message => toast.success(message),
    notifyError: message => toast.error(message),
  });

  const { fetchCoverForBook, fetchCoversForSelected, selectCoverCandidateForBook } = createCoverController({
    selectedBooks,
    notifyInfo: message => toast.info(message),
    notifySuccess: message => toast.success(message),
    notifyWarning: message => toast.warning(message),
  });

  const setEncoding = (enc: CsvEncoding): void => {
    encoding.value = enc;
  };

  const toggleFilter = (filter: string): void => {
    toggleFilterSelection(selectedFilters, filter);
  };

  const getFilteredBooks = (): Book[] => {
    return filterBooksBySelectedFilters(selectedBooks.value, selectedFilters.value);
  };

  return {
    selectedBooks,
    uploadCSV,
    registerBooks,
    isLoading,
    encoding,
    setEncoding,
    enrichmentCandidates,
    showCandidateSelector,
    selectEnrichmentCandidate,
    cancelEnrichment,
    availableFilters,
    selectedFilters,
    toggleFilter,
    getFilteredBooks,
    fetchCoverForBook,
    fetchCoversForSelected,
    selectCoverCandidateForBook,
  };
}
