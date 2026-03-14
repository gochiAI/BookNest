import { createHash } from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { createError, defineEventHandler, readBody } from 'h3';
import { $fetch } from 'ofetch';

type CoverFetchBody = {
  isbn?: string;
  title?: string;
  volume?: number | string | null;
  force?: boolean;
  candidateUrl?: string;
  candidateSource?: string;
};

type CoverCandidate = {
  url: string;
  source: string;
  title?: string;
  isbn?: string;
  volume?: number | null;
  score?: number;
  matchedVolume?: boolean;
};

const COVER_DIR = path.join(process.cwd(), 'public', 'covers');
const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10MB
const GOOGLE_BOOKS_ENDPOINT = 'https://www.googleapis.com/books/v1/volumes';
const GOOGLE_BOOKS_API_KEY = (process.env.GOOGLE_BOOKS_API_KEY || '').trim();
const GOOGLE_BOOKS_CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
const GOOGLE_BOOKS_EMPTY_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const GOOGLE_BOOKS_RATE_LIMIT_COOLDOWN_MS = 2 * 60 * 1000; // 2 minutes
const GOOGLE_BOOKS_RATE_LIMIT_LOG_INTERVAL_MS = 30 * 1000; // 30 seconds
const BANGUMI_V0_SEARCH_ENDPOINT = 'https://api.bgm.tv/v0/search/subjects';
const BANGUMI_LEGACY_SEARCH_ENDPOINT = 'https://api.bgm.tv/search/subject';
const BANGUMI_CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
const BANGUMI_EMPTY_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const BANGUMI_RATE_LIMIT_COOLDOWN_MS = 2 * 60 * 1000; // 2 minutes
const BANGUMI_RATE_LIMIT_LOG_INTERVAL_MS = 30 * 1000; // 30 seconds
const OPEN_LIBRARY_API_ENDPOINT = 'https://openlibrary.org/api/books';
const MANGADEX_SEARCH_ENDPOINT = 'https://api.mangadex.org/manga';
const MANGADEX_COVER_BASE = 'https://uploads.mangadex.org/covers';
const MANGADEX_CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
const MANGADEX_EMPTY_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const MANGADEX_RATE_LIMIT_COOLDOWN_MS = 2 * 60 * 1000; // 2 minutes
const MANGADEX_RATE_LIMIT_LOG_INTERVAL_MS = 30 * 1000; // 30 seconds
const ANILIST_GRAPHQL_ENDPOINT = 'https://graphql.anilist.co';
const ANILIST_CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
const ANILIST_EMPTY_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const ANILIST_RATE_LIMIT_COOLDOWN_MS = 2 * 60 * 1000; // 2 minutes
const ANILIST_RATE_LIMIT_LOG_INTERVAL_MS = 30 * 1000; // 30 seconds

type TimedCacheEntry<T> = {
  value: T;
  expiresAt: number;
};

const googleBooksQueryCache = new Map<string, TimedCacheEntry<CoverCandidate[]>>();
let googleBooksCooldownUntil = 0;
let lastGoogleBooksCooldownLogAt = 0;
const bangumiQueryCache = new Map<string, TimedCacheEntry<CoverCandidate[]>>();
let bangumiCooldownUntil = 0;
let lastBangumiCooldownLogAt = 0;
const mangaDexQueryCache = new Map<string, TimedCacheEntry<CoverCandidate[]>>();
let mangaDexCooldownUntil = 0;
let lastMangaDexCooldownLogAt = 0;
const aniListQueryCache = new Map<string, TimedCacheEntry<CoverCandidate[]>>();
let aniListCooldownUntil = 0;
let lastAniListCooldownLogAt = 0;

const normalizeIsbn = (isbn?: string): string => (isbn || '').replace(/\D/g, '');

const normalizeVolume = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return Math.trunc(value);
  }

  if (typeof value === 'string') {
    const match = value.normalize('NFKC').match(/\d+/);
    if (!match) return null;
    const parsed = parseInt(match[0], 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }

  return null;
};

