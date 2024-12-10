import { PrismaClient } from "@prisma/client";
import { defineEventHandler, readBody,createError } from "h3";
import {v4 as uuidv4} from "uuid";
import { BOOK_TYPES,STATUS_TYPES } from "~/constants/Types";

declare global {
  var prisma: PrismaClient | undefined;
}
const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV === "production") {
  global.prisma = prisma;
}

export default defineEventHandler(async (event) => {
  const method = event.node.req.method;

  if (method === "GET") {
    try{
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
  } catch (e: any) {
    throw createError({
      status: 500,
      statusText: "Internal Server Error",
      message: e.message,
    });
  }
  } else if (method === "POST") {
    const body = await readBody(event);
    if (!body.title || !body.authorName || !body.publisherName || !body.bookTypeId || !body.readStatusId) {
      throw createError({
        status: 400,
        statusText: "Bad Request",
        message: "title, authorName, publisherName, bookTypeId, and readStatusId are required",
      });
    }

    let author = await prisma.author.findUnique({where: {name: body.authorName}});
    if (!author) {
      author = await prisma.author.create({data: {id: uuidv4(), name: body.authorName}});
    }
    let publisher = await prisma.publisher.findUnique({where: {name: body.publisherName}});
    if (!publisher) {
      publisher = await prisma.publisher.create({data: {id: uuidv4(), name: body.publisherName}});
    }
    let series = null;
    if (body.seriesName) {
      series = await prisma.series.findUnique({ where: { name: body.seriesName } })
      if (!series) {
        series = await prisma.series.create({
          data: { id: uuidv4(), name: body.seriesName },
        })
      }
    }

    let bookType = await prisma.bookType.findUnique({where: {id: parseInt(body.bookTypeId)}});
    if (!bookType) {
      if(Object.values(BOOK_TYPES).includes(body.bookTypeId)){
        bookType = await prisma.bookType.create({data: {id: parseInt(body.bookTypeId), name: getType("bookTypeId",body.bookTypeId)}});
      }
      else{
        throw createError({
          status: 400,
          statusText: "Bad Request",
          message: "bookTypeId is invalid",
        });
      }
    }
    let readStatus = await prisma.readStatus.findUnique({where: {id: parseInt(body.readStatusId)}});
    if (!readStatus) {
      if(Object.values(STATUS_TYPES).includes(body.readStatusId)){
        readStatus = await prisma.readStatus.create({data: {id: parseInt(body.readStatusId), name: getType("readStatusId",body.readStatusId)}});
      }else{
        throw createError({
          status: 400,
          statusText: "Bad Request",
          message: "readStatusId is invalid",
        });
      }
    }

    // Create or connect related records
    const newbook = await prisma.book.create({
      data: {
        title: body.title,
        releaseDate: body.releaseDate ? new Date(body.releaseDate) : null,
        cover: body.cover || null,
        authorId: author.id,
        publisherId: publisher.id,
        seriesId: series ? series.id : null,
        volume: body.volume? parseInt(body.volume) : null,
        isbn: body.isbn || null,
        bookTypeId: parseInt(body.bookTypeId),
        readStatusId: parseInt(body.readStatusId),
      },
      include: {
        author: true,
        publisher: true,
        series: true,
        bookType: true,
        readStatus: true,
      },
    });
    return newbook;
  }
});

function getType(value:string,id:string):string{
  if(value === "bookTypeId"){
    switch(id){
      case "1":
        return "General";
      case "2":
        return "Manga";
      case "3":
        return "Light Novel";
      case "4":
        return "Other";
      default:
        return "Unknown";
    }
  }
  if(value === "readStatusId"){
    switch(id){
      case "1":
        return "Completed";
      case "2":
        return "Reading";
      case "3":
        return "Unread";
      default:
        return "Unknown";
    }
  }
  return "Unknown";
}
