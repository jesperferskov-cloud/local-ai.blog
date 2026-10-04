import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { theme, toggleTheme, isLight } = useTheme();
  const { lang } = useLanguage();

  const isDanish = lang === 'da';
  const label = isLight
    ? isDanish
      ? 'Morgengry aktiv • Skift til Aftengry (mørkt tema)'
      : 'Morgengry active • Switch to Aftengry (dark theme)'
    : isDanish
      ? 'Aftengry aktiv • Skift til Morgengry (lyst tema)'
      : 'Aftengry active • Switch to Morgengry (light theme)';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex items-center justify-center w-8 h-[26px] rounded-full bg-cardSurface/90 border border-borderSubtle hover:border-accentGlow/40 text-bodyText hover:text-titleText transition-all duration-300 select-none shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] focus:outline-none focus-visible:ring-1 focus-visible:ring-accentGlow cursor-pointer group ${className}`}
      title={label}
      aria-label={label}
      aria-pressed={isLight}
      data-testid="theme-toggle"
    >
      {/* Morphing Sun/Moon SVG Icon (Inspired by Josh Comeau's light/dark aesthetics) */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="pointer-events-none transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
        style={{
          transform: isLight ? 'rotate(90deg)' : 'rotate(40deg)',
        }}
        aria-hidden="true"
      >
        <mask id="morphing-sun-moon-mask">
          <rect x="0" y="0" width="100%" height="100%" fill="white" />
          {/* Black circle moves in to bite out a crescent moon in Aftengry (dark mode),
              and translates away in Morgengry (light mode) */}
          <circle
            cx={isLight ? '28' : '15'}
            cy={isLight ? '0' : '7'}
            r="6"
            fill="black"
            style={{
              transition: 'cx 500ms cubic-bezier(0.16, 1, 0.3, 1), cy 500ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </mask>

        {/* Central celestial sphere (Moon in dark mode, Sun core in light mode) */}
        <circle
          cx="12"
          cy="12"
          r={isLight ? '4.5' : '6.5'}
          fill="currentColor"
          mask="url(#morphing-sun-moon-mask)"
          style={{
            transition: 'r 500ms cubic-bezier(0.16, 1, 0.3, 1), fill 300ms ease',
          }}
        />

        {/* Radiating Sun Rays (expanded and radiant in Morgengry, collapsed in Aftengry) */}
        <g
          stroke="currentColor"
          strokeWidth="2"
          style={{
            transform: isLight ? 'scale(1)' : 'scale(0)',
            transformOrigin: 'center center',
            opacity: isLight ? 1 : 0,
            transition: 'transform 450ms cubic-bezier(0.16, 1, 0.3, 1), opacity 350ms ease',
          }}
        >
          <line x1="12" y1="1" x2="12" y2="3.2" />
          <line x1="12" y1="20.8" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.78" y2="5.78" />
          <line x1="18.22" y1="18.22" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3.2" y2="12" />
          <line x1="20.8" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.78" y2="18.22" />
          <line x1="18.22" y1="5.78" x2="19.78" y2="4.22" />
        </g>
      </svg>
    </button>
  );
};
