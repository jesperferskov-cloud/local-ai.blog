import React from 'react';
import { useLanguage } from '../context/LanguageContext';

interface FooterProps {
  onSelectCategory?: (cat: any) => void;
  onOpenAbout?: () => void;
  onNavigateToAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateToAdmin }) => {
  const { lang } = useLanguage();

  const copyrightText =
    lang === 'en'
      ? '© 2025 local-ai.blog • Built for Apple Silicon • 100% On-Device • '
      : '© 2025 local-ai.blog • Bygget til Apple Silicon • 100% On-Device • ';

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (onNavigateToAdmin) {
      onNavigateToAdmin();
    } else {
      window.history.pushState(null, '', '/admin');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  return (
    <footer className="w-full border-t border-borderSubtle bg-canvas px-6 sm:px-10 lg:px-12 py-6 sm:py-7 flex items-center justify-center text-center transition-colors duration-500">
      <p className="text-[11px] font-mono text-bodyText tracking-wide select-none inline-flex items-center justify-center flex-wrap">
        <span>{copyrightText}</span>
        <a
          href="/admin"
          onClick={handleClick}
          title="Admin Portal"
          aria-label="Admin Portal"
          className="group relative inline-flex items-center text-bodyText hover:text-accentGlow transition-colors duration-300 cursor-pointer font-mono font-medium focus:outline-none focus:text-accentGlow ml-0.5"
        >
          <span>&gt;_</span>
          {/* Subtle micro tooltip on hover */}
          <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-cardSurface border border-borderSubtle text-[9px] text-titleText px-1.5 py-0.5 rounded shadow-lg whitespace-nowrap font-mono z-20">
            /admin
          </span>
        </a>
      </p>
    </footer>
  );
};
