import { openDB, DBSchema } from 'idb';
import { defineNuxtPlugin } from '#app';

interface BookDB extends DBSchema {
  books: {
    key: string;
    value: any;
  };
}

const dbPromise = openDB<BookDB>('book-store', 1, {
  upgrade(db) {
    db.createObjectStore('books', { keyPath: 'id' });
  },
});

export async function getBook(id: string) {
  const db = await dbPromise;
  return db.get('books', id);
}

export async function getAllBooks() {
  const db = await dbPromise;
  return db.getAll('books');
}

export async function addBook(book: any) {
  const db = await dbPromise;
  return db.add('books', book);
}

export async function updateBook(book: any) {
  const db = await dbPromise;
  return db.put('books', book);
}

export async function deleteBook(id: string) {
  const db = await dbPromise;
  return db.delete('books', id);
}

export default defineNuxtPlugin(() => {
  return {
    provide: {
      getBook,
      getAllBooks,
      addBook,
      updateBook,
      deleteBook,
    },
  };
});