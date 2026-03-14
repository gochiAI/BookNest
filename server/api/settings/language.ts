import { defineEventHandler, readBody, createError } from 'h3';
import fs from 'fs/promises';
import path from 'path';

const settingsFilePath = path.join(process.cwd(), 'config', 'settings.json');

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { language } = body;

  if (!['en', 'ja', 'es', 'fr'].includes(language)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid language',
    });
  }

  const settings = JSON.parse(await fs.readFile(settingsFilePath, 'utf-8'));
  settings.language = language;
  await fs.writeFile(settingsFilePath, JSON.stringify(settings, null, 2));

  return { message: 'Language updated successfully' };
});