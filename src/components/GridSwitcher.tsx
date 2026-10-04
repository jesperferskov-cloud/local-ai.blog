import React from 'react';

export type GridLayout = 'col-1' | 'col-2' | 'col-3';

interface GridSwitcherProps {
  layout: GridLayout;
  onChange: (layout: GridLayout) => void;
  lang?: 'da' | 'en';
}

export const GridSwitcher: React.FC<GridSwitcherProps> = ({
  layout,
  onChange,
  lang = 'da',
}) => {
  const options: Array<{
    id: GridLayout;
    label: string;
    icon: (isActive: boolean) => React.ReactNode;
  }> = [
    {
      id: 'col-1',
      label: lang === 'da' ? '1-kolonne (liste)' : '1-column (list)',
      icon: (isActive: boolean) => (
        /* Icon 1: A single horizontal rectangle representing 1-column list view */
        <svg
          viewBox="0 0 16 16"
          fill="currentColor"
          className="w-4 h-4 transition-colors duration-200"
          aria-hidden="true"
        >
          <rect
            x="2"
            y="4.5"
            width="12"
            height="7"
            rx="1.5"
            fill="currentColor"
            fillOpacity={isActive ? 1 : 0.75}
          />
        </svg>
      ),
    },
    {
      id: 'col-2',
      label: lang === 'da' ? '2-kolonner' : '2-columns',
      icon: (isActive: boolean) => (
        /* Icon 2: Two adjacent vertical rectangles representing 2-column grid */
        <svg
          viewBox="0 0 16 16"
          fill="currentColor"
          className="w-4 h-4 transition-colors duration-200"
          aria-hidden="true"
        >
          <rect
            x="2"
            y="3"
            width="5"
            height="10"
            rx="1"
            fill="currentColor"
            fillOpacity={isActive ? 1 : 0.75}
          />
          <rect
            x="9"
            y="3"
            width="5"
            height="10"
            rx="1"
            fill="currentColor"
            fillOpacity={isActive ? 1 : 0.75}
          />
        </svg>
      ),
    },
    {
      id: 'col-3',
      label: lang === 'da' ? '3-kolonner' : '3-columns',
      icon: (isActive: boolean) => (
        /* Icon 3: Three adjacent vertical columns representing 3-column grid */
        <svg
          viewBox="0 0 16 16"
          fill="currentColor"
          className="w-4 h-4 transition-colors duration-200"
          aria-hidden="true"
        >
          <rect
            x="2"
            y="3"
            width="3"
            height="10"
            rx="0.75"
            fill="currentColor"
            fillOpacity={isActive ? 1 : 0.75}
          />
          <rect
            x="6.5"
            y="3"
            width="3"
            height="10"
            rx="0.75"
            fill="currentColor"
            fillOpacity={isActive ? 1 : 0.75}
          />
          <rect
            x="11"
            y="3"
            width="3"
            height="10"
            rx="0.75"
            fill="currentColor"
            fillOpacity={isActive ? 1 : 0.75}
          />
        </svg>
      ),
    },
  ];

  return (
    <div
      className="inline-flex items-center gap-1 p-1 bg-cardSurface border border-borderSubtle rounded-lg select-none transition-colors duration-300"
      role="group"
      aria-label={lang === 'da' ? 'Artikellayout' : 'Article layout'}
    >
      {options.map((opt) => {
        const isActive = layout === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            title={opt.label}
            aria-label={opt.label}
            aria-pressed={isActive}
            className={`relative flex items-center justify-center w-8 h-8 rounded-md transition-all duration-200 cursor-pointer ${
              isActive
                ? 'text-titleText bg-black/5 dark:bg-white/[0.06]'
                : 'text-bodyText hover:text-titleText hover:bg-black/[0.03] dark:hover:bg-white/[0.03]'
            }`}
          >
            {opt.icon(isActive)}
            {/* Subtle emerald dot for active state */}
            {isActive && (
              <span
                className="absolute bottom-1 w-1 h-1 rounded-full bg-accentGlow shadow-[0_0_6px_var(--accent-glow)]"
                aria-hidden="true"
              />
            )}
          </button>
        );
      })}
    </div>
  );
};
