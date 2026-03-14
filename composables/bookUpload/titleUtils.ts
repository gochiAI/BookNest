export const extractFiltersFromTitle = (title: string): string[] => {
  if (!title) return [];

  const filters: string[] = [];
  const bracketPatterns = [
    { pattern: /【分冊版】/g, name: '分冊版' },
    { pattern: /【連載版】/g, name: '連載版' },
    { pattern: /【完全版】/g, name: '完全版' },
    { pattern: /【期間限定.*?】/g, name: '期間限定' },
    { pattern: /【無料.*?版】/g, name: '無料版' },
    { pattern: /【全編無料版】/g, name: '全編無料版' },
    { pattern: /【先行配信版】/g, name: '先行配信版' },
    { pattern: /【独占配信】/g, name: '独占配信' },
    { pattern: /【特装版】/g, name: '特装版' },
    { pattern: /【限定版】/g, name: '限定版' },
    { pattern: /【廉価版】/g, name: '廉価版' },
    { pattern: /【新装版】/g, name: '新装版' },
    { pattern: /【改訂版】/g, name: '改訂版' },
    { pattern: /【文庫版】/g, name: '文庫版' },
  ];

  bracketPatterns.forEach(({ pattern, name }) => {
    if (pattern.test(title) && !filters.includes(name)) {
      filters.push(name);
    }
  });

  const unbrackPatterns = [
    { pattern: /\s*連載版(\s|$|第|を|の)/, name: '連載版' },
    { pattern: /\s*分冊版(\s|$|第|を|の)/, name: '分冊版' },
    { pattern: /\s*完全版(\s|$|第|を|の)/, name: '完全版' },
    { pattern: /\s*期間限定(\s|$|第|を|の)/, name: '期間限定' },
    { pattern: /\s*記念小冊子(\s|$|第|を|の)/, name: '記念小冊子' },
    { pattern: /\s*特別版(\s|$|第|を|の)/, name: '特別版' },
    { pattern: /\s*特装版(\s|$|第|を|の)/, name: '特装版' },
    { pattern: /\s*限定版(\s|$|第|を|の)/, name: '限定版' },
    { pattern: /\s*廉価版(\s|$|第|を|の)/, name: '廉価版' },
    { pattern: /\s*新装版(\s|$|第|を|の)/, name: '新装版' },
    { pattern: /\s*改訂版(\s|$|第|を|の)/, name: '改訂版' },
    { pattern: /\s*文庫版(\s|$|第|を|の)/, name: '文庫版' },
    { pattern: /\s*無料版(\s|$|第|を|の)/, name: '無料版' },
    { pattern: /\s*先行配信版(\s|$|第|を|の)/, name: '先行配信版' },
    { pattern: /\s*独占配信(\s|$|第|を|の)/, name: '独占配信' },
  ];

  unbrackPatterns.forEach(({ pattern, name }) => {
    if (pattern.test(title) && !filters.includes(name)) {
      filters.push(name);
    }
  });

  return filters;
};

export const removeFiltersFromTitle = (title: string): string => {
  if (!title) return title;

  let cleanTitle = title;
  cleanTitle = cleanTitle.replace(/【[^】]+】/g, '').trim();
  cleanTitle = cleanTitle.replace(/（[^）]+）/g, '').trim();
  cleanTitle = cleanTitle.replace(/\([^)]+\)/g, '').trim();

  const unbrackPatterns = [
    /\s*連載版.*$/,
    /\s*分冊版.*$/,
    /\s*完全版.*$/,
    /\s*期間限定.*$/,
    /\s*記念小冊子.*$/,
    /\s*特別版.*$/,
    /\s*特装版.*$/,
    /\s*限定版.*$/,
    /\s*廉価版.*$/,
    /\s*新装版.*$/,
    /\s*改訂版.*$/,
    /\s*文庫版.*$/,
    /\s*無料版.*$/,
    /\s*先行配信版.*$/,
    /\s*独占配信.*$/,
  ];

  unbrackPatterns.forEach(pattern => {
    cleanTitle = cleanTitle.replace(pattern, '');
  });

  cleanTitle = cleanTitle.replace(/\s+/g, ' ').trim();
  return cleanTitle;
};

export const extractVolumeFromTitle = (title: string): { title: string; volume: number | null } => {
  if (!title) return { title: '', volume: null };

  const VOLUME_TOKEN_PATTERN = '[0-9０-９ivxlcdmIVXLCDM一二三四五六七八九十百千〇零上中下①-⑳㉑-㉟㊱-㊿]+';

  const normalizeTitle = (value: string): string =>
    value.replace(/\s+/g, ' ').replace(/[\s\-_:：,.，、・]+$/g, '').trim();

  const normalizeDigits = (value: string): string =>
    value.replace(/[０-９]/g, char => String.fromCharCode(char.charCodeAt(0) - 0xfee0));

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
    const normalized = normalizeCircledNumbers(normalizeDigits(token)).trim();
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

  const removeMatched = (source: string, matchedText: string): string => {
    if (!matchedText) return normalizeTitle(source);
    return normalizeTitle(source.replace(matchedText, ' '));
  };

  const patterns = [
    new RegExp(`[:：]\\s*(${VOLUME_TOKEN_PATTERN})\\s*$`, 'i'),
    new RegExp(`[（(]\\s*(${VOLUME_TOKEN_PATTERN})\\s*[）)]\\s*$`, 'i'),
    new RegExp(`[［\\[]\\s*(${VOLUME_TOKEN_PATTERN})\\s*[\\]］]\\s*$`, 'i'),
    new RegExp(`\\b(?:vol(?:ume)?|no\\.?|episode|ep\\.?|chapter|ch\\.?|part|book)\\s*(${VOLUME_TOKEN_PATTERN})\\b`, 'i'),
    new RegExp(`#\\s*(${VOLUME_TOKEN_PATTERN})\\b`, 'i'),
    new RegExp(`第\\s*(${VOLUME_TOKEN_PATTERN})\\s*(?:巻|話|部|章|集|冊|編|巻目)`, 'i'),
    new RegExp(`(${VOLUME_TOKEN_PATTERN})\\s*(?:巻|話|部|章|集|冊|編|巻目)`, 'i'),
    new RegExp(`その\\s*(${VOLUME_TOKEN_PATTERN})`, 'i'),
    /(?:\s+|^)([0-9０-９]{1,3})\s*$/,
  ];

  for (const pattern of patterns) {
    const match = pattern.exec(title);
    if (!match) continue;

    const parsed = parseVolumeToken(match[1]);
    if (parsed === null || parsed <= 0 || parsed > 999) continue;

    return {
      title: removeMatched(title, match[0]),
      volume: parsed,
    };
  }

  return { title: normalizeTitle(title), volume: null };
};