const toSecureUrl = (url: string): string => url.replace(/^http:\/\//i, 'https://').trim();

const slugify = (value: string): string => {
  const normalized = value
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^a-z0-9\-_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return normalized.slice(0, 48) || 'cover';
};

const VOLUME_TOKEN_PATTERN = '[0-9ivxlcdm一二三四五六七八九十百千〇零上中下]+';

const normalizeCircledNumbers = (value: string): string =>
  value
    .replace(/[①-⑳]/g, char => String(char.charCodeAt(0) - 0x2460 + 1))
    .replace(/[㉑-㉟]/g, char => String(char.charCodeAt(0) - 0x3251 + 21))
    .replace(/[㊱-㊿]/g, char => String(char.charCodeAt(0) - 0x32b1 + 36));

const parseRomanNumber = (value: string): number | null => {
  if (!/^[IVXLCDM]+$/i.test(value)) return null;
  const romanValues: Record<string, number> = {
    I: 1,
    V: 5,
    X: 10,
    L: 50,
    C: 100,
    D: 500,
    M: 1000,
  };

  const chars = value.toUpperCase().split('');
  let total = 0;
  for (let i = 0; i < chars.length; i++) {
    const current = romanValues[chars[i]] || 0;
    const next = romanValues[chars[i + 1]] || 0;
    total += current < next ? -current : current;
  }

  return total > 0 ? total : null;
};

const parseKanjiNumber = (value: string): number | null => {
  const kanjiDigits: Record<string, number> = {
    〇: 0,
    零: 0,
    一: 1,
    二: 2,
    三: 3,
    四: 4,
    五: 5,
    六: 6,
    七: 7,
    八: 8,
    九: 9,
  };
  const kanjiUnits: Record<string, number> = {
    十: 10,
    百: 100,
    千: 1000,
  };

  if (!/^[〇零一二三四五六七八九十百千]+$/.test(value)) return null;

  let total = 0;
  let current = 0;
  let hasAny = false;

  for (const char of value) {
    if (char in kanjiDigits) {
      current = current * 10 + kanjiDigits[char];
      hasAny = true;
      continue;
    }
    if (char in kanjiUnits) {
      total += (current || 1) * kanjiUnits[char];
      current = 0;
      hasAny = true;
      continue;
    }
    return null;
  }

  if (!hasAny) return null;
  return total + current;
};

const parseVolumeToken = (token: string): number | null => {
  const normalized = normalizeCircledNumbers(token.normalize('NFKC')).trim();
  if (!normalized) return null;
  if (normalized === '上') return 1;
  if (normalized === '中') return 2;
  if (normalized === '下') return 3;

  if (/^\d+$/.test(normalized)) {
    const parsed = parseInt(normalized, 10);
    return Number.isFinite(parsed) ? parsed : null;
  }

  const roman = parseRomanNumber(normalized);
  if (roman !== null) return roman;

  return parseKanjiNumber(normalized);
};

const normalizeTitleKey = (value?: string): string => {
  if (!value) return '';
  const normalized = normalizeCircledNumbers(value.normalize('NFKC'));
  return normalized
    .toLowerCase()
    .replace(new RegExp(`第\\s*${VOLUME_TOKEN_PATTERN}\\s*(巻|話|部|章|集|冊|編|巻目)`, 'gi'), '')
    .replace(new RegExp(`\\b(?:vol(?:ume)?|no\\.?|episode|ep\\.?|chapter|ch\\.?|part|book)\\s*${VOLUME_TOKEN_PATTERN}\\b`, 'gi'), '')
    .replace(new RegExp(`#\\s*${VOLUME_TOKEN_PATTERN}\\b`, 'gi'), '')
    .replace(new RegExp(`その\\s*${VOLUME_TOKEN_PATTERN}`, 'gi'), '')
    .replace(/[\s\-_:：.,，、・!?！？\[\](){}【】（）]/g, '')
    .trim();
};

const extractVolumeFromText = (value?: string): number | null => {
  if (!value) return null;
  const normalized = normalizeCircledNumbers(value.normalize('NFKC'));
  const patterns = [
    new RegExp(`第\\s*(${VOLUME_TOKEN_PATTERN})\\s*(?:巻|話|部|章|集|冊|編|巻目)`, 'i'),
    new RegExp(`(${VOLUME_TOKEN_PATTERN})\\s*(?:巻|話|部|章|集|冊|編|巻目)`, 'i'),
    new RegExp(`\\b(?:vol(?:ume)?|no\\.?|episode|ep\\.?|chapter|ch\\.?|part|book)\\s*(${VOLUME_TOKEN_PATTERN})\\b`, 'i'),
    new RegExp(`#\\s*(${VOLUME_TOKEN_PATTERN})\\b`, 'i'),
    new RegExp(`その\\s*(${VOLUME_TOKEN_PATTERN})`, 'i'),
    /[（(［\[]\s*([0-9ivxlcdm一二三四五六七八九十百千〇零上中下]+)\s*[）)\]］]/i,
    /[:：]\s*([0-9ivxlcdm一二三四五六七八九十百千〇零上中下]+)\s*$/i,
    /(?:\s+|^)([0-9]{1,3})\s*$/,
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    if (!match) continue;
    const parsed = parseVolumeToken(match[1]);
    if (parsed !== null && parsed > 0 && parsed <= 999) {
      return parsed;
    }
  }

  return null;
};

const inferExtFromUrl = (url: string): string | null => {
  try {
    const pathname = new URL(url).pathname.toLowerCase();
    if (pathname.endsWith('.jpg') || pathname.endsWith('.jpeg')) return 'jpg';
    if (pathname.endsWith('.png')) return 'png';
    if (pathname.endsWith('.webp')) return 'webp';
    if (pathname.endsWith('.avif')) return 'avif';
    if (pathname.endsWith('.gif')) return 'gif';
  } catch {
    return null;
  }
  return null;
};

const inferExtFromContentType = (contentType: string | null): string | null => {
  if (!contentType) return null;
  const lower = contentType.toLowerCase();
  if (lower.includes('image/jpeg') || lower.includes('image/jpg')) return 'jpg';
  if (lower.includes('image/png')) return 'png';
  if (lower.includes('image/webp')) return 'webp';
  if (lower.includes('image/avif')) return 'avif';
  if (lower.includes('image/gif')) return 'gif';
  return null;
};

const extractGoogleIsbn = (item: any): string | undefined => {
  const identifiers = Array.isArray(item?.volumeInfo?.industryIdentifiers)
    ? item.volumeInfo.industryIdentifiers
    : [];

  const isbn13 = identifiers.find((id: any) => id?.type === 'ISBN_13')?.identifier;
  const isbn10 = identifiers.find((id: any) => id?.type === 'ISBN_10')?.identifier;
  const normalized = normalizeIsbn(isbn13 || isbn10 || '');
  return normalized || undefined;
};

const pickGoogleImageLink = (links: any): string | null => {
  if (!links) return null;
  const candidates = [
    links.extraLarge,
    links.large,
    links.medium,
    links.small,
    links.thumbnail,
    links.smallThumbnail,
  ];

  const found = candidates.find((v: unknown) => typeof v === 'string' && (v as string).startsWith('http'));
  return typeof found === 'string' ? toSecureUrl(found) : null;
};

const pickBangumiImageLink = (images: any): string | null => {
  if (!images) return null;

  const candidates = [images.large, images.common, images.medium, images.small, images.grid];
  const found = candidates.find((value: unknown) => typeof value === 'string' && (value as string).startsWith('http'));
  return typeof found === 'string' ? toSecureUrl(found) : null;
};

const pickAniListImageLink = (coverImage: any): string | null => {
  if (!coverImage) return null;

  const candidates = [coverImage.extraLarge, coverImage.large, coverImage.medium];
  const found = candidates.find((value: unknown) => typeof value === 'string' && (value as string).startsWith('http'));
  return typeof found === 'string' ? toSecureUrl(found) : null;
};

const readTimedCache = <T>(cache: Map<string, TimedCacheEntry<T>>, key: string): T | null => {
  const entry = cache.get(key);
  if (!entry) return null;

  if (entry.expiresAt <= Date.now()) {
    cache.delete(key);
    return null;
  }

  return entry.value;
};

const writeTimedCache = <T>(cache: Map<string, TimedCacheEntry<T>>, key: string, value: T, ttlMs: number): void => {
  cache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
};

const getHttpStatusCode = (error: unknown): number | null => {
  if (!error || typeof error !== 'object') return null;
  const maybeError = error as {
    statusCode?: unknown;
    status?: unknown;
    response?: { status?: unknown };
  };

  const candidates = [maybeError.statusCode, maybeError.status, maybeError.response?.status];
  for (const candidate of candidates) {
    if (typeof candidate === 'number' && Number.isFinite(candidate)) {
      return candidate;
    }
  }

  return null;
};

const getGoogleBooksCoversByQuery = async (query: string): Promise<CoverCandidate[]> => {
  const cached = readTimedCache(googleBooksQueryCache, query);
  if (cached) {
    return cached;
  }

  const now = Date.now();
  if (googleBooksCooldownUntil > now) {
    if (now - lastGoogleBooksCooldownLogAt > GOOGLE_BOOKS_RATE_LIMIT_LOG_INTERVAL_MS) {
      console.warn(
        `[cover] Google Books is rate-limited. Skipping requests until ${new Date(
          googleBooksCooldownUntil,
        ).toISOString()}`,
      );
      lastGoogleBooksCooldownLogAt = now;
    }
    return [];
  }

  try {
    const keyQuery = GOOGLE_BOOKS_API_KEY ? `&key=${encodeURIComponent(GOOGLE_BOOKS_API_KEY)}` : '';
    const response = await $fetch<any>(
      `${GOOGLE_BOOKS_ENDPOINT}?q=${encodeURIComponent(query)}&maxResults=8&printType=books${keyQuery}`,
    );

    const items = Array.isArray(response?.items) ? response.items : [];
    const candidates: CoverCandidate[] = [];
    for (const item of items) {
      const volumeInfo = item?.volumeInfo;
      const imageUrl = pickGoogleImageLink(volumeInfo?.imageLinks);
      if (!imageUrl) continue;

      const itemTitle = typeof volumeInfo?.title === 'string' ? volumeInfo.title : undefined;
      const subtitle = typeof volumeInfo?.subtitle === 'string' ? volumeInfo.subtitle : '';
      const titleForVolume = [itemTitle, subtitle].filter(Boolean).join(' ').trim() || itemTitle;
      const itemIsbn = extractGoogleIsbn(item);

      candidates.push({
        url: imageUrl,
        source: 'Google Books',
        title: itemTitle,
        isbn: itemIsbn,
        volume: extractVolumeFromText(titleForVolume),
      });
    }

    writeTimedCache(
      googleBooksQueryCache,
      query,
      candidates,
      candidates.length > 0 ? GOOGLE_BOOKS_CACHE_TTL_MS : GOOGLE_BOOKS_EMPTY_CACHE_TTL_MS,
    );

    return candidates;
  } catch (error) {
    const statusCode = getHttpStatusCode(error);
    if (statusCode === 429) {
      googleBooksCooldownUntil = Date.now() + GOOGLE_BOOKS_RATE_LIMIT_COOLDOWN_MS;
      lastGoogleBooksCooldownLogAt = Date.now();
      console.warn(
        `[cover] Google Books returned 429. Cooling down until ${new Date(googleBooksCooldownUntil).toISOString()}`,
      );
      writeTimedCache(googleBooksQueryCache, query, [], GOOGLE_BOOKS_EMPTY_CACHE_TTL_MS);
      return [];
    }

    console.warn(`[cover] Google Books fetch failed for query "${query}":`, error);
    return [];
  }
};

const parseBangumiInfoboxIsbn = (infobox: unknown): string | undefined => {
  if (!Array.isArray(infobox)) return undefined;

  for (const entry of infobox) {
    if (!entry || typeof entry !== 'object') continue;
    const key = String((entry as { key?: unknown }).key || '').trim().toLowerCase();
    if (!key.includes('isbn')) continue;

    const rawValue = (entry as { value?: unknown }).value;
    const textValue =
      typeof rawValue === 'string'
        ? rawValue
        : Array.isArray(rawValue)
          ? rawValue
              .map(item => (typeof item === 'string' ? item : String((item as { v?: unknown })?.v || '')))
              .join(' ')
          : String(rawValue || '');
    const normalized = normalizeIsbn(textValue);
    if (normalized) return normalized;
  }

  return undefined;
};

const normalizeBangumiCandidates = (items: any[]): CoverCandidate[] => {
  const candidates: CoverCandidate[] = [];

  for (const item of items) {
    const imageUrl = pickBangumiImageLink(item?.images);
    if (!imageUrl) continue;

    const name = typeof item?.name === 'string' ? item.name : '';
    const nameCn = typeof item?.name_cn === 'string' ? item.name_cn : '';
    const title = nameCn || name || undefined;
    const titleForVolume = [nameCn, name].filter(Boolean).join(' ').trim();
    const itemIsbn = parseBangumiInfoboxIsbn(item?.infobox);

    candidates.push({
      url: imageUrl,
      source: 'Bangumi',
      title,
      isbn: itemIsbn,
      volume: extractVolumeFromText(titleForVolume || title),
    });
  }

  return candidates;
};

const getBangumiCoversByQuery = async (query: string): Promise<CoverCandidate[]> => {
  const cached = readTimedCache(bangumiQueryCache, query);
  if (cached) {
    return cached;
  }

  const now = Date.now();
  if (bangumiCooldownUntil > now) {
    if (now - lastBangumiCooldownLogAt > BANGUMI_RATE_LIMIT_LOG_INTERVAL_MS) {
      console.warn(
        `[cover] Bangumi is rate-limited. Skipping requests until ${new Date(bangumiCooldownUntil).toISOString()}`,
      );
      lastBangumiCooldownLogAt = now;
    }
    return [];
  }

  try {
    const v0Response = await $fetch<any>(`${BANGUMI_V0_SEARCH_ENDPOINT}?limit=8&offset=0`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': 'BookNest/1.0 (cover-fetcher)',
      },
      body: {
        keyword: query,
        sort: 'rank',
        filter: {
          type: [1],
        },
      },
    });

    const items = Array.isArray(v0Response?.data) ? v0Response.data : [];
    const candidates = normalizeBangumiCandidates(items);
    writeTimedCache(
      bangumiQueryCache,
      query,
      candidates,
      candidates.length > 0 ? BANGUMI_CACHE_TTL_MS : BANGUMI_EMPTY_CACHE_TTL_MS,
    );
    return candidates;
  } catch (error) {
    const statusCode = getHttpStatusCode(error);
    if (statusCode === 429) {
      bangumiCooldownUntil = Date.now() + BANGUMI_RATE_LIMIT_COOLDOWN_MS;
      lastBangumiCooldownLogAt = Date.now();
      console.warn(`[cover] Bangumi returned 429. Cooling down until ${new Date(bangumiCooldownUntil).toISOString()}`);
      writeTimedCache(bangumiQueryCache, query, [], BANGUMI_EMPTY_CACHE_TTL_MS);
      return [];
    }
  }

  try {
    const legacyResponse = await $fetch<any>(`${BANGUMI_LEGACY_SEARCH_ENDPOINT}/${encodeURIComponent(query)}`, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'BookNest/1.0 (cover-fetcher)',
      },
      query: {
        type: 1,
        responseGroup: 'small',
        max_results: 8,
      },
    });

    const items = Array.isArray(legacyResponse?.list) ? legacyResponse.list : [];
    const candidates = normalizeBangumiCandidates(items);
    writeTimedCache(
      bangumiQueryCache,
      query,
      candidates,
      candidates.length > 0 ? BANGUMI_CACHE_TTL_MS : BANGUMI_EMPTY_CACHE_TTL_MS,
    );
    return candidates;
  } catch (error) {
    const statusCode = getHttpStatusCode(error);
    if (statusCode === 429) {
      bangumiCooldownUntil = Date.now() + BANGUMI_RATE_LIMIT_COOLDOWN_MS;
      lastBangumiCooldownLogAt = Date.now();
      console.warn(`[cover] Bangumi returned 429. Cooling down until ${new Date(bangumiCooldownUntil).toISOString()}`);
      writeTimedCache(bangumiQueryCache, query, [], BANGUMI_EMPTY_CACHE_TTL_MS);
      return [];
    }

    console.warn(`[cover] Bangumi fetch failed for query "${query}":`, error);
    writeTimedCache(bangumiQueryCache, query, [], BANGUMI_EMPTY_CACHE_TTL_MS);
    return [];
  }
};

