import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Book CRUD Operations', () => {
  beforeEach(async () => {
    // データベースをリセット
    await prisma.book.deleteMany();
    await prisma.series.deleteMany();
    await prisma.publisher.deleteMany();
    await prisma.author.deleteMany();
  });

  afterAll(async () => {
    // Prismaクライアントを切断
    await prisma.$disconnect();
  });

  it('should ensure database is reset before each test', async () => {
    const bookCount = await prisma.book.count();
    const seriesCount = await prisma.series.count();
    const publisherCount = await prisma.publisher.count();
    const authorCount = await prisma.author.count();

    expect(bookCount).toBe(0);
    expect(seriesCount).toBe(0);
    expect(publisherCount).toBe(0);
    expect(authorCount).toBe(0);
  });

  it('should create a new book', async () => {
    // テスト用のAuthor, Publisher, Seriesを作成
    const author = await prisma.author.create({
      data: { name: 'Test Author' },
    });

    const publisher = await prisma.publisher.create({
      data: { name: 'Test Publisher' },
    });

    const series = await prisma.series.create({
      data: { name: 'Test Series' },
    });

    // Bookを作成
    const book = await prisma.book.create({
      data: {
        title: 'Test Book',
        releaseDate: new Date('2023-01-01'),
        coverUrl: 'https://example.com/cover.jpg',
        volume: 1,
        isbn: '1234567890123',
        bookType: 'General',
        readStatus: 'Unread',
        authorId: author.id,
        publisherId: publisher.id,
        seriesId: series.id,
      },
    });

    // 作成されたBookを検証
    expect(book).toMatchObject({
      title: 'Test Book',
      releaseDate: new Date('2023-01-01'),
      coverUrl: 'https://example.com/cover.jpg',
      volume: 1,
      isbn: '1234567890123',
      bookType: 'General',
      readStatus: 'Unread',
      authorId: author.id,
      publisherId: publisher.id,
      seriesId: series.id,
    });
  });

  it('should read a book', async () => {
    // テスト用のBookを作成
    const author = await prisma.author.create({ data: { name: 'Test Author' } });
    const publisher = await prisma.publisher.create({ data: { name: 'Test Publisher' } });
    const series = await prisma.series.create({ data: { name: 'Test Series' } });

    const book = await prisma.book.create({
      data: {
        title: 'Test Book',
        releaseDate: new Date('2023-01-01'),
        coverUrl: 'https://example.com/cover.jpg',
        volume: 1,
        isbn: '1234567890123',
        bookType: 'General',
        readStatus: 'Unread',
        authorId: author.id,
        publisherId: publisher.id,
        seriesId: series.id,
      },
    });

    // Bookを取得
    const fetchedBook = await prisma.book.findUnique({
      where: { id: book.id },
    });

    // 取得したBookを検証
    expect(fetchedBook).toMatchObject({
      title: 'Test Book',
      releaseDate: new Date('2023-01-01'),
      coverUrl: 'https://example.com/cover.jpg',
      volume: 1,
      isbn: '1234567890123',
      bookType: 'General',
      readStatus: 'Unread',
      authorId: author.id,
      publisherId: publisher.id,
      seriesId: series.id,
    });
  });

  it('should update a book', async () => {
    // テスト用のBookを作成
    const author = await prisma.author.create({ data: { name: 'Test Author' } });
    const publisher = await prisma.publisher.create({ data: { name: 'Test Publisher' } });
    const series = await prisma.series.create({ data: { name: 'Test Series' } });

    const book = await prisma.book.create({
      data: {
        title: 'Test Book',
        releaseDate: new Date('2023-01-01'),
        coverUrl: 'https://example.com/cover.jpg',
        volume: 1,
        isbn: '1234567890123',
        bookType: 'General',
        readStatus: 'Unread',
        authorId: author.id,
        publisherId: publisher.id,
        seriesId: series.id,
      },
    });

    // Bookを更新
    const updatedBook = await prisma.book.update({
      where: { id: book.id },
      data: {
        title: 'Updated Test Book',
        readStatus: 'Completed',
      },
    });

    // 更新されたBookを検証
    expect(updatedBook).toMatchObject({
      title: 'Updated Test Book',
      readStatus: 'Completed',
    });
  });

  it('should delete a book', async () => {
    // テスト用のBookを作成
    const author = await prisma.author.create({ data: { name: 'Test Author' } });
    const publisher = await prisma.publisher.create({ data: { name: 'Test Publisher' } });
    const series = await prisma.series.create({ data: { name: 'Test Series' } });

    const book = await prisma.book.create({
      data: {
        title: 'Test Book',
        releaseDate: new Date('2023-01-01'),
        coverUrl: 'https://example.com/cover.jpg',
        volume: 1,
        isbn: '1234567890123',
        bookType: 'General',
        readStatus: 'Unread',
        authorId: author.id,
        publisherId: publisher.id,
        seriesId: series.id,
      },
    });

    // Bookを削除
    await prisma.book.delete({
      where: { id: book.id },
    });

    // 削除されたことを確認
    const deletedBook = await prisma.book.findUnique({
      where: { id: book.id },
    });

    expect(deletedBook).toBeNull();
  });
});