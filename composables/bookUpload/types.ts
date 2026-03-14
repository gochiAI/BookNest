export interface CoverCandidate {
  remoteUrl: string;
  previewUrl?: string;
  source: string;
  title?: string;
  isbn?: string;
  volume?: number | null;
  score?: number;
  matchedVolume?: boolean;
}

export interface Book {
  id?: number;
  title: string;
  author: string;
  isbn: string;
  publisher: string;
  publishedYear: string;
  volume?: number;
  coverUrl?: string;
  coverPreviewUrl?: string;
  coverSource?: string;
  coverStatus?: 'idle' | 'loading' | 'done' | 'error';
  coverCandidates?: CoverCandidate[];
  selectedCoverRemoteUrl?: string;
  filters?: string[];
  selected?: boolean;
}

export interface EnrichmentCandidate {
  title: string;
  author: string;
  isbn: string;
  publisher: string;
  publishedYear: string;
  volume: number | null;
  source: string;
}

export type CsvEncoding = 'UTF-8' | 'Shift_JIS';
export type HeaderField = 'title' | 'author' | 'isbn' | 'publisher' | 'label' | 'year' | 'ignore';
export type HeaderMapping = Record<number, HeaderField>;
export type DetectedFieldType = 'isbn' | 'year' | 'publisher' | 'date' | 'text' | null;
export type ParsedCSV = { rows: string[][]; headerMapping: HeaderMapping | null };

export type ExistingBooksResponse = {
  existingIsbns?: string[];
  existingTitleVolumes?: Array<{ title: string; volume: number | null }>;
};

export type GoogleBooksResponse = {
  items?: Array<{
    volumeInfo?: {
      title?: string;
      authors?: string[];
      publisher?: string;
      publishedDate?: string;
      industryIdentifiers?: Array<{ type?: string; identifier?: string }>;
    };
  }>;
};
