import React, { useMemo } from 'react';
import { Article, Language } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { getArticleFrontmatter } from '../services/articleMarkdownService';
import { VectorThumbnail } from './VectorThumbnail';
import { GridLayout } from './GridSwitcher';
import { ArticleMetadataLine } from './ArticleMetadataLine';

interface ArticleCardProps {
  article: Article;
  onRead: (article: Article) => void;
  lang?: Language;
  layout?: GridLayout;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  onRead,
  layout = 'col-3',
}) => {
  const { lang } = useLanguage();

  // 1. Dynamic Fallback Logic:
  // Check if a custom `coverImage` string exists in the markdown frontmatter metadata
  const frontmatter = useMemo(() => {
    return getArticleFrontmatter(article.slug, lang);
  }, [article.slug, lang]);

  // Priority: markdown frontmatter coverImage -> article.coverImage
  const rawCoverImage = frontmatter?.coverImage !== undefined ? frontmatter.coverImage : article.coverImage;
  const coverImage = typeof rawCoverImage === 'string' ? rawCoverImage.trim() : '';
  const hasCoverImage = Boolean(coverImage && coverImage.length > 0);

  // Metadata tags resolution for VectorThumbnail:
  const tags = frontmatter?.tags || article.tags;
  const primaryTag =
    frontmatter?.primaryTag ||
    article.primaryTag ||
    (tags && tags.length > 0 ? tags[0] : undefined);

  const title = article.title[lang] || article.title.da;
  const subtitle = article.subtitle[lang] || article.subtitle.da;

  const isCol1 = layout === 'col-1';

  return (
    <article
      onClick={() => onRead(article)}
      className={`group cursor-pointer text-left relative overflow-hidden bg-cardSurface border border-borderSubtle hover:border-accentGlow/30 rounded-2xl transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.01] shadow-[var(--shadow-article-card)] ${
        isCol1
          ? 'flex flex-col md:flex-row md:items-center md:gap-8 p-6 sm:p-8'
          : 'flex flex-col justify-between h-full p-6 sm:p-7'
      }`}
    >
      {/* Ambient "JF-Style" Corner Glow on the card container */}
      <div
        className="absolute -top-16 -right-16 w-56 h-56 rounded-full pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity duration-500 z-0"
        style={{
          background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      {/* Aspect-ratio-locked cover container */}
      <div
        className={`aspect-[16/10] w-full rounded-xl bg-canvas border border-borderSubtle flex items-center justify-center relative overflow-hidden transition-all duration-300 ease-out group-hover:border-accentGlow/30 z-10 ${
          isCol1 ? 'md:w-5/12 lg:w-2/5 shrink-0' : ''
        }`}
        style={{
          background: 'radial-gradient(120px circle at top right, var(--accent-glow), transparent 70%), var(--bg-inner)',
        }}
      >
        {/* The Ambient "JF-Style" Corner Glow behind thumbnail */}
        <div
          className="absolute inset-0 pointer-events-none z-0 transition-opacity duration-500"
          style={{
            background: 'radial-gradient(120px circle at top right, var(--accent-glow), transparent 70%)',
            opacity: 'var(--halo-opacity)',
          }}
          aria-hidden="true"
        />

        {/* Soft foggy aura that bleeds through the vector lines */}
        <div
          className="absolute -top-6 -right-6 w-32 h-32 rounded-full pointer-events-none opacity-40 group-hover:opacity-75 transition-opacity duration-300 z-0"
          style={{
            background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)',
            opacity: 'calc(var(--halo-opacity) * 5)',
          }}
          aria-hidden="true"
        />

        {hasCoverImage ? (
          /* 1. If coverImage is present, render that image with object-cover */
          <img
            src={coverImage}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 relative z-[1]"
          />
        ) : (
          /* 2. If coverImage is empty, activate the VectorThumbnail component */
          <VectorThumbnail
            article={article}
            primaryTag={primaryTag}
            tags={tags}
            className="relative z-[1]"
          />
        )}

        {/* Hairline subtle corner marker (Zen-Tech emerald dot) with tactile hover glow */}
        <div className="absolute top-3.5 right-3.5 w-1.5 h-1.5 rounded-full bg-accentGlow opacity-80 group-hover:opacity-100 group-hover:shadow-[0_0_10px_var(--accent-glow)] transition-all duration-300 z-10" />
      </div>

      {/* Text details container */}
      <div
        className={`w-full flex flex-col justify-between transition-all duration-300 ease-out z-10 ${
          isCol1 ? 'md:w-7/12 lg:w-3/5 flex-1 self-stretch mt-5 md:mt-0' : 'flex-1 mt-5'
        }`}
      >
        <div>
          {/* Bold Editorial Title */}
          <h3
            className={`font-semibold text-titleText group-hover:text-accentGlow transition-colors duration-300 leading-snug text-balance ${
              isCol1
                ? 'text-lg sm:text-xl lg:text-2xl mt-0'
                : 'text-base sm:text-lg'
            }`}
          >
            {title}
          </h3>

          {/* Short Excerpt */}
          <p
            className={`text-bodyText leading-relaxed transition-all duration-300 font-sans ${
              isCol1
                ? 'text-sm sm:text-base line-clamp-2 md:line-clamp-3 mt-2 sm:mt-3'
                : 'text-xs sm:text-sm line-clamp-2 mt-2'
            }`}
          >
            {subtitle}
          </p>
        </div>

        {/* Unified Minimalist Metadata Line Component */}
        <div
          className={`transition-all duration-300 pt-4 border-t border-borderSubtle ${
            isCol1 ? 'mt-4 md:mt-6' : 'mt-5'
          }`}
        >
          <ArticleMetadataLine
            article={article}
            frontmatter={frontmatter}
            lang={lang}
          />
        </div>
      </div>
    </article>
  );
};


