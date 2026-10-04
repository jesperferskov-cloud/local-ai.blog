import React from 'react';
import { Article, Language } from '../types';
import { ArticleFrontmatter } from '../services/articleMarkdownService';
import { formatArticleDate, isUpdatedNewer } from '../utils/dateUtils';
import { useLanguage } from '../context/LanguageContext';

export interface ArticleMetadataLineProps {
  article?: Article;
  frontmatter?: ArticleFrontmatter | null;
  date?: string;
  updated?: string;
  readingTime?: string;
  hardware?: string | string[];
  lang?: Language;
  className?: string;
}

/**
 * Normalizes reading time text to clean format like "6 min"
 */
function cleanReadingTime(rawTime?: string): string {
  if (!rawTime) return '';
  const trimmed = rawTime.trim();
  // If it already ends with "læsetid" or "read", extract the essential e.g. "6 min"
  const match = trimmed.match(/^(\d+\s*min)/i);
  if (match) {
    return match[1];
  }
  return trimmed;
}

/**
 * Normalizes hardware specs into clean text format
 */
function cleanHardware(rawHardware?: string | string[], fallbackHardware?: string): string {
  if (Array.isArray(rawHardware)) {
    return rawHardware.filter(Boolean).join(' • ');
  }
  if (typeof rawHardware === 'string' && rawHardware.trim()) {
    return rawHardware.trim();
  }
  if (fallbackHardware && fallbackHardware.trim()) {
    // If fallback contains dot separator ' · ', convert to unified middle dot ' • '
    return fallbackHardware.trim().replace(/\s*·\s*/g, ' • ');
  }
  return '';
}

export const ArticleMetadataLine: React.FC<ArticleMetadataLineProps> = ({
  article,
  frontmatter,
  date: customDate,
  updated: customUpdated,
  readingTime: customReadingTime,
  hardware: customHardware,
  lang: customLang,
  className = '',
}) => {
  const { lang: contextLang } = useLanguage();
  const lang = customLang || contextLang;

  // 1. Resolve raw publish date
  const rawDate =
    customDate ||
    frontmatter?.date ||
    article?.date ||
    (frontmatter?.updatedAt ? frontmatter.updatedAt.slice(0, 10) : '');

  const formattedDate = formatArticleDate(rawDate, lang);

  // 2. Resolve updated date and check if newer than publish date
  const rawUpdated =
    customUpdated ||
    frontmatter?.updated ||
    article?.updated ||
    '';

  const hasUpdatedBadge = isUpdatedNewer(rawUpdated, rawDate);

  // 3. Resolve reading time
  const rawReadingTime =
    customReadingTime ||
    frontmatter?.readingTime ||
    frontmatter?.readTime ||
    article?.readingTime ||
    (article?.readTime ? (article.readTime[lang] || article.readTime.da) : '');

  const readingTime = cleanReadingTime(rawReadingTime) || '5 min';

  // 4. Resolve hardware specs
  const rawHardware =
    customHardware ||
    frontmatter?.hardware ||
    article?.hardware;

  const fallbackHardware = frontmatter?.hardwareLabel || article?.hardwareLabel || '';
  const hardwareSpecs = cleanHardware(rawHardware, fallbackHardware);

  // Label for updated revision indicator (discrete "(Opdateret)" in DA / "(Updated)" in EN)
  const updatedLabel = lang === 'da' ? '(Opdateret)' : '(Updated)';

  return (
    <div
      className={`flex items-center flex-wrap text-xs text-bodyText font-mono tracking-wide ${className}`}
    >
      {/* 1. Formatted Date & optional (Opdateret) indicator */}
      {formattedDate && (
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
          <span>{formattedDate}</span>
          {hasUpdatedBadge && (
            <span
              className="text-[10px] text-bodyText font-sans italic opacity-80 select-none"
              title={`Revideret: ${formatArticleDate(rawUpdated, lang)}`}
            >
              {updatedLabel}
            </span>
          )}
        </span>
      )}

      {/* Separator 1 */}
      {formattedDate && readingTime && (
        <span className="text-bodyText opacity-60 mx-2 select-none" aria-hidden="true">
          •
        </span>
      )}

      {/* 2. Reading Time */}
      {readingTime && (
        <span className="whitespace-nowrap">{readingTime}</span>
      )}

      {/* Separator 2 */}
      {readingTime && hardwareSpecs && (
        <span className="text-bodyText opacity-60 mx-2 select-none" aria-hidden="true">
          •
        </span>
      )}

      {/* 3. Hardware Specs */}
      {hardwareSpecs && (
        <span className="whitespace-nowrap truncate max-w-[220px] sm:max-w-none" title={hardwareSpecs}>
          {hardwareSpecs}
        </span>
      )}
    </div>
  );
};
