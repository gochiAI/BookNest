import { defineEventHandler, createError } from 'h3';
import fs from 'fs/promises';
import path from 'path';

const backupDirPath = path.join(process.cwd(), 'backup');
const dataFilePath = path.join(process.cwd(), 'assets', 'books.json');

async function getLatestBackupFile(): Promise<string> {
  try {
    const files = await fs.readdir(backupDirPath);
    const versions = files
      .map(file => {
        const match = file.match(/books_v(\d+)\.json/);
        return match ? { file, version: parseInt(match[1], 10) } : null;
      })
      .filter(item => item !== null)
      .sort((a, b) => b.version - a.version);
    return versions.length > 0 ? path.join(backupDirPath, versions[0].file) : '';
  } catch (error) {
    throw new Error('No backup files found');
  }
}

export default defineEventHandler(async (event) => {
  try {
    const latestBackupFile = await getLatestBackupFile();
    if (!latestBackupFile) {
      throw new Error('No backup files found');
    }
    const data = await fs.readFile(latestBackupFile, 'utf-8');
    await fs.writeFile(dataFilePath, data);
    return { message: 'Data restored successfully' };
  } catch (error) {
    console.error('Error restoring data:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message,
    });
  }
});
