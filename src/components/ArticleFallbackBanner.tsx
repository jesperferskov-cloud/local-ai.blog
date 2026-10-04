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
    <div className="w-full mb-6 rounded-xl bg-[#0E1F1C] border border-white/10 p-3.5 sm:p-4 text-xs font-mono transition-all animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        {/* Left: Message & Direct Link */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 text-emerald-400 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] shadow-[0_0_6px_#10B981]" />
            <Globe className="w-3.5 h-3.5 text-[#10B981]" />
          </div>

          <span className="text-[#F1F5F4]">
            This article is currently only available in Danish.
          </span>

          <button
            onClick={onSwitchToDanish}
            className="inline-flex items-center gap-1 text-[#10B981] hover:text-emerald-300 font-medium underline underline-offset-4 decoration-[#10B981]/40 hover:decoration-[#10B981] transition-all cursor-pointer"
          >
            <span>[Read Danish Version]</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Right: Auto-redirection countdown & control */}
        <div className="flex items-center gap-2 text-[#728984] text-[11px] shrink-0 self-end sm:self-auto">
          {!autoRedirectPaused ? (
            <div className="flex items-center gap-2">
              <span className="tabular-nums">
                Auto-redirecting in <strong className="text-[#F1F5F4]">{secondsRemaining}s</strong>
              </span>
              <button
                onClick={() => setAutoRedirectPaused(true)}
                className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-[#F1F5F4] transition-colors cursor-pointer flex items-center gap-1"
                title="Pause auto-redirect"
              >
                <Pause className="w-2.5 h-2.5" />
                <span>Cancel</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-[#728984]">
              <span>Auto-redirect paused</span>
              <button
                onClick={() => {
                  setSecondsRemaining(autoRedirectSeconds);
                  setAutoRedirectPaused(false);
                }}
                className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-[#10B981] transition-colors cursor-pointer flex items-center gap-1"
                title="Resume auto-redirect"
              >
                <Play className="w-2.5 h-2.5" />
                <span>Resume</span>
              </button>
            </div>
          )}

          <button
            onClick={() => setBannerDismissed(true)}
            className="p-1 text-[#728984] hover:text-[#F1F5F4] rounded transition-colors cursor-pointer ml-1"
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
