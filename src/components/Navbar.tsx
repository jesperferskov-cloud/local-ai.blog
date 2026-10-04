import React from 'react';
import { Search, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { LanguageToggle } from './LanguageToggle';
import { ThemeToggle } from './ThemeToggle';

interface NavbarProps {
  searchOpen: boolean;
  onToggleSearch: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectCategory?: (cat: any) => void;
  onOpenAbout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchOpen,
  onToggleSearch,
  searchQuery,
  onSearchChange,
  onSelectCategory,
}) => {
  const { t } = useLanguage();
  const { settings } = useSiteSettings();
  const blogTitle = settings.blogName || 'local-ai.blog';

  const scrollToTop = () => {
    if (onSelectCategory) {
      onSelectCategory('all');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="w-full border-b border-borderSubtle bg-canvas transition-colors duration-500 relative z-30">
      <div className="w-full px-6 sm:px-10 lg:px-12 py-3.5 flex items-center justify-between relative">
        
        {/* Left: Logo "local-ai.blog" */}
        <div className="flex items-center">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              scrollToTop();
            }}
            className="font-mono text-sm tracking-tight text-titleText hover:text-accentGlow transition-colors lowercase cursor-pointer flex items-center gap-2 group"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accentGlow group-hover:shadow-[0_0_8px_var(--accent-glow)] transition-shadow" />
            <span>{blogTitle}</span>
          </a>
        </div>

        {/* Right: Theme Toggle (Morgengry/Aftengry), Language Selector (DA/EN) & Search Trigger */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* Theme Toggle Button ('Morgengry' / 'Aftengry') */}
          <ThemeToggle />

          {/* Minimal clean tactile Language Toggle Switch (DA / EN) */}
          <LanguageToggle />

          {/* Minimal icon-only button for search */}
          <button
            onClick={onToggleSearch}
            className={`p-1.5 transition-colors cursor-pointer rounded-md ${
              searchOpen
                ? 'text-accentGlow bg-black/5 dark:bg-white/5'
                : 'text-bodyText hover:text-titleText hover:bg-black/5 dark:hover:bg-white/5'
            }`}
            aria-label={t('search')}
            title={t('search')}
          >
            <Search className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Clean expandable search drawer */}
      {searchOpen && (
        <div className="border-t border-borderSubtle px-6 sm:px-10 lg:px-12 py-3 bg-cardSurface/95 backdrop-blur-md flex items-center gap-3 animate-in fade-in duration-150">
          <Search className="w-4 h-4 text-accentGlow shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="bg-transparent text-xs sm:text-sm text-titleText placeholder-bodyText focus:outline-none w-full font-mono"
            autoFocus
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="text-bodyText hover:text-titleText transition-colors cursor-pointer p-1"
              aria-label={t('clearSearch')}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </header>
  );
};