const getOpenLibraryCovers = async (isbn?: string): Promise<CoverCandidate[]> => {
  const normalizedIsbn = normalizeIsbn(isbn);
  if (!normalizedIsbn) return [];

  try {
    const response = await $fetch<Record<string, any>>(
      `${OPEN_LIBRARY_API_ENDPOINT}?bibkeys=ISBN:${normalizedIsbn}&format=json&jscmd=data`,
      {
        headers: {
          Accept: 'application/json',
        },
      },
    );

    const data = response?.[`ISBN:${normalizedIsbn}`];
    const rawUrl = data?.cover?.large || data?.cover?.medium || data?.cover?.small || '';
    const coverUrl = typeof rawUrl === 'string' ? toSecureUrl(rawUrl) : '';
    if (!coverUrl) return [];

    const title = typeof data?.title === 'string' ? data.title : undefined;
    return [
      {
        url: coverUrl,
        source: 'Open Library',
        title,
        isbn: normalizedIsbn,
        volume: extractVolumeFromText(title),
      },
    ];
  } catch (error) {
    console.warn('[cover] Open Library fetch failed:', error);
    return [];
  }
};

const pickMangaDexTitle = (attributes: any): string | undefined => {
  const titleMap = attributes?.title;
  if (titleMap && typeof titleMap === 'object') {
    const values = Object.values(titleMap).filter(value => typeof value === 'string' && value.trim() !== '');
    if (values.length > 0) {
      return String(values[0]).trim();
    }
  }

  const altTitles = Array.isArray(attributes?.altTitles) ? attributes.altTitles : [];
  for (const altTitle of altTitles) {
    if (!altTitle || typeof altTitle !== 'object') continue;
    const values = Object.values(altTitle).filter(value => typeof value === 'string' && value.trim() !== '');
    if (values.length > 0) {
      return String(values[0]).trim();
    }
  }

  return undefined;
};

