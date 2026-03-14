import { defineEventHandler, readBody, createError } from 'h3';
import { getStorage } from '../utils';

export default defineEventHandler(async (event) => {
  const storageType = (event.node.req.headers['x-storage-type'] as string) || 'prisma';
  const storage = getStorage(storageType);

  try {
    const body = await readBody(event);
    const books = Array.isArray(body?.books) ? body.books : [];

    if (books.length === 0) {
      return { existingIsbns: [], existingTitleVolumes: [] };
    }

    const { existingIsbns, existingTitleVolumes } = await storage.findExistingBooks(
      books.map((b: any) => ({
        isbn: typeof b.isbn === 'string' ? b.isbn : undefined,
        title: typeof b.title === 'string' ? b.title : undefined,
        volume: typeof b.volume === 'number' ? b.volume : b.volume === null ? null : undefined,
      }))
    );

    return { existingIsbns, existingTitleVolumes };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    throw createError({ statusCode: 500, message: errorMessage });
  }
});
