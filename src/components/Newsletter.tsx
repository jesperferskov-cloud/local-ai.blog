import React, { useState } from 'react';
import { Check, ArrowRight, Loader2 } from 'lucide-react';
import { Language } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface NewsletterProps {
  lang?: Language;
}

export const Newsletter: React.FC<NewsletterProps> = () => {
  const { lang, t } = useLanguage();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const titleText =
    lang === 'da'
      ? 'Notifikationer om nye indlæg'
      : (t('newsletterTitle') || 'Notifikationer om nye indlæg');

  const subtitleText =
    lang === 'da'
      ? 'Ingen traditionelle nyhedsbreve. Tilmeld dig for udelukkende at modtage en simpel e-mail, når der udgives nye guides til Apple Silicon og on-device AI.'
      : (t('newsletterSubtitle') || 'Ingen traditionelle nyhedsbreve. Tilmeld dig for udelukkende at modtage en simpel e-mail, når der udgives nye guides til Apple Silicon og on-device AI.');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError(t('newsletterError') || 'Indtast venligst en gyldig e-mailadresse.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Fejl under tilmelding.');
      }

      setSuccessMessage(
        data.message || (t('newsletterSuccess') || 'Tak for din tilmelding.')
      );
      setIsSubscribed(true);
      setEmail('');
    } catch (err: any) {
      setError(err?.message || 'Kunne ikke oprette forbindelse til serveren.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="w-full px-6 sm:px-10 lg:px-12 py-12 lg:py-16 border-t border-borderSubtle transition-colors duration-500">
      <div className="rounded-2xl bg-cardSurface border border-borderSubtle p-8 sm:p-12 relative overflow-hidden shadow-[var(--shadow-article-card)]">
        
        <div className="max-w-xl">
          <div className="text-xs font-mono uppercase tracking-widest text-accentGlow mb-2 font-medium">
            {lang === 'da' ? 'Notifikationer' : 'Notifications'}
          </div>

          <h3 className="text-xl sm:text-2xl font-semibold text-titleText tracking-tight leading-snug">
            {titleText}
          </h3>

          <p className="mt-2 text-xs sm:text-sm text-bodyText leading-relaxed">
            {subtitleText}
          </p>

          {isSubscribed ? (
            <div className="mt-6 flex items-center gap-2.5 text-xs text-accentGlow font-mono">
              <Check className="w-4 h-4 shrink-0" />
              <span>{successMessage || (lang === 'da' ? 'Tak! Du er nu tilmeldt notifikationer.' : 'Thank you! You are now subscribed to notifications.')}</span>
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
                disabled={isSubmitting}
                placeholder={t('newsletterPlaceholder') || 'din@email.dk'}
                className="flex-1 bg-canvas border border-borderSubtle text-titleText placeholder-bodyText text-xs sm:text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-accentGlow font-mono transition-colors disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-titleText hover:opacity-90 text-canvas text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap shadow-sm disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{lang === 'da' ? 'Tilmelder...' : 'Subscribing...'}</span>
                  </>
                ) : (
                  <>
                    <span>{t('newsletterSubmit') || 'Tilmeld'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}

          {error && <p className="text-xs text-rose-500 mt-2 font-mono">{error}</p>}
        </div>

      </div>
    </section>
  );
};