const normalizeMangaDexCandidates = (items: any[]): CoverCandidate[] => {
  const candidates: CoverCandidate[] = [];

  for (const item of items) {
    const mangaId = typeof item?.id === 'string' ? item.id : '';
    if (!mangaId) continue;

    const relationships = Array.isArray(item?.relationships) ? item.relationships : [];
    const coverRelationship = relationships.find((relationship: any) => relationship?.type === 'cover_art');
    const fileName =
      typeof coverRelationship?.attributes?.fileName === 'string' ? coverRelationship.attributes.fileName : '';
    if (!fileName) continue;

    const title = pickMangaDexTitle(item?.attributes);
    const volumeFromRelationship = normalizeVolume(coverRelationship?.attributes?.volume);
    const safeMangaId = encodeURIComponent(mangaId);
    const safeFileName = encodeURIComponent(fileName);
    const imageUrl = `${MANGADEX_COVER_BASE}/${safeMangaId}/${safeFileName}.512.jpg`;

    candidates.push({
      url: toSecureUrl(imageUrl),
      source: 'MangaDex',
      title,
      volume: volumeFromRelationship ?? extractVolumeFromText(title),
    });
  }

  return candidates;
};

const normalizeAniListCandidates = (mediaList: any[]): CoverCandidate[] => {
  const candidates: CoverCandidate[] = [];

  for (const media of mediaList) {
    const imageUrl = pickAniListImageLink(media?.coverImage);
    if (!imageUrl) continue;

    const title =
      (typeof media?.title?.english === 'string' && media.title.english) ||
      (typeof media?.title?.romaji === 'string' && media.title.romaji) ||
      (typeof media?.title?.native === 'string' && media.title.native) ||
      undefined;

    candidates.push({
      url: imageUrl,
      source: 'AniList',
      title,
      volume: extractVolumeFromText(title),
    });
  }

  return candidates;
};

