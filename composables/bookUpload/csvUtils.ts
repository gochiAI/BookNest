import type { Book, DetectedFieldType, HeaderMapping, ParsedCSV } from './types';
import {
  isEmptyLikeValue,
  normalizeForComparison,
  normalizeHeaderToken,
  normalizeIsbnDigits,
  normalizeWidth,
} from './textNormalization';
import { extractFiltersFromTitle, extractVolumeFromTitle, removeFiltersFromTitle } from './titleUtils';

export const parseCSV = (text: string): ParsedCSV => {
  const lines = text.split(/\r?\n/).filter(line => line.trim());
  if (lines.length === 0) return { rows: [], headerMapping: null };

  const parseCSVLine = (line: string): string[] => {
    const cells: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const normalizedChar = char === '＂' ? '"' : char;

      if (normalizedChar === '"') {
        const nextChar = line[i + 1];
        const normalizedNextChar = nextChar === '＂' ? '"' : nextChar;
        if (inQuotes && normalizedNextChar === '"') {
          current += '"';
          i++;
          continue;
        }
        inQuotes = !inQuotes;
      } else if ((char === ',' || char === '，') && !inQuotes) {
        cells.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    cells.push(current.trim());
    return cells;
  };

  const rows = lines.map(parseCSVLine);
  const firstRow = rows[0];
  const headerMapping = detectHeaders(firstRow);

  if (headerMapping) {
    return { rows: rows.slice(1), headerMapping };
  }

  return { rows, headerMapping: null };
};

export const detectHeaders = (headerRow: string[]): HeaderMapping | null => {
  const mapping: HeaderMapping = {};
  let hasValidHeader = false;

  headerRow.forEach((header, index) => {
    const normalized = normalizeHeaderToken(header);

    if (
      normalized.includes('title') ||
      normalized.includes('タイトル') ||
      normalized.includes('書名') ||
      normalized.includes('書誌名') ||
      normalized.includes('本')
    ) {
      mapping[index] = 'title';
      hasValidHeader = true;
    } else if (
      normalized.includes('author') ||
      normalized.includes('著者') ||
      normalized.includes('作者') ||
      normalized.includes('筆者')
    ) {
      mapping[index] = 'author';
      hasValidHeader = true;
    } else if (normalized.includes('isbn')) {
      mapping[index] = 'isbn';
      hasValidHeader = true;
    } else if (normalized.includes('publisher') || normalized.includes('出版社')) {
      mapping[index] = 'publisher';
      hasValidHeader = true;
    } else if (normalized.includes('レーベル') || normalized.includes('label')) {
      mapping[index] = 'label';
      hasValidHeader = true;
    } else if (
      normalized.includes('year') ||
      normalized.includes('出版年') ||
      normalized.includes('刊行年') ||
      normalized.includes('発行年')
    ) {
      mapping[index] = 'year';
      hasValidHeader = true;
    } else if (normalized.includes('購入日') || normalized.includes('日付') || normalized.includes('date')) {
      mapping[index] = 'ignore';
      hasValidHeader = true;
    } else if (normalized.includes('アーカイブ') || normalized.includes('archive')) {
      mapping[index] = 'ignore';
      hasValidHeader = true;
    }
  });

  return hasValidHeader ? mapping : null;
};

export const parseRowWithHeaders = (row: string[], headerMapping: HeaderMapping): Book => {
  const book: Book = {
    title: '',
    author: '',
    isbn: '',
    publisher: '',
    publishedYear: '',
    volume: undefined,
    filters: [],
  };

  row.forEach((cell, index) => {
    const fieldType = headerMapping[index];
    const value = cell.trim();

    if (isEmptyLikeValue(value)) {
      return;
    }

    switch (fieldType) {
      case 'title':
        book.title = value;
        break;
      case 'author':
        book.author = value;
        break;
      case 'isbn':
        book.isbn = normalizeIsbnDigits(value);
        break;
      case 'publisher':
        book.publisher = value;
        break;
      case 'label':
        book.publisher = book.publisher ? `${book.publisher} (${value})` : value;
        break;
      case 'year': {
        const yearMatch = normalizeWidth(value).match(/\d{4}/);
        if (yearMatch) {
          book.publishedYear = yearMatch[0];
        }
        break;
      }
      case 'ignore':
        break;
    }
  });

  if (book.title) {
    const { title, volume } = extractVolumeFromTitle(book.title);
    book.title = title;
    if (volume !== null) {
      book.volume = volume;
    }
  }

  book.filters = extractFiltersFromTitle(book.title);
  book.title = removeFiltersFromTitle(book.title);

  return book;
};

export const detectFieldType = (value: string): DetectedFieldType => {
  if (isEmptyLikeValue(value)) return null;

  const normalized = normalizeWidth(value).trim();

  const isbnPattern = /^[\d\-]{10,17}$/;
  if (isbnPattern.test(normalized.replace(/-/g, ''))) {
    const digits = normalized.replace(/\D/g, '');
    if (digits.length === 10 || digits.length === 13) {
      return 'isbn';
    }
  }

  if (/^\d{4}$/.test(normalized)) {
    const year = parseInt(normalized, 10);
    if (year >= 1900 && year <= 2100) {
      return 'year';
    }
  }

  const publisherKeywords = ['出版', '社', '書店', 'プレス', 'press', '文庫', '新書', 'kadokawa', '講談社', '集英社', '小学館'];
  const normalizedForComparison = normalizeForComparison(value);
  if (publisherKeywords.some(keyword => normalizedForComparison.includes(keyword))) {
    return 'publisher';
  }

  if (/\d{4}[年\/-]\d{1,2}[月\/-]\d{1,2}日?/.test(normalized)) {
    return 'date';
  }

  return 'text';
};

export const parseRowSmart = (row: string[]): Book => {
  const book: Book = {
    title: '',
    author: '',
    isbn: '',
    publisher: '',
    publishedYear: '',
    volume: undefined,
    filters: [],
  };

  const textFields: string[] = [];

  row.forEach(cell => {
    const value = cell.trim();
    const type = detectFieldType(value);

    switch (type) {
      case 'isbn':
        book.isbn = normalizeIsbnDigits(value);
        break;
      case 'year':
        book.publishedYear = normalizeWidth(value);
        break;
      case 'publisher':
        book.publisher = value;
        break;
      case 'date':
        break;
      case 'text':
        textFields.push(value);
        break;
    }
  });

  if (textFields.length > 0) {
    book.title = textFields[0];
    if (textFields.length > 1) {
      book.author = textFields[1];
    }
  }

  if (book.title) {
    const { title, volume } = extractVolumeFromTitle(book.title);
    book.title = title;
    if (volume !== null) {
      book.volume = volume;
    }
  }

  book.filters = extractFiltersFromTitle(book.title);
  book.title = removeFiltersFromTitle(book.title);

  return book;
};
