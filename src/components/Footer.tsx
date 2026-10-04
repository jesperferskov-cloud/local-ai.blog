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
    <footer className="w-full border-t border-white/5 bg-[#091614] px-6 sm:px-10 lg:px-12 py-6 sm:py-7 flex items-center justify-center text-center">
      <p className="text-[11px] font-mono text-[#728984] tracking-wide select-none inline-flex items-center justify-center flex-wrap">
        <span>{copyrightText}</span>
        <a
          href="/admin"
          onClick={handleClick}
          title="Admin Portal"
          aria-label="Admin Portal"
          className="group relative inline-flex items-center text-[#728984] hover:text-[#10B981] transition-colors duration-300 cursor-pointer font-mono font-medium focus:outline-none focus:text-[#10B981] ml-0.5"
        >
          <span>&gt;_</span>
          {/* Subtle micro tooltip on hover */}
          <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-[#0E1F1C] border border-white/10 text-[9px] text-[#A7BDB8] px-1.5 py-0.5 rounded shadow-lg whitespace-nowrap font-mono z-20">
            /admin
          </span>
        </a>
      </p>
    </footer>
  );
};