const getMangaDexCoversByQuery = async (query: string): Promise<CoverCandidate[]> => {
  const cached = readTimedCache(mangaDexQueryCache, query);
  if (cached) {
    return cached;
  }

  const now = Date.now();
  if (mangaDexCooldownUntil > now) {
    if (now - lastMangaDexCooldownLogAt > MANGADEX_RATE_LIMIT_LOG_INTERVAL_MS) {
      console.warn(
        `[cover] MangaDex is rate-limited. Skipping requests until ${new Date(mangaDexCooldownUntil).toISOString()}`,
      );
      lastMangaDexCooldownLogAt = now;
    }
    return [];
  }

  try {
    const url =
      `${MANGADEX_SEARCH_ENDPOINT}?title=${encodeURIComponent(query)}` +
      '&limit=8&includes[]=cover_art&order[relevance]=desc';
    const response = await $fetch<any>(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'BookNest/1.0 (cover-fetcher)',
      },
    });

    const items = Array.isArray(response?.data) ? response.data : [];
    const candidates = normalizeMangaDexCandidates(items);
    writeTimedCache(
      mangaDexQueryCache,
      query,
      candidates,
      candidates.length > 0 ? MANGADEX_CACHE_TTL_MS : MANGADEX_EMPTY_CACHE_TTL_MS,
    );
    return candidates;
  } catch (error) {
    const statusCode = getHttpStatusCode(error);
    if (statusCode === 429) {
      mangaDexCooldownUntil = Date.now() + MANGADEX_RATE_LIMIT_COOLDOWN_MS;
      lastMangaDexCooldownLogAt = Date.now();
      console.warn(
        `[cover] MangaDex returned 429. Cooling down until ${new Date(mangaDexCooldownUntil).toISOString()}`,
      );
      writeTimedCache(mangaDexQueryCache, query, [], MANGADEX_EMPTY_CACHE_TTL_MS);
      return [];
    }

    console.warn(`[cover] MangaDex fetch failed for query "${query}":`, error);
    writeTimedCache(mangaDexQueryCache, query, [], MANGADEX_EMPTY_CACHE_TTL_MS);
    return [];
  }
};

