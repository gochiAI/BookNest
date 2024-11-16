
import { type Filter } from "@/interfaces/filters";
import { BOOK_TYPES } from "@/constants/bookTypes";

export const getBookTypeFilter = (t:(key:string)=>string): Filter[] => [
  {
    id: "readStatus",
    label: t("BookFilter.readStatusLabel"),
    type: "select",
    options: [
      { value: "all", label: t("BookFilter.ReadStatus.All") },
      { value: "completed", label: t("BookFilter.ReadStatus.Completed") },
      { value: "reading", label: t("BookFilter.ReadStatus.Reading") },
      { value: "unread", label: t("BookFilter.ReadStatus.Unread") },
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
