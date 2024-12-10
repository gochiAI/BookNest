// 書籍登録時のSelectの選択肢を定義
import { BOOK_TYPES,type BookType,STATUS_TYPES,type StatusType } from "~/constants/Types";

export const bookTypeOptions:{value:BookType,label:string}[] = [
    {value:BOOK_TYPES.GENERAL,label:'General'},
    {value:BOOK_TYPES.MANGA,label:'Manga'},
    {value:BOOK_TYPES.LIGHT_NOVEL,label:'Light Novel'},
    {value:BOOK_TYPES.OTHER,label:'Other'}
];

export const readStatusOptions:{value:StatusType,label:string}[] = [
    {value:STATUS_TYPES.COMPLETED,label:'Completed'},
    {value:STATUS_TYPES.READING,label:'Reading'},
    {value:STATUS_TYPES.UNREAD,label:'Unread'}
];