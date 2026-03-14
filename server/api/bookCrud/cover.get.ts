import { createError, defineEventHandler } from 'h3';

export default defineEventHandler(() => {
  throw createError({
    statusCode: 405,
    statusMessage: 'Method Not Allowed',
    message: 'Use POST /api/bookCrud/cover',
  });
});
