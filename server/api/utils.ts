// import { JsonBookStorage } from '~/storage/JsonBookStorage';
// import { CsvBookStorage } from '~/storage/CsvBookStorage';
// import { MongoBookStorage } from '~/storage/MongoBookStorage';
import { PrismaBookStorage } from '~/storage/PrismaBookStorage';
import { BookStorage } from '~/interfaces/BookStorage';

const storageMap = {
  prisma: PrismaBookStorage,
  // json: JsonBookStorage,
  // csv: CsvBookStorage,
};

export function getStorage(storageType: string = 'prisma'): BookStorage {
  const StorageClass = storageMap[storageType as keyof typeof storageMap];
  if (!StorageClass) {
    throw new Error(`Invalid storage type: ${storageType}`);
  }
  return new StorageClass();
}

export async function validateBookData(
  data: any,
  options: { partial?: boolean } = {},
): Promise<void> {
  const { partial = false } = options;

  // PrismaBookStorageに合わせて受け取るプロパティ名を調整
  const { 
    title, 
    authorNames, // author ではなく authorNames (配列) を受け取る
    bookType, 
    readStatus, 
    volume, 
    isbn, 
    releaseDate,
    rating,
    reviewComment,
    completedDate
  } = data;

  // 1. タイトル (必須)
  if (!partial && (!title || typeof title !== 'string' || title.trim() === '')) {
    throw new Error('Title is required');
  }
  if (partial && title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
    throw new Error('Title is required');
  }

  // 2. 著者 (必須: 配列かつ1人以上)
  // PrismaBookStorage.createBook では authorNames を期待しています
  if (!partial && (!authorNames || !Array.isArray(authorNames) || authorNames.length === 0)) {
    throw new Error('At least one author name is required');
  }
  if (partial && authorNames !== undefined && (!Array.isArray(authorNames) || authorNames.length === 0)) {
    throw new Error('At least one author name is required');
  }
  // 配列の中身が空文字でないかチェック
  if (Array.isArray(authorNames) && authorNames.some((name: any) => typeof name !== 'string' || name.trim() === '')) {
    throw new Error('Author names cannot be empty');
  }

  // 3. 本の種類 (必須)
  if (!partial && !bookType) {
    throw new Error('Book type is required');
  }
  if (partial && bookType !== undefined && !bookType) {
    throw new Error('Book type is required');
  }

  // 4. 読書ステータス (必須)
  if (!partial && !readStatus) {
    throw new Error('Read status is required');
  }
  if (partial && readStatus !== undefined && !readStatus) {
    throw new Error('Read status is required');
  }

  // 5. 出版社 (任意になったため、チェックを削除)
  // if (!publisher || !publisher.name) { ... }

  // 6. ISBN (任意)
  const isbnRegex = /^\d{13}$/;
  if (isbn && !isbnRegex.test(isbn)) {
    throw new Error('ISBN must be a 13-digit number or empty.');
  }

  // 7. リリース日 (任意)
  if (releaseDate && isNaN(Date.parse(releaseDate))) {
    throw new Error('Invalid release date format');
  }

  // 8. 巻数 (任意: 正の整数)
  // volume は Int? なので、値がある場合のみチェック
  if (volume !== undefined && volume !== null) {
    if (!Number.isInteger(volume) || volume < 0) { 
      // 0巻も許容する場合は < 0、許容しないなら <= 0
      throw new Error('Volume must be a non-negative integer');
    }
  }
  
  // volumeSuffix は String? なので特段の形式チェックは不要ですが、
  // 必要であればここで文字数制限などを入れます。

  // 9. 評価 (任意: 1-5 の整数)
  if (rating !== undefined && rating !== null) {
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new Error('Rating must be an integer between 1 and 5');
    }
  }

  // 10. レビューコメント (任意: 文字列)
  if (reviewComment && typeof reviewComment !== 'string') {
    throw new Error('Review comment must be a string');
  }

  // 11. 読了日 (任意)
  if (completedDate && isNaN(Date.parse(completedDate))) {
    throw new Error('Invalid completed date format');
  }
}