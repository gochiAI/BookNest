import { defineEventHandler, getQuery, createError } from 'h3';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
    try {
        const { query, type } = getQuery(event);
        const queryStr = (query as string)?.trim() || '';
        
        if (!queryStr || queryStr.length < 1) {
            return { authors: [], series: [], publishers: [] };
        }

        // タイプ別に検索結果を処理
        const searchType = (type as string) || 'all';

        let authors: string[] = [];
        let series: string[] = [];
        let publishers: string[] = [];

        if (searchType === 'all' || searchType === 'author' || searchType === 'by-title') {
            // タイプが'by-title'の場合、タイトルから著者を検索
            if (searchType === 'by-title') {
                const books = await prisma.book.findMany({
                    where: {
                        title: { contains: queryStr }
                    },
                    select: {
                        authors: {
                            select: {
                                author: {
                                    select: { name: true }
                                }
                            }
                        }
                    },
                    take: 10
                });
                // 著者を重複なく抽出
                const authorSet = new Set<string>();
                books.forEach(book => {
                    book.authors.forEach(ba => {
                        authorSet.add(ba.author.name);
                    });
                });
                authors = Array.from(authorSet);
            } else {
                // 通常の著者検索
                authors = await prisma.author.findMany({
                    where: {
                        name: { contains: queryStr }
                    },
                    select: { name: true },
                    take: 10
                }).then(results => results.map(a => a.name));
            }
        }

        if (searchType === 'all' || searchType === 'series' || searchType === 'by-title') {
            // タイプが'by-title'の場合、タイトルからシリーズを検索
            if (searchType === 'by-title') {
                const books = await prisma.book.findMany({
                    where: {
                        title: { contains: queryStr }
                    },
                    select: {
                        series: {
                            select: { name: true }
                        }
                    },
                    take: 10
                });
                // シリーズを重複なく抽出
                const seriesSet = new Set<string>();
                books.forEach(book => {
                    if (book.series) {
                        seriesSet.add(book.series.name);
                    }
                });
                series = Array.from(seriesSet);
            } else {
                // 通常のシリーズ検索
                series = await prisma.series.findMany({
                    where: {
                        name: { contains: queryStr }
                    },
                    select: { name: true },
                    take: 10
                }).then(results => results.map(s => s.name));
            }
        }

        if (searchType === 'all' || searchType === 'publisher') {
            publishers = await prisma.publisher.findMany({
                where: {
                    name: { contains: queryStr }
                },
                select: { name: true },
                take: 10
            }).then(results => results.map(p => p.name));
        }

        return {
            authors,
            series,
            publishers
        };
    } catch (error) {
        console.error('Autocomplete API error:', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});