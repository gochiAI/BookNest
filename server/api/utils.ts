// import { JsonBookStorage } from '~/storage/JsonBookStorage';
// import { CsvBookStorage } from '~/storage/CsvBookStorage';
// import { MongoBookStorage } from '~/storage/MongoBookStorage';
import { PrismaBookStorage } from '~/storage/PrismaBookStorage';
import { BookStorage } from '~/interfaces/BookStorage';


const storageMap = {
  prisma: PrismaBookStorage,
};

export function getStorage(storageType: string): BookStorage {
  const StorageClass = storageMap[storageType as keyof typeof storageMap];
  if (!StorageClass) {
    throw new Error('Invalid storage type');
  }
  

  return new StorageClass();
}

export async function validateBookData(data: any, storageType: string): Promise<void> {
  const { title, author, publisher, bookType, readStatus, volume, isbn, releaseDate } = data;

  // 必須フィールドのバリデーション
  if (!title) {
    throw new Error('Title is required');
  }

  if (!author || !author.name) {
    throw new Error('Author name is required');
  }

  if (!publisher || !publisher.name) {
    throw new Error('Publisher name is required');
  }

  if (!bookType) {
    throw new Error('Book type is required');
  }

  if (!readStatus) {
    throw new Error('Read status is required');
  }

  // ISBNのバリデーション（空白を許可）
  const isbnRegex = /^\d{13}$/;
  if (isbn && !isbnRegex.test(isbn)) {
    throw new Error('ISBN must be a 13-digit number or empty.');
  }

  // リリース日の日付フォーマットのバリデーション
  if (releaseDate && isNaN(Date.parse(releaseDate))) {
    throw new Error('Invalid release date format');
  }

  // ボリュームのバリデーション（正の整数のみ許可）
  if (volume && (!Number.isInteger(volume) || volume <= 0)) {
    throw new Error('Volume must be a positive integer');
  }
}