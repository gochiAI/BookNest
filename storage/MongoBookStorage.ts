// storage/MongoBookStorage.ts
import { BookStorage } from '~/interfaces/BookStorage';
import { Book } from '@prisma/client';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const client = new MongoClient(uri);
const dbName = 'bookstore';
const collectionName = 'books';

export class MongoBookStorage implements BookStorage {
  private async getCollection() {
    await client.connect();
    const db = client.db(dbName);
    return db.collection<Book>(collectionName);
  }

  async getAllBooks(): Promise<Book[]> {
    const collection = await this.getCollection();
    return collection.find().toArray();
  }

  async getBookById(id: string): Promise<Book | null> {
    const collection = await this.getCollection();
    return collection.findOne({ _id: new ObjectId(id) });
  }

  async createBook(book: Partial<Book>): Promise<Book> {
    const collection = await this.getCollection();
    const result = await collection.insertOne(book as Book);
    return { ...book, id: result.insertedId.toString() } as Book;
  }

  async updateBook(id: string, book: Partial<Book>): Promise<Book> {
    const collection = await this.getCollection();
    await collection.updateOne({ _id: new ObjectId(id) }, { $set: book });
    return this.getBookById(id) as Promise<Book>;
  }

  async deleteBook(id: string): Promise<void> {
    const collection = await this.getCollection();
    await collection.deleteOne({ _id: new ObjectId(id) });
  }
}