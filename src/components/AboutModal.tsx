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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div
        className="relative bg-[#091614] border border-white/10 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-8 text-neutral-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 sm:p-7 border-b border-white/5 bg-[#0E1F1C]">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#10B981] shadow-[0_0_10px_#10B981]" />
            <h2 className="text-lg font-semibold tracking-tight text-[#F1F5F4] font-mono">
              local-ai.blog / about
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#728984] hover:text-[#F1F5F4] hover:bg-white/5 transition-colors cursor-pointer"
            aria-label={t('close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6 text-xs sm:text-sm text-[#728984] leading-relaxed max-h-[70vh] overflow-y-auto">
          <div>
            <h3 className="text-sm font-semibold text-[#F1F5F4] font-mono mb-2 uppercase tracking-wider text-[#10B981]">
              {lang === 'da' ? 'Mission & Vision' : 'Mission & Vision'}
            </h3>
            <p>
              {lang === 'da'
                ? 'local-ai.blog er en uafhængig, teknisk platform dedikeret til lokal, privat inferens og on-device kunstig intelligens på Apple Silicon (M1-M4), iOS og hybrid hardware.'
                : 'local-ai.blog is an independent engineering publication dedicated to local, private inference and on-device artificial intelligence across Apple Silicon (M1-M4), iOS, and hybrid hardware.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-[#0E1F1C] border border-white/5 space-y-1.5">
              <div className="flex items-center gap-2 text-[#F1F5F4] font-semibold text-xs tracking-wider font-mono">
                <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                <span>100% Offline</span>
              </div>
              <p className="text-xs text-[#728984]">
                {lang === 'da'
                  ? 'Vi undersøger udelukkende arkitekturer og modeller, der kører lokalt uden cloud-afhængighed.'
                  : 'We focus strictly on setups and models running entirely local with zero cloud dependency.'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#0E1F1C] border border-white/5 space-y-1.5">
              <div className="flex items-center gap-2 text-[#F1F5F4] font-semibold text-xs tracking-wider font-mono">
                <Cpu className="w-4 h-4 text-[#10B981]" />
                <span>{lang === 'da' ? 'Verificerede Data' : 'Verified Data'}</span>
              </div>
              <p className="text-xs text-[#728984]">
                {lang === 'da'
                  ? 'Alle benchmarks måles på fysisk hardware under vedvarende arbejdsbelastninger.'
                  : 'All benchmarks are rigorously verified on real silicon under sustained thermal loads.'}
              </p>
            </div>
          </div>

          <div className="pt-2">
            <h3 className="text-sm font-semibold text-[#F1F5F4] font-mono mb-1 uppercase tracking-wider text-[#10B981]">
              {lang === 'da' ? 'Redaktion' : 'Editorial'}
            </h3>
            <p className="text-xs text-[#728984]">
              {lang === 'da'
                ? 'Grundlagt og redigeret af Jesper Ferskov i København.'
                : 'Founded and edited by Jesper Ferskov in Copenhagen.'}
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-6 border-t border-white/5 bg-[#0E1F1C] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#132B25] hover:bg-[#193a32] text-[#F1F5F4] border border-white/10 text-xs font-mono rounded-lg transition-colors cursor-pointer"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
};
