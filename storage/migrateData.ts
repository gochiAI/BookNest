import { BookStorage } from '~/interfaces/BookStorage';
import { PrismaBookStorage } from '~/storage/PrismaBookStorage';
import { JsonBookStorage } from '~/storage/JsonBookStorage';
import { CsvBookStorage } from '~/storage/CsvBookStorage';
import { MongoBookStorage } from '~/storage/MongoBookStorage';
import fs from 'fs/promises';
import path from 'path';

const storageMap = {
  prisma: PrismaBookStorage,
  json: JsonBookStorage,
  csv: CsvBookStorage,
  mongo: MongoBookStorage,
};

async function getBackupVersion(): Promise<number> {
  const backupDirPath = path.join(process.cwd(), 'backup');
  try {
    const files = await fs.readdir(backupDirPath);
    const versions = files
      .map(file => {
        const match = file.match(/books_v(\d+)\.json/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(version => !isNaN(version));
    return versions.length > 0 ? Math.max(...versions) : 0;
  } catch (error) {
    return 0;
  }
}

export async function migrateData(sourceType: string, targetType: string) {
  const SourceStorage = storageMap[sourceType];
  const TargetStorage = storageMap[targetType];

  if (!SourceStorage || !TargetStorage) {
    throw new Error('Invalid storage type');
  }

  const sourceStorage: BookStorage = new SourceStorage();
  const targetStorage: BookStorage = new TargetStorage();

  const books = await sourceStorage.getAllBooks();
  console.log(`Migrating ${books.length} books from ${sourceType} to ${targetType}`);
  for (const book of books) {
    await targetStorage.createBook(book);
    console.log(`Migrated book with ID: ${book.id}`);
  }

  // バージョン番号を引き継ぐ
  const version = await getBackupVersion();
  const dataFilePath = path.join(process.cwd(), 'assets', 'books.json');
  const backupFilePath = path.join(process.cwd(), 'backup', `books_v${version}.json`);
  const data = await fs.readFile(dataFilePath, 'utf-8');
  await fs.writeFile(backupFilePath, data);
  console.log(`Data migrated and backed up successfully to ${backupFilePath}`);
}