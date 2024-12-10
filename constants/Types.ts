export const BOOK_TYPES = {
    ALL: 'all',
    GENERAL: '1',
    MANGA: '2',
    LIGHT_NOVEL: '3',
    OTHER: '4'
  } as const;

export type BookType = typeof BOOK_TYPES[keyof typeof BOOK_TYPES];

export const STATUS_TYPES = {
    ALL: 'all',
    COMPLETED: '1',
    READING: '2',
    UNREAD: '3'
  } as const;

export type StatusType = typeof STATUS_TYPES[keyof typeof STATUS_TYPES];