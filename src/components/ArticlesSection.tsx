import React, { useMemo, useState } from 'react';
import { Article, Language } from '../types';
import { articles } from '../data/content';
import { ArticleCard } from './ArticleCard';
import { GridSwitcher, GridLayout } from './GridSwitcher';
import { useLanguage } from '../context/LanguageContext';

export type ArticleFilterCategory = 'all' | 'mac' | 'ios' | 'hybrid' | 'benchmarks';

interface ArticlesSectionProps {
  onReadArticle: (article: Article) => void;
  activeCategory: ArticleFilterCategory;
  onSelectCategory: (cat: ArticleFilterCategory) => void;
  searchQuery?: string;
  lang?: Language;
}

export const ArticlesSection: React.FC<ArticlesSectionProps> = ({
  onReadArticle,
  activeCategory,
  onSelectCategory,
  searchQuery = '',
}) => {
  const { lang, t } = useLanguage();

  // Reactive layout state with local-first localStorage persistence
  const [gridLayout, setGridLayout] = useState<GridLayout>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('local-ai-layout') as GridLayout | null;
        if (saved === 'col-1' || saved === 'col-2' || saved === 'col-3') {
          return saved;
        }
      } catch {
        // Ignore localStorage error if restricted
      }
    }
    return 'col-3';
  });

  const handleLayoutChange = (layout: GridLayout) => {
    setGridLayout(layout);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('local-ai-layout', layout);
      } catch {
        // Ignore
      }
    }
  };

  // Simple horizontal category list: "Alt", "Mac", "iOS", "Hybrid Setup"
  const categoriesList: Array<{ id: ArticleFilterCategory; label: string }> = [
    {
      id: 'all',
      label: t('all'),
    },
    {
      id: 'mac',
      label: t('mac'),
    },
    {
      id: 'ios',
      label: t('ios'),
    },
    {
      id: 'hybrid',
      label: t('hybrid'),
    },
  ];

  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      // =========================================================================
      // Tidsindstillet Publicering (Scheduling) Filter:
      // Filtrer posts på klientsiden, så fremtidige planlagte posts (Scheduled)
      // ikke vises for normale brugere, før udgivelsesdato og klokkeslæt er nået:
      // new Date(post.date) <= new Date()
      // =========================================================================
      if (article.date) {
        const publishTimestamp = new Date(article.date).getTime();
        if (!isNaN(publishTimestamp) && publishTimestamp > Date.now()) {
          return false; // Fremtidig planlagt artikel skjules på klientsiden for normale læsere
        }
      }

      // 1. Search Query Filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const title = (article.title[lang] || article.title.da).toLowerCase();
        const subtitle = (article.subtitle[lang] || article.subtitle.da).toLowerCase();
        const hwMatch = article.hardwareLabel.toLowerCase().includes(query);
        if (!title.includes(query) && !subtitle.includes(query) && !hwMatch) return false;
      }

      // 2. Category Match
      if (activeCategory === 'all') return true;
      if (activeCategory === 'mac') {
        return article.category === 'mac' || article.hardwareArch === 'apple-m' || article.category === 'benchmarks';
      }
      if (activeCategory === 'ios') {
        return article.category === 'iphone' || article.hardwareArch === 'iphone-a';
      }
      if (activeCategory === 'hybrid') {
        return article.category === 'hybrid';
      }
      if (activeCategory === 'benchmarks') {
        return article.category === 'benchmarks';
      }

      return true;
    });
  }, [activeCategory, searchQuery, lang]);

  // Dynamic Tailwind Grid Classes based on layout state
  const gridContainerClass = useMemo(() => {
    const transition = 'transition-all duration-300 ease-out';
    switch (gridLayout) {
      case 'col-1':
        return `flex flex-col max-w-4xl mx-auto gap-8 ${transition}`;
      case 'col-2':
        return `grid grid-cols-1 md:grid-cols-2 max-w-5xl mx-auto gap-8 ${transition}`;
      case 'col-3':
      default:
        return `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 ${transition}`;
    }
  }, [gridLayout]);

  return (
    <section id="artikler" className="w-full px-6 sm:px-10 lg:px-12 py-12 lg:py-16 transition-colors duration-500">
      {/* Section Header: "Artikler" / "Articles" */}
      <div className="pb-6">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-titleText">
          {lang === 'da' ? 'Artikler' : 'Articles'}
        </h2>
      </div>

      {/* Categories on left & Layout Toggle Switcher on right */}
      <div className="flex items-center justify-between gap-4 pb-8 sm:pb-10 border-b border-borderSubtle">
        <div className="flex items-center gap-7 sm:gap-9 overflow-x-auto no-scrollbar py-1">
          {categoriesList.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex items-center gap-2 py-1 text-xs sm:text-sm tracking-wide transition-colors cursor-pointer whitespace-nowrap ${
                  isActive ? 'text-titleText font-medium' : 'text-bodyText hover:text-titleText'
                }`}
              >
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-accentGlow shadow-[0_0_8px_var(--accent-glow)]" />
                )}
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Minimalist Grid Switcher */}
        <div className="shrink-0">
          <GridSwitcher
            layout={gridLayout}
            onChange={handleLayoutChange}
            lang={lang}
          />
        </div>
      </div>

      {/* Dynamic Editorial Grid */}
      <div className="pt-10">
        {filteredArticles.length > 0 ? (
          <div className={gridContainerClass}>
            {filteredArticles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                lang={lang}
                onRead={onReadArticle}
                layout={gridLayout}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-bodyText">
            <p className="text-sm">
              {t('noArticles')}
            </p>
            <button
              onClick={() => onSelectCategory('all')}
              className="mt-4 text-xs font-mono text-accentGlow hover:underline cursor-pointer"
            >
              {lang === 'da' ? 'Vis alle artikler' : 'Show all articles'}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

