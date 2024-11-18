import { PrismaClient } from "@prisma/client";
import { defineEventHandler, readBody } from "h3";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const method = event.req.method;

  if (method === "GET") {
    const books = await prisma.book.findMany({
      include: {
        author: true,
        publisher: true,
        series: true,
        bookType: true,
        readStatus: true,
      },
    });
    return books;
  } else if (method === "POST") {
    const body = await readBody(event);

    // Create or connect related records
    const book = await prisma.book.create({
      data: {
        title: body.title,
        releaseDate: body.releaseDate ? new Date(body.releaseDate) : null,
        cover: body.cover || null,
        volume: body.volume || null,
        isbn: body.isbn || null,
        author: {
          connectOrCreate: {
            where: { id: body.authorId || -1 },
            create: { name: body.authorName },
          },
        },
        publisher: {
          connectOrCreate: {
            where: { id: body.publisherId || -1 },
            create: { name: body.publisherName },
          },
        },
        series:
          body.seriesId || body.seriesName
            ? {
                connectOrCreate: {
                  where: { id: body.seriesId || -1 },
                  create: { name: body.seriesName },
                },
              }
            : undefined,
        bookType: {
          connectOrCreate: {
            where: { id: body.bookTypeId || -1 },
            create: { name: body.bookTypeName },
          },
        },
        readStatus: {
          connectOrCreate: {
            where: { id: body.readStatusId || -1 },
            create: { name: body.readStatusName },
          },
        },
      },
      include: {
        author: true,
        publisher: true,
        series: true,
        bookType: true,
        readStatus: true,
      },
    });
    return book;
  }
});
