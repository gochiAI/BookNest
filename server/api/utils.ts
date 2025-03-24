import { JsonBookStorage } from '~/storage/JsonBookStorage';
import { CsvBookStorage } from '~/storage/CsvBookStorage';
import { MongoBookStorage } from '~/storage/MongoBookStorage';
import { PrismaBookStorage } from '~/storage/PrismaBookStorage';
import { BookStorage } from '~/interfaces/BookStorage';


const storageMap = {
  prisma: PrismaBookStorage,
  json: JsonBookStorage,
  csv: CsvBookStorage,
  mongo: MongoBookStorage,
};

export function getStorage(storageType: string): BookStorage {
  const StorageClass = storageMap[storageType as keyof typeof storageMap];
  if (!StorageClass) {
    throw new Error('Invalid storage type');
  }
  return new StorageClass();
}

export async function validateBookData(data: any, storageType: string): Promise<void> {
  const { title, authorId, bookTypeId, readStatusId, volume, isbn, releaseDate } = data;

  if (!title || !authorId || !bookTypeId || !readStatusId) {
    throw new Error('Title, authorId, bookTypeId, and readStatusId are required');
  }

  if (releaseDate && isNaN(Date.parse(releaseDate))) {
    throw new Error('Invalid release date format');
  }


}