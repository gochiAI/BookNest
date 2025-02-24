import fs from 'fs/promises';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'assets', 'books.json');
const backupDirPath = path.join(process.cwd(), 'backup');

async function getBackupVersion(): Promise<number> {
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

export async function backupData() {
  try {
    const version = await getBackupVersion() + 1;
    const backupFilePath = path.join(backupDirPath, `books_v${version}.json`);
    const data = await fs.readFile(dataFilePath, 'utf-8');
    await fs.writeFile(backupFilePath, data);
    console.log(`Data backed up successfully to ${backupFilePath}`);
  } catch (error) {
    console.error('Error backing up data:', error);
    throw error;
  }
}