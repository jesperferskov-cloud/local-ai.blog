import React, { useState } from 'react';
import { Check, ArrowRight } from 'lucide-react';
import { Language } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface NewsletterProps {
  lang?: Language;
}

export const Newsletter: React.FC<NewsletterProps> = () => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError(t('newsletterError'));
      return;
    }
    setError('');
    setIsSubscribed(true);
  };

  return (
    <section className="w-full px-6 sm:px-10 lg:px-12 py-12 lg:py-16 border-t border-white/5">
      <div className="rounded-2xl bg-[#0E1F1C] border border-white/5 p-8 sm:p-12 relative overflow-hidden">
        
        <div className="max-w-xl">
          <div className="text-xs font-mono uppercase tracking-widest text-[#10B981] mb-2 font-medium">
            Newsletter
          </div>

          <h3 className="text-xl sm:text-2xl font-semibold text-[#F1F5F4] tracking-tight leading-snug">
            {t('newsletterTitle')}
          </h3>

          <p className="mt-2 text-xs sm:text-sm text-[#728984] leading-relaxed">
            {t('newsletterSubtitle')}
          </p>

          {isSubscribed ? (
            <div className="mt-6 flex items-center gap-2.5 text-xs text-[#10B981] font-mono">
              <Check className="w-4 h-4" />
              <span>{t('newsletterSuccess')}</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                placeholder={t('newsletterPlaceholder')}
                className="flex-1 bg-[#091614] border border-white/10 text-[#F1F5F4] placeholder-[#728984] text-xs sm:text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#10B981] font-mono transition-colors"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#F1F5F4] hover:bg-white text-[#091614] text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap shadow-sm"
              >
                <span>{t('newsletterSubmit')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          {error && <p className="text-xs text-rose-400 mt-2 font-mono">{error}</p>}
        </div>

      </div>
    </section>
  );
};