const getAniListCoversByQuery = async (query: string): Promise<CoverCandidate[]> => {
  const cached = readTimedCache(aniListQueryCache, query);
  if (cached) {
    return cached;
  }

  const now = Date.now();
  if (aniListCooldownUntil > now) {
    if (now - lastAniListCooldownLogAt > ANILIST_RATE_LIMIT_LOG_INTERVAL_MS) {
      console.warn(
        `[cover] AniList is rate-limited. Skipping requests until ${new Date(aniListCooldownUntil).toISOString()}`,
      );
      lastAniListCooldownLogAt = now;
    }
    return [];
  }

  try {
    const queryText = `
      query ($search: String) {
        Page(page: 1, perPage: 8) {
          media(search: $search, type: MANGA, sort: SEARCH_MATCH) {
            title { romaji english native }
            coverImage { extraLarge large medium }
          }
        }
      }
    `;

    const response = await $fetch<any>(ANILIST_GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': 'BookNest/1.0 (cover-fetcher)',
      },
      body: {
        query: queryText,
        variables: { search: query },
      },
    });

    const media = Array.isArray(response?.data?.Page?.media) ? response.data.Page.media : [];
    const candidates = normalizeAniListCandidates(media);
    writeTimedCache(
      aniListQueryCache,
      query,
      candidates,
      candidates.length > 0 ? ANILIST_CACHE_TTL_MS : ANILIST_EMPTY_CACHE_TTL_MS,
    );
    return candidates;
  } catch (error) {
    const statusCode = getHttpStatusCode(error);
    if (statusCode === 429) {
      aniListCooldownUntil = Date.now() + ANILIST_RATE_LIMIT_COOLDOWN_MS;
      lastAniListCooldownLogAt = Date.now();
      console.warn(`[cover] AniList returned 429. Cooling down until ${new Date(aniListCooldownUntil).toISOString()}`);
      writeTimedCache(aniListQueryCache, query, [], ANILIST_EMPTY_CACHE_TTL_MS);
      return [];
    }

    console.warn(`[cover] AniList fetch failed for query "${query}":`, error);
    writeTimedCache(aniListQueryCache, query, [], ANILIST_EMPTY_CACHE_TTL_MS);
    return [];
  }
};

const scoreCandidate = (
  candidate: CoverCandidate,
  request: { title?: string; isbn?: string; volume?: number | null },
): { score: number; matchedVolume: boolean } => {
  let score = 0;
  let matchedVolume = false;

  const requestTitle = normalizeTitleKey(request.title);
  const candidateTitle = normalizeTitleKey(candidate.title);

  if (requestTitle && candidateTitle) {
    if (requestTitle === candidateTitle) {
      score += 35;
    } else if (candidateTitle.includes(requestTitle) || requestTitle.includes(candidateTitle)) {
      score += 24;
    } else if (candidateTitle.slice(0, 8) === requestTitle.slice(0, 8)) {
      score += 10;
    }
  }

  const requestVolume = request.volume ?? null;
  const candidateVolume = candidate.volume ?? extractVolumeFromText(candidate.title);
  if (requestVolume !== null) {
    if (candidateVolume === requestVolume) {
      matchedVolume = true;
      score += 60;
    } else if (candidateVolume === null) {
      score += 6;
    } else if (Math.abs(candidateVolume - requestVolume) === 1) {
      score += 4;
    } else {
      score -= 18;
    }
  } else if (candidateVolume !== null) {
    score += 8;
  }

  const requestIsbn = normalizeIsbn(request.isbn);
  const candidateIsbn = normalizeIsbn(candidate.isbn);
  if (requestIsbn && candidateIsbn && requestIsbn === candidateIsbn) {
    score += 40;
  }

  if (candidate.source === 'openBD') {
    score += 12;
  } else if (candidate.source === 'Bangumi') {
    score += 9;
  } else if (candidate.source === 'MangaDex') {
    score += 8;
  } else if (candidate.source === 'Open Library') {
    score += 7;
  } else if (candidate.source === 'AniList') {
    score += 7;
  } else if (candidate.source === 'Google Books') {
    score += 6;
  }

  return { score, matchedVolume };
};

const dedupeCandidates = (candidates: CoverCandidate[]): CoverCandidate[] => {
  const map = new Map<string, CoverCandidate>();
  for (const candidate of candidates) {
    const key = toSecureUrl(candidate.url);
    if (!key) continue;
    if (!map.has(key)) {
      map.set(key, { ...candidate, url: key });
    }
  }
  return Array.from(map.values());
};

