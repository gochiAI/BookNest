import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

console.log('setup.ts is being executed'); // デバッグ用ログ

beforeEach(async () => {
  console.log('Resetting database...');
  await prisma.book.deleteMany();
  await prisma.series.deleteMany();
  await prisma.publisher.deleteMany();
  await prisma.author.deleteMany();

  const bookCount = await prisma.book.count();
  const seriesCount = await prisma.series.count();
  const publisherCount = await prisma.publisher.count();
  const authorCount = await prisma.author.count();

  console.log(`Database reset complete. Counts - Books: ${bookCount}, Series: ${seriesCount}, Publishers: ${publisherCount}, Authors: ${authorCount}`);
});

afterAll(async () => {
  console.log('Disconnecting Prisma client...');
  await prisma.$disconnect();
});