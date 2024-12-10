// フィルターの選択肢を定義
import { type Filter } from "@/interfaces/filters";
import { BOOK_TYPES,STATUS_TYPES } from "@/constants/Types";

export const getBookTypeFilter = (t:(key:string)=>string): Filter[] => [
  {
    id: "readStatus",
    label: t("BookFilter.readStatusLabel"),
    type: "select",
    options: [
      { value: STATUS_TYPES.ALL, label: t("BookFilter.ReadStatus.All") },
      { value: STATUS_TYPES.COMPLETED, label: t("BookFilter.ReadStatus.Completed") },
      { value: STATUS_TYPES.READING, label: t("BookFilter.ReadStatus.Reading") },
      { value: STATUS_TYPES.UNREAD, label: t("BookFilter.ReadStatus.Unread") },
    ],
  },
  {
    id: "bookType",
    label: t("BookFilter.bookTypeLabel"),
    type: "select",
    options: [
      { value: BOOK_TYPES.ALL, label: t("BookFilter.BookType.All") },
      { value: BOOK_TYPES.GENERAL, label: t("BookFilter.BookType.General") },
      { value: BOOK_TYPES.MANGA, label: t("BookFilter.BookType.Manga") },
      {
        value: BOOK_TYPES.LIGHT_NOVEL,
        label: t("BookFilter.BookType.LightNovel"),
      },
      { value: BOOK_TYPES.OTHER, label: t("BookFilter.BookType.Other") },
    ],
  },
  {
    id: "search",
    label: t("BookFilter.searchLabel"),
    type: "text",
    placeholder: t("BookFilter.searchPlaceHolder"),
  },
];
