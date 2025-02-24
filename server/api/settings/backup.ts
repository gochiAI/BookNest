import { defineEventHandler, createError } from 'h3';
import { backupData } from '~/storage/backupData';

export default defineEventHandler(async (event) => {
  try {
    await backupData();
    return { message: 'Data backed up successfully' };
  } catch (error) {
    console.error('Error backing up data:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: error.message,
    });
  }
});