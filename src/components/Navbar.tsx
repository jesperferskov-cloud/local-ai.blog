import React from 'react';
import { Search, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { LanguageToggle } from './LanguageToggle';

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
    <header className="w-full border-b border-white/5 bg-[#091614] transition-colors relative z-30">
      <div className="w-full px-6 sm:px-10 lg:px-12 py-3.5 flex items-center justify-between relative">
        
        {/* Left: Logo "local-ai.blog" */}
        <div className="flex items-center">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              scrollToTop();
            }}
            className="font-mono text-sm tracking-tight text-[#F1F5F4] hover:text-white transition-colors lowercase cursor-pointer flex items-center gap-2 group"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] group-hover:shadow-[0_0_8px_#10B981] transition-shadow" />
            <span>{blogTitle}</span>
          </a>
        </div>

        {/* Right: Minimalist Language Selector (DA/EN) & Search Trigger */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Minimal clean tactile Language Toggle Switch (DA / EN) */}
          <LanguageToggle />

          {/* Minimal icon-only button for search */}
          <button
            onClick={onToggleSearch}
            className={`p-1.5 transition-colors cursor-pointer rounded-md ${
              searchOpen ? 'text-[#10B981] bg-white/5' : 'text-[#728984] hover:text-[#F1F5F4] hover:bg-white/5'
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
        <div className="border-t border-white/5 px-6 sm:px-10 lg:px-12 py-3 bg-[#0E1F1C]/95 backdrop-blur-md flex items-center gap-3 animate-in fade-in duration-150">
          <Search className="w-4 h-4 text-[#10B981] shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="bg-transparent text-xs sm:text-sm text-[#F1F5F4] placeholder-[#728984] focus:outline-none w-full font-mono"
            autoFocus
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="text-[#728984] hover:text-[#F1F5F4] transition-colors cursor-pointer p-1"
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
