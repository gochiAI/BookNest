import type { Ref } from 'vue';
import type { Book } from './types';

export const deriveAvailableFilters = (books: Book[]): string[] => {
  const filterSet = new Set<string>();
  let hasUntagged = false;

  books.forEach(book => {
    if (book.filters && book.filters.length > 0) {
      book.filters.forEach(filter => filterSet.add(filter));
    } else {
      hasUntagged = true;
    }
  });

  const available = Array.from(filterSet).sort((a, b) => a.localeCompare(b));
  if (hasUntagged) {
    available.unshift('タグなし');
  }
  return available;
};

export const toggleFilterSelection = (selectedFilters: Ref<string[]>, filter: string): void => {
  const index = selectedFilters.value.indexOf(filter);
  if (index > -1) {
    selectedFilters.value.splice(index, 1);
  } else {
    selectedFilters.value.push(filter);
  }
};

export const filterBooksBySelectedFilters = (books: Book[], filters: string[]): Book[] => {
  if (filters.length === 0) {
    return books;
  }

  return books.filter(book => {
    if (filters.includes('タグなし')) {
      const hasOtherFilters = filters.filter(f => f !== 'タグなし').length > 0;

      if (hasOtherFilters) {
        const isUntagged = !book.filters || book.filters.length === 0;
        const hasSelectedFilter = filters.some(
          filter => filter !== 'タグなし' && (book.filters?.includes(filter) ?? false),
        );
        return isUntagged || hasSelectedFilter;
      }

      return !book.filters || book.filters.length === 0;
    }

    if (!book.filters || book.filters.length === 0) {
      return false;
    }

    return filters.some(filter => book.filters?.includes(filter) ?? false);
  });
};
