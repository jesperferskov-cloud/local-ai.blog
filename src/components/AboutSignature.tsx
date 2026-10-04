import React from 'react';
import { useLanguage } from '../context/LanguageContext';

interface AboutSignatureProps {
  id?: string;
}

export const AboutSignature: React.FC<AboutSignatureProps> = ({ id = 'bag-om-bloggen' }) => {
  const { lang } = useLanguage();
  const isEn = lang === 'en';

  return (
    <section
      id={id}
      aria-label={isEn ? 'About the author' : 'Bag om bloggen'}
      className="w-full px-6 sm:px-10 lg:px-12 py-10 sm:py-12 lg:py-16 border-t border-white/5 scroll-mt-6"
    >
      {/* Signature Card Container: dark forest-slate (#0E1F1C), border-white/5, rounded-2xl, generous padding */}
      <div className="w-full rounded-2xl bg-[#0E1F1C] border border-white/5 p-8 md:p-12 relative overflow-hidden shadow-xl transition-all duration-300 hover:border-white/10">
        
        {/* Subtle organic emerald aura in background */}
        <div
          className="absolute -top-20 -left-20 w-72 h-72 rounded-full pointer-events-none opacity-25"
          style={{
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.28) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full pointer-events-none opacity-15"
          style={{
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%)',
          }}
        />

        {/* 2-Column Editorial Layout on Desktop */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Profile Frame, Header & Sub-badge */}
          <div className="lg:col-span-5 flex items-center gap-5 sm:gap-6">
            {/* Elegant circular profile frame with glowing emerald circle */}
            <div className="relative shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#132B25] border border-[#10B981]/40 flex items-center justify-center shadow-[0_0_24px_rgba(16,185,129,0.22)] ring-1 ring-white/10 transition-transform duration-300 hover:scale-105">
                <span className="font-mono font-semibold text-lg sm:text-xl text-[#F1F5F4] tracking-wider select-none">
                  JF
                </span>
              </div>
              {/* Abstract glowing emerald on-device status dot */}
              <span
                className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#10B981] border-2 border-[#0E1F1C] shadow-[0_0_8px_#10B981]"
                title="100% On-Device / Lokal"
              />
            </div>

            {/* Clean header & sub-badge */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#728984] font-medium block">
                {isEn ? 'Behind the blog' : 'Bag om bloggen'}
              </span>
              <h3 className="text-xl sm:text-2xl font-semibold text-[#F1F5F4] tracking-tight leading-tight">
                {isEn ? 'Hej, jeg er Jesper' : 'Hej, jeg er Jesper'}
              </h3>
              <div className="text-xs font-mono text-[#10B981] font-medium tracking-wide flex items-center gap-1.5 pt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                <span>{isEn ? 'Selvlært AI Entusiast' : 'Selvlært AI Entusiast'}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Dæmpet, personal and readable bio text */}
          <div className="lg:col-span-7 border-t lg:border-t-0 lg:border-l border-white/5 pt-6 lg:pt-0 lg:pl-10">
            <p className="text-base text-[#728984] leading-relaxed font-sans">
              {isEn
                ? 'Dette er mit private, digitale frirum. Som autodidakt AI-entusiast bruger jeg bloggen her til at logge mine personlige erfaringer med alt fra komplekse dual-AI setups til praktisk hverdagsbrug på Apple Silicon. Her finder du ufiltrerede benchmarks, prompt-eksperimenter og mine personlige oplevelser med at køre modeller som Gemma 2-9B lokalt på min Mac uden skyen.'
                : 'Dette er mit private, digitale frirum. Som autodidakt AI-entusiast bruger jeg bloggen her til at logge mine personlige erfaringer med alt fra komplekse dual-AI setups til praktisk hverdagsbrug på Apple Silicon. Her finder du ufiltrerede benchmarks, prompt-eksperimenter og mine personlige oplevelser med at køre modeller som Gemma 2-9B lokalt på min Mac uden skyen.'}
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};
