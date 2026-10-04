import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Check, Loader2, ArrowLeft, Mail, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const Unsubscribe = ({ onBackToBlog }) => {
  const { lang } = useLanguage();
  const isEn = lang === 'en';

  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'no-email' | 'error'
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);

  // Prevent multiple executions in React 18 strict mode
  const hasExecutedRef = useRef(false);

  const handleReturnHome = (e) => {
    if (e) e.preventDefault();
    if (onBackToBlog) {
      onBackToBlog();
    } else {
      window.history.pushState(null, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const performUnsubscribe = async (targetEmail) => {
    if (!targetEmail || !targetEmail.trim() || !targetEmail.includes('@')) {
      setStatus('no-email');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/unsubscribe', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: targetEmail.trim() }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok && response.status !== 404) {
        throw new Error(data.error || (isEn ? 'Could not unsubscribe' : 'Fejl ved afmelding'));
      }

      setStatus('success');
    } catch (err) {
      console.error('[Unsubscribe Error]:', err);
      setErrorMessage(
        err?.message || (isEn ? 'Failed to unsubscribe. Please try again.' : 'Kunne ikke gennemføre afmelding.')
      );
      setStatus('error');
    }
  };

  useEffect(() => {
    if (hasExecutedRef.current) return;
    hasExecutedRef.current = true;

    // 1. Read ?email= query parameter from window.location.search or hash
    let detectedEmail = '';
    try {
      const searchParams = new URLSearchParams(window.location.search);
      detectedEmail = searchParams.get('email') || '';

      // Fallback: Check hash query if using hash-based routing (e.g. #unsubscribe?email=...)
      if (!detectedEmail && window.location.hash.includes('?')) {
        const hashQuery = window.location.hash.split('?')[1];
        const hashParams = new URLSearchParams(hashQuery);
        detectedEmail = hashParams.get('email') || '';
      }
    } catch (e) {
      console.error('Error parsing URL query params:', e);
    }

    if (detectedEmail && detectedEmail.trim()) {
      const cleanEmail = detectedEmail.trim().toLowerCase();
      setEmail(cleanEmail);
      performUnsubscribe(cleanEmail);
    } else {
      setStatus('no-email');
    }
  }, [isEn]);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualEmail || !manualEmail.includes('@')) {
      setErrorMessage(
        isEn ? 'Please enter a valid email address' : 'Indtast venligst en gyldig e-mailadresse'
      );
      return;
    }
    setEmail(manualEmail.trim().toLowerCase());
    setIsSubmittingManual(true);
    performUnsubscribe(manualEmail.trim().toLowerCase()).finally(() => {
      setIsSubmittingManual(false);
    });
  };

  return (
    <div className="min-h-screen bg-outer flex items-center justify-center p-4 sm:p-6 transition-colors duration-500 font-sans">
      {/* Background Zen Halo */}
      <div
        className="pointer-events-none fixed inset-0 z-0 animate-aura-pulse"
        style={{
          background: 'radial-gradient(circle at 50% 35%, var(--accent-glow) 0%, transparent 65%)',
          opacity: 'var(--halo-opacity)',
        }}
        aria-hidden="true"
      />

      {/* Main Centered Zen-Tech Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md rounded-2xl bg-cardSurface border border-borderSubtle p-8 sm:p-10 shadow-[var(--shadow-article-card)] text-center flex flex-col items-center"
      >
        {/* Subtle Brand Node */}
        <div className="flex items-center gap-2 mb-6">
          <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accentGlow opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accentGlow shadow-[0_0_8px_var(--accent-glow)]"></span>
          </span>
          <span className="font-mono text-[11px] uppercase tracking-widest text-accentGlow font-semibold select-none">
            local-ai.blog
          </span>
        </div>

        {/* 1. LOADING STATE */}
        {status === 'loading' && (
          <div className="flex flex-col items-center py-4 space-y-4">
            <div className="w-12 h-12 rounded-full bg-canvas border border-borderSubtle flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-accentGlow animate-spin" />
            </div>
            <div className="space-y-1">
              <h1 className="text-base sm:text-lg font-semibold text-titleText tracking-tight">
                {isEn ? 'Processing unsubscription...' : 'Behandler afmelding...'}
              </h1>
              {email && (
                <p className="font-mono text-xs text-bodyText tracking-wide">
                  {email}
                </p>
              )}
            </div>
          </div>
        )}

        {/* 2. SUCCESS STATE (Zen-Tech ét-kliks success) */}
        {status === 'success' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center space-y-5"
          >
            {/* Green glowing badge */}
            <div className="w-12 h-12 rounded-full bg-accentGlow/10 border border-accentGlow/30 flex items-center justify-center shadow-[0_0_16px_rgba(16,185,129,0.2)]">
              <Check className="w-5 h-5 text-accentGlow" />
            </div>

            <div className="space-y-2">
              <h1 className="text-lg sm:text-xl font-semibold text-titleText tracking-tight">
                {isEn ? 'Unsubscribed' : 'Afmeldt notifikationer'}
              </h1>
              {/* Den specifikke grønne succes-besked */}
              <p className="text-xs sm:text-sm text-accentGlow font-mono font-medium leading-relaxed max-w-xs mx-auto">
                {isEn
                  ? 'You have now unsubscribed. Thank you for reading.'
                  : 'Du er nu afmeldt. Tak for at du læste med.'}
              </p>
              {email && (
                <p className="text-[11px] font-mono text-bodyText/80 pt-1">
                  ({email})
                </p>
              )}
            </div>

            <div className="pt-3 w-full">
              <button
                type="button"
                onClick={handleReturnHome}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-titleText hover:opacity-90 text-canvas text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer shadow-sm group"
              >
                <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
                <span>{isEn ? 'Back to homepage' : 'Tilbage til forsiden'}</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* 3. NO-EMAIL PROVIDED STATE (Fallback if link was visited without ?email=) */}
        {status === 'no-email' && (
          <div className="flex flex-col items-center space-y-4 w-full">
            <div className="w-12 h-12 rounded-full bg-canvas border border-borderSubtle flex items-center justify-center text-bodyText">
              <Mail className="w-5 h-5" />
            </div>

            <div className="space-y-1">
              <h1 className="text-base sm:text-lg font-semibold text-titleText tracking-tight">
                {isEn ? 'Unsubscribe from notifications' : 'Afmeld notifikationer'}
              </h1>
              <p className="text-xs text-bodyText leading-relaxed">
                {isEn
                  ? 'Enter your email below to remove it from our local subscriber list.'
                  : 'Indtast din e-mailadresse herunder for at fjerne den fra vores lokale abonnentliste.'}
              </p>
            </div>

            <form onSubmit={handleManualSubmit} className="w-full space-y-3 pt-2">
              <input
                type="email"
                value={manualEmail}
                onChange={(e) => {
                  setManualEmail(e.target.value);
                  setErrorMessage('');
                }}
                placeholder="din@email.dk"
                required
                className="w-full bg-canvas border border-borderSubtle text-titleText placeholder-bodyText/60 text-xs rounded-xl px-4 py-2.5 focus:outline-none focus:border-accentGlow font-mono transition-colors"
              />
              <button
                type="submit"
                disabled={isSubmittingManual}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-titleText hover:opacity-90 text-canvas text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer disabled:opacity-50"
              >
                {isSubmittingManual ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{isEn ? 'Processing...' : 'Behandler...'}</span>
                  </>
                ) : (
                  <span>{isEn ? 'Unsubscribe' : 'Afmeld nu'}</span>
                )}
              </button>
            </form>

            {errorMessage && (
              <p className="text-xs text-rose-500 font-mono mt-1">{errorMessage}</p>
            )}

            <button
              type="button"
              onClick={handleReturnHome}
              className="text-xs text-bodyText hover:text-titleText transition-colors pt-2 font-mono"
            >
              {isEn ? '← Back to homepage' : '← Tilbage til forsiden'}
            </button>
          </div>
        )}

        {/* 4. ERROR STATE */}
        {status === 'error' && (
          <div className="flex flex-col items-center space-y-4 w-full">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
              <AlertCircle className="w-5 h-5" />
            </div>

            <div className="space-y-1">
              <h1 className="text-base sm:text-lg font-semibold text-titleText tracking-tight">
                {isEn ? 'Something went wrong' : 'Noget gik galt'}
              </h1>
              <p className="text-xs text-rose-400 font-mono leading-relaxed">
                {errorMessage || (isEn ? 'Could not complete unsubscription.' : 'Kunne ikke gennemføre afmeldingen.')}
              </p>
            </div>

            <div className="pt-3 w-full space-y-2">
              {email && (
                <button
                  type="button"
                  onClick={() => performUnsubscribe(email)}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-titleText hover:opacity-90 text-canvas text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer"
                >
                  <span>{isEn ? 'Try again' : 'Prøv igen'}</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleReturnHome}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-borderSubtle text-bodyText hover:text-titleText text-xs font-medium tracking-wide transition-all duration-200 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{isEn ? 'Back to homepage' : 'Tilbage til forsiden'}</span>
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Unsubscribe;
