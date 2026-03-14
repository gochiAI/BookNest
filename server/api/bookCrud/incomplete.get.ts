import { defineEventHandler } from 'h3';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 不足情報本API: ボリューム情報なし・書影未登録・書影重複
export default defineEventHandler(async () => {
  // 全件取得（ページネーションなし）
  const allBooks = await prisma.book.findMany({
    include: {
      authors: { include: { author: true } },
      publisher: true,
      series: true,
      collections: { include: { collection: true } },
      tags: { include: { tag: true } },
    },
  });

  // 書影URLごとの冊数
  const coverCount = new Map<string, number>();
  for (const book of allBooks) {
    if (book.coverUrl) {
      coverCount.set(book.coverUrl, (coverCount.get(book.coverUrl) ?? 0) + 1);
    }
  }

  // 条件: ボリューム情報なし or 書影未登録 or 書影重複
  const incompleteBooks = allBooks.filter(book => {
    const noVolume = book.volume == null;
    const noCover = !book.coverUrl;
    const coverDuplicated = book.coverUrl && (coverCount.get(book.coverUrl) ?? 0) > 1;
    return noVolume || noCover || coverDuplicated;
  });

  return { books: incompleteBooks };
});
