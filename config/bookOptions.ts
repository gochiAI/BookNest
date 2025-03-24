import { BookType, ReadStatus } from '../constants/book';
import type { Composer } from 'vue-i18n';

export const getBookTypeOptions = (t: Composer['t']) => {
  return Object.values(BookType).map((value) => ({
    value,
    label: t(`BookFilter.BookType.${value}`), 
  }));
};

export const getReadStatusOptions = (t: Composer['t']) => {
  return Object.values(ReadStatus).map((value) => ({
    value,
    label: t(`BookFilter.ReadStatus.${value}`), 
  }));
};