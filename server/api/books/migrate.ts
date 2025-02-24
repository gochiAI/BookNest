import { defineEventHandler, readBody, createError } from 'h3';
import { migrateData } from '~/storage/migrateData';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { sourceType, targetType } = body;

  if (!sourceType || !targetType) {
    throw createError({
      statusCode: 400,
      statusMessage: 'sourceType and targetType are required',
    });
  }

  try {
    await migrateData(sourceType, targetType);
    return { message: 'Data migrated successfully' };
  } catch (error) {
    console.error('Error migrating data:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: error.message,
    });
  }
});