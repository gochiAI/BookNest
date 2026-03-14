export const normalizeWidth = (value = ''): string => value.normalize('NFKC');

export const normalizeForComparison = (value = ''): string =>
  normalizeWidth(value).toLowerCase().trim();

export const normalizeHeaderToken = (value = ''): string =>
  normalizeForComparison(value).replace(/[\s_\-]+/g, '');

export const normalizeTitleKey = (value = ''): string =>
  normalizeForComparison(value).replace(/\s+/g, '');

export const normalizeIsbnDigits = (value = ''): string =>
  normalizeWidth(value).replace(/\D/g, '');

export const mergeVolume = (current?: number, incoming?: number | null): number | undefined =>
  current ?? (incoming ?? undefined);

export const isEmptyLikeValue = (value = ''): boolean => {
  const normalized = normalizeForComparison(value);
  return (
    normalized === '' ||
    normalized === 'なし' ||
    normalized === '-' ||
    normalized === 'ー' ||
    normalized === '―' ||
    normalized === '‐'
  );
};