const rankCandidates = (
  candidates: CoverCandidate[],
  request: { title?: string; isbn?: string; volume?: number | null },
): CoverCandidate[] => {
  return candidates
    .map(candidate => {
      const { score, matchedVolume } = scoreCandidate(candidate, request);
      return {
        ...candidate,
        volume: candidate.volume ?? extractVolumeFromText(candidate.title),
        score,
        matchedVolume,
      };
    })
    .sort((a, b) => {
      const byScore = (b.score || 0) - (a.score || 0);
      if (byScore !== 0) return byScore;

      if ((a.matchedVolume ? 1 : 0) !== (b.matchedVolume ? 1 : 0)) {
        return (b.matchedVolume ? 1 : 0) - (a.matchedVolume ? 1 : 0);
      }

      return 0;
    });
};

const toResponseCandidates = (candidates: CoverCandidate[]) =>
  candidates.map(candidate => ({
    remoteUrl: candidate.url,
    previewUrl: candidate.url,
    source: candidate.source,
    title: candidate.title,
    isbn: candidate.isbn,
    volume: candidate.volume ?? null,
    score: candidate.score,
    matchedVolume: candidate.matchedVolume,
  }));

const getOpenBDCovers = async (isbn: string): Promise<CoverCandidate[]> => {
  if (!isbn) return [];

  try {
    const response = await $fetch<any[]>(`https://api.openbd.jp/v1/get?isbn=${isbn}`);
    const summary = response?.[0]?.summary;
    const cover = summary?.cover;

    if (typeof cover === 'string' && cover.startsWith('http')) {
      const title = typeof summary?.title === 'string' ? summary.title : undefined;
      const summaryIsbn = typeof summary?.isbn === 'string' ? summary.isbn : undefined;
      return [
        {
          url: toSecureUrl(cover),
          source: 'openBD',
          title,
          isbn: normalizeIsbn(summaryIsbn || isbn) || undefined,
          volume: extractVolumeFromText(title),
        },
      ];
    }
  } catch (error) {
    console.warn('[cover] openBD fetch failed:', error);
  }

  return [];
};

const getGoogleBooksCovers = async (isbn?: string, title?: string): Promise<CoverCandidate[]> => {
  if (!isbn && !title) return [];

  const normalizedTitle = (title || '').trim();
  const queries = Array.from(
    new Set(
      [
        isbn && normalizedTitle ? `isbn:${isbn} intitle:${normalizedTitle}` : '',
        isbn ? `isbn:${isbn}` : '',
        normalizedTitle ? `intitle:${normalizedTitle}` : '',
      ].filter(Boolean),
    ),
  );

  const candidates: CoverCandidate[] = [];

  for (const query of queries) {
    const fetchedCandidates = await getGoogleBooksCoversByQuery(query);
    if (fetchedCandidates.length > 0) {
      candidates.push(...fetchedCandidates);
    }

    const hasExactIsbn = isbn
      ? fetchedCandidates.some(candidate => normalizeIsbn(candidate.isbn) === normalizeIsbn(isbn))
      : false;

    if (hasExactIsbn || candidates.length >= 10) {
      break;
    }
  }

  return candidates;
};

const getBangumiCovers = async (isbn?: string, title?: string): Promise<CoverCandidate[]> => {
  if (!isbn && !title) return [];

  const normalizedTitle = (title || '').trim();
  const queries = Array.from(
    new Set(
      [
        isbn && normalizedTitle ? `${isbn} ${normalizedTitle}` : '',
        isbn ? isbn : '',
        normalizedTitle ? normalizedTitle : '',
      ].filter(Boolean),
    ),
  );

  const candidates: CoverCandidate[] = [];

  for (const query of queries) {
    const fetchedCandidates = await getBangumiCoversByQuery(query);
    if (fetchedCandidates.length > 0) {
      candidates.push(...fetchedCandidates);
    }

    const hasExactIsbn = isbn
      ? fetchedCandidates.some(candidate => normalizeIsbn(candidate.isbn) === normalizeIsbn(isbn))
      : false;

    if (hasExactIsbn || candidates.length >= 10) {
      break;
    }
  }

  return candidates;
};

const getMangaDexCovers = async (isbn?: string, title?: string): Promise<CoverCandidate[]> => {
  if (!isbn && !title) return [];

  const normalizedTitle = (title || '').trim();
  const queries = Array.from(new Set([normalizedTitle, isbn || ''].filter(Boolean)));
  const candidates: CoverCandidate[] = [];

  for (const query of queries) {
    const fetchedCandidates = await getMangaDexCoversByQuery(query);
    if (fetchedCandidates.length > 0) {
      candidates.push(...fetchedCandidates);
    }

    if (candidates.length >= 10) {
      break;
    }
  }

  return candidates;
};

const getAniListCovers = async (isbn?: string, title?: string): Promise<CoverCandidate[]> => {
  if (!isbn && !title) return [];

  const normalizedTitle = (title || '').trim();
  const queries = Array.from(new Set([normalizedTitle, isbn || ''].filter(Boolean)));
  const candidates: CoverCandidate[] = [];

  for (const query of queries) {
    const fetchedCandidates = await getAniListCoversByQuery(query);
    if (fetchedCandidates.length > 0) {
      candidates.push(...fetchedCandidates);
    }

    if (candidates.length >= 10) {
      break;
    }
  }

  return candidates;
};

