import React, { useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';

interface LanguageToggleProps {
  className?: string;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({ className = '' }) => {
  const { lang, setLang, toggleLang } = useLanguage();
  const daRef = useRef<HTMLButtonElement>(null);
  const enRef = useRef<HTMLButtonElement>(null);

  const isDanish = lang === 'da';

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      setLang('da');
      daRef.current?.focus();
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      setLang('en');
      enRef.current?.focus();
    } else if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      toggleLang();
    }
  };

  return (
    <div
      role="radiogroup"
      aria-label={isDanish ? 'Vælg sprog (Dansk / Engelsk)' : 'Select language (Danish / English)'}
      onKeyDown={handleKeyDown}
      className={`relative inline-flex items-center w-[80px] h-[26px] p-[2px] rounded-full bg-cardSurface/90 border border-borderSubtle hover:border-accentGlow/30 transition-all select-none shadow-[inset_0_1px_2px_rgba(0,0,0,0.15)] focus-within:ring-1 focus-within:ring-accentGlow/50 ${className}`}
      title={isDanish ? 'Aktivt sprog: Dansk (DA) • Klik for at skifte til Engelsk (EN)' : 'Active language: English (EN) • Click to switch to Danish (DA)'}
    >
      {/* Sliding Active Pill Indicator */}
      <span
        aria-hidden="true"
        className={`absolute top-[2px] bottom-[2px] w-[38px] rounded-full bg-canvas border border-accentGlow/30 shadow-[0_1px_3px_rgba(0,0,0,0.15)] transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none ${
          isDanish ? 'left-[2px] translate-x-0' : 'left-[2px] translate-x-[38px]'
        }`}
      />

      {/* Danish Button */}
      <button
        ref={daRef}
        type="button"
        role="radio"
        aria-checked={isDanish}
        aria-label="Dansk (DA)"
        tabIndex={isDanish ? 0 : -1}
        onClick={() => {
          if (!isDanish) {
            setLang('da');
          } else {
            toggleLang();
          }
        }}
        className={`relative z-10 w-[38px] h-[22px] flex items-center justify-center gap-1 rounded-full text-[11px] font-mono tracking-wider transition-colors duration-150 cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accentGlow ${
          isDanish
            ? 'text-titleText font-semibold'
            : 'text-bodyText hover:text-titleText'
        }`}
      >
        {isDanish && (
          <span className="w-1.5 h-1.5 rounded-full bg-accentGlow shadow-[0_0_6px_var(--accent-glow)] shrink-0 animate-in fade-in zoom-in-75 duration-150" />
        )}
        <span>DA</span>
      </button>

      {/* English Button */}
      <button
        ref={enRef}
        type="button"
        role="radio"
        aria-checked={!isDanish}
        aria-label="English (EN)"
        tabIndex={!isDanish ? 0 : -1}
        onClick={() => {
          if (isDanish) {
            setLang('en');
          } else {
            toggleLang();
          }
        }}
        className={`relative z-10 w-[38px] h-[22px] flex items-center justify-center gap-1 rounded-full text-[11px] font-mono tracking-wider transition-colors duration-150 cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accentGlow ${
          !isDanish
            ? 'text-titleText font-semibold'
            : 'text-bodyText hover:text-titleText'
        }`}
      >
        {!isDanish && (
          <span className="w-1.5 h-1.5 rounded-full bg-accentGlow shadow-[0_0_6px_var(--accent-glow)] shrink-0 animate-in fade-in zoom-in-75 duration-150" />
        )}
        <span>EN</span>
      </button>
    </div>
  );
};
