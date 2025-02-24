import { defineEventHandler, readBody, createError } from 'h3';
import fs from 'fs/promises';
import path from 'path';

const settingsFilePath = path.join(process.cwd(), 'config', 'settings.json');

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { theme } = body;

  if (!['light', 'dark'].includes(theme)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid theme',
    });
  }

  const settings = JSON.parse(await fs.readFile(settingsFilePath, 'utf-8'));
  settings.theme = theme;
  await fs.writeFile(settingsFilePath, JSON.stringify(settings, null, 2));

  return { message: 'Theme updated successfully' };
});