const saveCoverImage = async (
  candidate: CoverCandidate,
  keySource: string,
  force = false,
): Promise<string> => {
  await fs.mkdir(COVER_DIR, { recursive: true });

  const hash = createHash('sha1').update(candidate.url).digest('hex').slice(0, 10);
  const baseName = `${keySource}-${hash}`;
  const guessedExt = inferExtFromUrl(candidate.url) || 'jpg';
  const guessedPath = path.join(COVER_DIR, `${baseName}.${guessedExt}`);

  if (!force) {
    try {
      await fs.access(guessedPath);
      return `/covers/${baseName}.${guessedExt}`;
    } catch {
      // no-op
    }
  }

  const response = await fetch(candidate.url, {
    method: 'GET',
    redirect: 'follow',
    headers: {
      'User-Agent': 'BookNest/1.0',
    },
  });

  if (!response.ok) {
    throw new Error(`Cover download failed: ${response.status}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.byteLength === 0) {
    throw new Error('Downloaded image is empty');
  }
  if (buffer.byteLength > MAX_IMAGE_BYTES) {
    throw new Error('Downloaded image is too large');
  }

  const extFromType = inferExtFromContentType(response.headers.get('content-type'));
  const finalExt = extFromType || guessedExt;
  const finalFilename = `${baseName}.${finalExt}`;
  const finalPath = path.join(COVER_DIR, finalFilename);

  if (!force) {
    try {
      await fs.access(finalPath);
      return `/covers/${finalFilename}`;
    } catch {
      // no-op
    }
  }

  await fs.writeFile(finalPath, buffer);
  return `/covers/${finalFilename}`;
};

export default defineEventHandler(async event => {
  try {
    const body = await readBody<CoverFetchBody>(event);
    const isbn = normalizeIsbn(body?.isbn);
    const title = (body?.title || '').trim();
    const volume = normalizeVolume(body?.volume);
    const force = Boolean(body?.force);

    if (!isbn && !title && !body?.candidateUrl) {
      return { coverUrl: null, source: null, candidates: [] };
    }

    if (body?.candidateUrl) {
      const candidateUrl = toSecureUrl(String(body.candidateUrl));
      if (!candidateUrl.startsWith('http://') && !candidateUrl.startsWith('https://')) {
        throw new Error('Invalid candidate URL');
      }

      const directCandidate: CoverCandidate = {
        url: candidateUrl,
        source: body.candidateSource || 'manual',
        title: title || undefined,
        isbn: isbn || undefined,
        volume,
      };

      const keySource = isbn || slugify(title || `volume-${volume || 'unknown'}`);
      const coverUrl = await saveCoverImage(directCandidate, keySource, force);

      return {
        coverUrl,
        source: directCandidate.source,
        remoteUrl: directCandidate.url,
        candidates: [],
      };
    }

    const allCandidates = dedupeCandidates([
      ...(await getOpenBDCovers(isbn)),
      ...(await getOpenLibraryCovers(isbn)),
      ...(await getBangumiCovers(isbn, title)),
      ...(await getMangaDexCovers(isbn, title)),
      ...(await getAniListCovers(isbn, title)),
      ...(await getGoogleBooksCovers(isbn, title)),
    ]);

    if (allCandidates.length === 0) {
      return { coverUrl: null, source: null, candidates: [] };
    }

    const ranked = rankCandidates(allCandidates, {
      title: title || undefined,
      isbn: isbn || undefined,
      volume,
    }).slice(0, 10);

    const requestedVolume = volume ?? null;
    const matchedVolumeCandidates =
      requestedVolume !== null ? ranked.filter(candidate => candidate.matchedVolume) : [];
    const knownVolumeCandidates =
      requestedVolume !== null
        ? ranked.filter(
            candidate => !candidate.matchedVolume && candidate.volume !== null && candidate.volume !== undefined,
          )
        : [];

    const selectableCandidates =
      requestedVolume !== null && matchedVolumeCandidates.length > 0 ? matchedVolumeCandidates : ranked;

    // 巻数指定時に「明確な不一致しかない」場合は誤選択を避ける
    if (requestedVolume !== null && matchedVolumeCandidates.length === 0 && knownVolumeCandidates.length > 0) {
      return {
        coverUrl: null,
        source: null,
        candidates: toResponseCandidates(ranked),
      };
    }

    const keySource = isbn || slugify(title || ranked[0]?.title || 'cover');

    let selectedCandidate: CoverCandidate | null = null;
    let coverUrl: string | null = null;

    for (const candidate of selectableCandidates) {
      try {
        coverUrl = await saveCoverImage(candidate, keySource, force);
        selectedCandidate = candidate;
        break;
      } catch (error) {
        console.warn('[cover] candidate save failed:', candidate.url, error);
      }
    }

    if (!selectedCandidate || !coverUrl) {
      return {
        coverUrl: null,
        source: null,
        candidates: toResponseCandidates(ranked),
      };
    }

    return {
      coverUrl,
      source: selectedCandidate.source,
      remoteUrl: selectedCandidate.url,
      candidates: toResponseCandidates(ranked),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch and save cover image';
    throw createError({ statusCode: 500, message });
  }
});
