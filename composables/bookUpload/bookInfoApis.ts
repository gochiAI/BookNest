import { $fetch } from 'ofetch';
import type { EnrichmentCandidate, GoogleBooksResponse } from './types';
import { extractVolumeFromTitle } from './titleUtils';

export const fetchFromOpenBD = async (isbn: string): Promise<EnrichmentCandidate[]> => {
  try {
    const response = await $fetch<any[]>(`https://api.openbd.jp/v1/get?isbn=${isbn}`);
    if (response && response[0]) {
      const book = response[0];
      const summary = book.summary || {};
      const onix = book.onix || {};
      const descriptiveDetail = onix.DescriptiveDetail || {};
      const publishingDetail = onix.PublishingDetail || {};

      const rawTitle = summary.title || descriptiveDetail.TitleDetail?.TitleElement?.TitleText?.content || '';
      const { title, volume } = extractVolumeFromTitle(rawTitle);

      return [
        {
          title,
          author: summary.author || descriptiveDetail.Contributor?.[0]?.PersonName?.content || '',
          publisher: summary.publisher || publishingDetail.Publisher?.[0]?.PublisherName || '',
          publishedYear: summary.pubdate ? summary.pubdate.substring(0, 4) : '',
          isbn: summary.isbn || isbn || '',
          volume,
          source: 'openBD',
        },
      ];
    }
  } catch (error) {
    console.warn('openBD APIエラー:', error);
  }
  return [];
};

export const fetchFromNDL = async (title: string, maxResults = 5): Promise<EnrichmentCandidate[]> => {
  try {
    const encodedTitle = encodeURIComponent(title);
    const response = await $fetch<string>(
      `https://ndlsearch.ndl.go.jp/api/opensearch?title=${encodedTitle}&cnt=${maxResults}`,
    );

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(response, 'text/xml');

    const items = xmlDoc.getElementsByTagName('item');
    const results: EnrichmentCandidate[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const titleEl = item.getElementsByTagName('title')[0];
      const authorEl = item.getElementsByTagName('author')[0];
      const pubDateEl = item.getElementsByTagName('pubDate')[0];
      const dcCreator = item.getElementsByTagNameNS('http://purl.org/dc/elements/1.1/', 'creator')[0];
      const dcPublisher = item.getElementsByTagNameNS('http://purl.org/dc/elements/1.1/', 'publisher')[0];

      const rawTitle = titleEl?.textContent || '';
      const { title: normalizedTitle, volume } = extractVolumeFromTitle(rawTitle);

      results.push({
        title: normalizedTitle,
        author: authorEl?.textContent || dcCreator?.textContent || '',
        publisher: dcPublisher?.textContent || '',
        publishedYear: pubDateEl?.textContent ? pubDateEl.textContent.substring(0, 4) : '',
        volume,
        isbn: '',
        source: '国立国会図書館',
      });
    }

    return results;
  } catch (error) {
    console.warn('国立国会図書館APIエラー:', error);
  }
  return [];
};

export const fetchFromGoogleBooks = async (
  title: string,
  isbn: string | null = null,
  maxResults = 5,
): Promise<EnrichmentCandidate[]> => {
  try {
    const query = isbn ? `isbn:${isbn}` : `intitle:${encodeURIComponent(title)}`;
    const response = await $fetch<GoogleBooksResponse>(
      `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=${maxResults}`,
    );

    if (response.items && response.items.length > 0) {
      return response.items.map(item => {
        const volumeInfo = item.volumeInfo || {};
        const industryIdentifiers = volumeInfo.industryIdentifiers || [];
        const isbn13 = industryIdentifiers.find(id => id.type === 'ISBN_13');
        const isbn10 = industryIdentifiers.find(id => id.type === 'ISBN_10');

        const rawTitle = volumeInfo.title || '';
        const { title: normalizedTitle, volume } = extractVolumeFromTitle(rawTitle);

        return {
          title: normalizedTitle,
          author: volumeInfo.authors?.join(', ') || '',
          publisher: volumeInfo.publisher || '',
          publishedYear: volumeInfo.publishedDate ? volumeInfo.publishedDate.substring(0, 4) : '',
          isbn: isbn || isbn13?.identifier || isbn10?.identifier || '',
          volume,
          source: 'Google Books',
        };
      });
    }
  } catch (error) {
    console.warn('Google Books APIエラー:', error);
  }
  return [];
};
