import React, { useState, useEffect } from 'react';
import { Globe, ArrowRight, X, Pause, Play } from 'lucide-react';

interface ArticleFallbackBannerProps {
  onSwitchToDanish: () => void;
  autoRedirectSeconds?: number;
}

export const ArticleFallbackBanner: React.FC<ArticleFallbackBannerProps> = ({
  onSwitchToDanish,
  autoRedirectSeconds = 6,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(autoRedirectSeconds);
  const [autoRedirectPaused, setAutoRedirectPaused] = useState<boolean>(false);
  const [bannerDismissed, setBannerDismissed] = useState<boolean>(false);

  useEffect(() => {
    if (autoRedirectPaused || bannerDismissed) return;

    if (secondsRemaining <= 0) {
      onSwitchToDanish();
      return;
    }

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsRemaining, autoRedirectPaused, bannerDismissed, onSwitchToDanish]);

  if (bannerDismissed) return null;

  return (
    <div className="w-full mb-6 rounded-xl bg-cardSurface border border-borderSubtle p-3.5 sm:p-4 text-xs font-mono transition-all animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        {/* Left: Message & Direct Link */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 text-accentGlow shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-accentGlow shadow-[0_0_6px_var(--accent-glow)]" />
            <Globe className="w-3.5 h-3.5 text-accentGlow" />
          </div>

          <span className="text-titleText">
            This article is currently only available in Danish.
          </span>

          <button
            onClick={onSwitchToDanish}
            className="inline-flex items-center gap-1 text-accentGlow hover:opacity-80 font-medium underline underline-offset-4 decoration-accentGlow/40 hover:decoration-accentGlow transition-all cursor-pointer"
          >
            <span>[Read Danish Version]</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Right: Auto-redirection countdown & control */}
        <div className="flex items-center gap-2 text-bodyText text-[11px] shrink-0 self-end sm:self-auto">
          {!autoRedirectPaused ? (
            <div className="flex items-center gap-2">
              <span className="tabular-nums">
                Auto-redirecting in <strong className="text-titleText">{secondsRemaining}s</strong>
              </span>
              <button
                onClick={() => setAutoRedirectPaused(true)}
                className="px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-titleText transition-colors cursor-pointer flex items-center gap-1 border border-borderSubtle"
                title="Pause auto-redirect"
              >
                <Pause className="w-2.5 h-2.5" />
                <span>Cancel</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-bodyText">
              <span>Auto-redirect paused</span>
              <button
                onClick={() => {
                  setSecondsRemaining(autoRedirectSeconds);
                  setAutoRedirectPaused(false);
                }}
                className="px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-accentGlow transition-colors cursor-pointer flex items-center gap-1 border border-borderSubtle"
                title="Resume auto-redirect"
              >
                <Play className="w-2.5 h-2.5" />
                <span>Resume</span>
              </button>
            </div>
          )}

          <button
            onClick={() => setBannerDismissed(true)}
            className="p-1 text-bodyText hover:text-titleText rounded transition-colors cursor-pointer ml-1"
            title="Dismiss notice"
            aria-label="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
