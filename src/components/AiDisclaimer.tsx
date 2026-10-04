import React from 'react';

interface AiDisclaimerProps {
  text: string;
  className?: string;
  variant?: 'cozy-note' | 'minimal';
}

export const AiDisclaimer: React.FC<AiDisclaimerProps> = ({ 
  text, 
  className = '', 
  variant = 'cozy-note' 
}) => {
  if (variant === 'minimal') {
    return (
      <div
        className={`w-full px-4 py-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center gap-2.5 transition-colors duration-200 select-none ${className}`}
        role="note"
        aria-label="AI Entusiast Deklaration"
      >
        <span className="relative flex h-1.5 w-1.5 shrink-0" aria-hidden="true">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-60"></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#10B981] shadow-[0_0_6px_#10B981]"></span>
        </span>
        <p className="text-xs md:text-sm text-[#728984] italic leading-relaxed text-balance m-0">
          {text}
        </p>
      </div>
    );
  }

  // Cozy Integrated Handwritten Note (Josh Comeau inspired tactile note)
  return (
    <div
      className={`relative w-full max-w-xl rounded-xl bg-[#0E1F1C]/90 backdrop-blur-md border border-[#10B981]/25 hover:border-[#10B981]/40 px-4 py-3.5 sm:px-4.5 sm:py-4 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.18)] group/note ${className}`}
      role="note"
      aria-label="AI Entusiast Deklaration"
    >
      {/* Delicate organic top-left mini bookmark / tape tab */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {/* Glowing pulse dot: On-device / local mind */}
          <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981] shadow-[0_0_8px_#10B981]"></span>
          </span>
          <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.16em] text-[#10B981] font-semibold">
            Entusiast-deklaration
          </span>
        </div>
        <span className="text-[10px] font-mono text-[#728984]/70 select-none">
          ⌥ 100% on-device
        </span>
      </div>

      {/* Cozy, warm handwriting-influenced italic text */}
      <p className="text-xs sm:text-sm text-[#9bb3ae] group-hover/note:text-[#d3dedb] italic leading-relaxed m-0 font-sans tracking-wide transition-colors">
        "{text.replace(/^Entusiast-deklaration:\s*/i, '').replace(/^Enthusiast declaration:\s*/i, '')}"
      </p>
    </div>
  );
};
