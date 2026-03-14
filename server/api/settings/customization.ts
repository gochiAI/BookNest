import { createError, defineEventHandler, getMethod, readBody } from 'h3';
import fs from 'fs/promises';
import path from 'path';

type CustomizationSettings = {
  reviews: {
    enabled: boolean;
    maxReviewLength: number;
    enableCompletedDate: boolean;
    requireOnStatus: {
      Completed: string[];
    };
  };
  registration: {
    requiredOnCreate: string[];
  };
};

const customizationFilePath = path.join(process.cwd(), 'config', 'customization.json');
const defaultCustomization: CustomizationSettings = {
  reviews: {
    enabled: true,
    maxReviewLength: 500,
    enableCompletedDate: true,
    requireOnStatus: {
      Completed: ['rating', 'completedDate'],
    },
  },
  registration: {
    requiredOnCreate: ['title', 'authorNames', 'bookType', 'readStatus'],
  },
};

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' ? (value as Record<string, unknown>) : {};

const normalizeStringArray = (value: unknown, fallback: string[]): string[] => {
  if (!Array.isArray(value)) return [...fallback];
  const normalized = value
    .filter(item => typeof item === 'string')
    .map(item => item.trim())
    .filter(Boolean);
  return normalized.length > 0 ? normalized : [...fallback];
};

const normalizeBoolean = (value: unknown, fallback: boolean): boolean =>
  typeof value === 'boolean' ? value : fallback;

const normalizeNumber = (value: unknown, fallback: number, min = 1, max = 2000): number => {
  const numeric =
    typeof value === 'number' ? value : typeof value === 'string' ? Number.parseInt(value, 10) : Number.NaN;
  if (!Number.isFinite(numeric)) return fallback;
  return Math.min(max, Math.max(min, Math.trunc(numeric)));
};

const normalizeCustomization = (input: unknown): CustomizationSettings => {
  const root = asRecord(input);
  const reviews = asRecord(root.reviews);
  const requireOnStatus = asRecord(reviews.requireOnStatus);
  const registration = asRecord(root.registration);

  return {
    reviews: {
      enabled: normalizeBoolean(reviews.enabled, defaultCustomization.reviews.enabled),
      maxReviewLength: normalizeNumber(reviews.maxReviewLength, defaultCustomization.reviews.maxReviewLength),
      enableCompletedDate: normalizeBoolean(
        reviews.enableCompletedDate,
        defaultCustomization.reviews.enableCompletedDate,
      ),
      requireOnStatus: {
        Completed: normalizeStringArray(
          requireOnStatus.Completed,
          defaultCustomization.reviews.requireOnStatus.Completed,
        ),
      },
    },
    registration: {
      requiredOnCreate: normalizeStringArray(
        registration.requiredOnCreate,
        defaultCustomization.registration.requiredOnCreate,
      ),
    },
  };
};

const readCustomization = async (): Promise<CustomizationSettings> => {
  try {
    const raw = await fs.readFile(customizationFilePath, 'utf-8');
    const parsed = JSON.parse(raw);
    return normalizeCustomization(parsed);
  } catch (error) {
    if ((error as NodeJS.ErrnoException)?.code === 'ENOENT') {
      return normalizeCustomization(defaultCustomization);
    }
    throw error;
  }
};

const writeCustomization = async (settings: CustomizationSettings): Promise<void> => {
  await fs.mkdir(path.dirname(customizationFilePath), { recursive: true });
  await fs.writeFile(customizationFilePath, JSON.stringify(settings, null, 2), 'utf-8');
};

export default defineEventHandler(async event => {
  const method = getMethod(event);

  if (method === 'GET') {
    const data = await readCustomization();
    return { data };
  }

  if (method === 'PUT') {
    const body = await readBody(event);
    const nextCustomization = normalizeCustomization(body);
    await writeCustomization(nextCustomization);
    return {
      message: 'Customization updated successfully',
      data: nextCustomization,
    };
  }

  throw createError({
    statusCode: 405,
    statusMessage: 'Method Not Allowed',
  });
});
