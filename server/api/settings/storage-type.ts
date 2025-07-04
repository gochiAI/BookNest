// server/api/settings/storage-type.ts
import { defineEventHandler, readBody, createError } from 'h3';
import fs from 'fs/promises';
import path from 'path';

const settingsFilePath = path.join(process.cwd(), 'config', 'settings.json');

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { storageType } = body;

  if (!['prisma', 'json', 'csv', 'mongo'].includes(storageType)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid storage type',
    });
  }

  const settings = { storageType };
  await fs.writeFile(settingsFilePath, JSON.stringify(settings, null, 2));

  return { message: 'Storage type updated successfully' };
});