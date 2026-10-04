import React, { useEffect } from 'react';
import { Language } from '../types';
import { X, ShieldCheck, Cpu } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: Language;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  const { lang, t } = useLanguage();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div
        className="relative bg-canvas border border-borderSubtle w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-8 text-titleText transition-colors duration-500"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 sm:p-7 border-b border-borderSubtle bg-cardSurface">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-accentGlow shadow-[0_0_10px_var(--accent-glow)]" />
            <h2 className="text-lg font-semibold tracking-tight text-titleText font-mono">
              local-ai.blog / about
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-bodyText hover:text-titleText hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            aria-label={t('close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6 text-xs sm:text-sm text-bodyText leading-relaxed max-h-[70vh] overflow-y-auto">
          <div>
            <h3 className="text-sm font-semibold text-accentGlow font-mono mb-2 uppercase tracking-wider">
              {lang === 'da' ? 'Mission & Vision' : 'Mission & Vision'}
            </h3>
            <p>
              {lang === 'da'
                ? 'local-ai.blog er en uafhængig, teknisk platform dedikeret til lokal, privat inferens og on-device kunstig intelligens på Apple Silicon (M1-M4), iOS og hybrid hardware.'
                : 'local-ai.blog is an independent engineering publication dedicated to local, private inference and on-device artificial intelligence across Apple Silicon (M1-M4), iOS, and hybrid hardware.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-cardSurface border border-borderSubtle space-y-1.5">
              <div className="flex items-center gap-2 text-titleText font-semibold text-xs tracking-wider font-mono">
                <ShieldCheck className="w-4 h-4 text-accentGlow" />
                <span>100% Offline</span>
              </div>
              <p className="text-xs text-bodyText">
                {lang === 'da'
                  ? 'Vi undersøger udelukkende arkitekturer og modeller, der kører lokalt uden cloud-afhængighed.'
                  : 'We focus strictly on setups and models running entirely local with zero cloud dependency.'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-cardSurface border border-borderSubtle space-y-1.5">
              <div className="flex items-center gap-2 text-titleText font-semibold text-xs tracking-wider font-mono">
                <Cpu className="w-4 h-4 text-accentGlow" />
                <span>{lang === 'da' ? 'Verificerede Data' : 'Verified Data'}</span>
              </div>
              <p className="text-xs text-bodyText">
                {lang === 'da'
                  ? 'Alle benchmarks måles på fysisk hardware under vedvarende arbejdsbelastninger.'
                  : 'All benchmarks are rigorously verified on real silicon under sustained thermal loads.'}
              </p>
            </div>
          </div>

          <div className="pt-2">
            <h3 className="text-sm font-semibold text-accentGlow font-mono mb-1 uppercase tracking-wider">
              {lang === 'da' ? 'Redaktion' : 'Editorial'}
            </h3>
            <p className="text-xs text-bodyText">
              {lang === 'da'
                ? 'Grundlagt og redigeret af Jesper Ferskov i København.'
                : 'Founded and edited by Jesper Ferskov in Copenhagen.'}
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-6 border-t border-borderSubtle bg-cardSurface flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-canvas hover:bg-black/5 dark:hover:bg-white/5 text-titleText border border-borderSubtle text-xs font-mono rounded-lg transition-colors cursor-pointer"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
};
