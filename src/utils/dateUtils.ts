import { Language } from '../types';

/**
 * Danish 3-letter month abbreviations with standard period
 */
const DA_MONTHS = [
  'jan.',
  'feb.',
  'mar.',
  'apr.',
  'maj.',
  'jun.',
  'jul.',
  'aug.',
  'sep.',
  'okt.',
  'nov.',
  'dec.',
];

/**
 * English 3-letter month abbreviations
 */
const EN_MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

/**
 * Returns today's date in YYYY-MM-DD format based on local system time.
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats a raw date string (e.g. "2025-03-12" or ISO string) into a localized string:
 * - If DA: "12. mar. 2025"
 * - If EN: "Mar 12, 2025"
 */
export function formatArticleDate(
  rawDate: string | Date | undefined | null,
  lang: Language = 'da'
): string {
  if (!rawDate) return '';

  let year: number;
  let month: number; // 0-indexed
  let day: number;

  if (rawDate instanceof Date) {
    year = rawDate.getFullYear();
    month = rawDate.getMonth();
    day = rawDate.getDate();
  } else if (typeof rawDate === 'string') {
    const trimmed = rawDate.trim();
    if (!trimmed) return '';

    // Check for YYYY-MM-DD pattern (avoids timezone shift issues)
    const ymdMatch = trimmed.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
    if (ymdMatch) {
      year = parseInt(ymdMatch[1], 10);
      month = parseInt(ymdMatch[2], 10) - 1;
      day = parseInt(ymdMatch[3], 10);
    } else {
      const parsed = new Date(trimmed);
      if (isNaN(parsed.getTime())) {
        return trimmed; // Return original string if unparseable
      }
      year = parsed.getFullYear();
      month = parsed.getMonth();
      day = parsed.getDate();
    }
  } else {
    return '';
  }

  if (isNaN(year) || isNaN(month) || isNaN(day) || month < 0 || month > 11) {
    return typeof rawDate === 'string' ? rawDate : '';
  }

  if (lang === 'da') {
    return `${day}. ${DA_MONTHS[month]} ${year}`;
  } else {
    return `${EN_MONTHS[month]} ${day}, ${year}`;
  }
}

/**
 * Parses any date representation into unix milliseconds timestamp.
 */
function parseDateToMs(dateInput?: string | Date | null): number | null {
  if (!dateInput) return null;
  if (dateInput instanceof Date) return dateInput.getTime();

  const trimmed = String(dateInput).trim();
  if (!trimmed) return null;

  const ymdMatch = trimmed.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (ymdMatch) {
    const year = parseInt(ymdMatch[1], 10);
    const month = parseInt(ymdMatch[2], 10) - 1;
    const day = parseInt(ymdMatch[3], 10);
    return new Date(year, month, day, 12, 0, 0).getTime();
  }

  const parsed = Date.parse(trimmed);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Checks whether an updated date is valid and strictly newer than the publish date.
 */
export function isUpdatedNewer(
  updatedDate?: string | Date | null,
  publishDate?: string | Date | null
): boolean {
  if (!updatedDate || !publishDate) return false;

  const updatedMs = parseDateToMs(updatedDate);
  const publishMs = parseDateToMs(publishDate);

  if (updatedMs === null || publishMs === null) return false;
  return updatedMs > publishMs;
}
