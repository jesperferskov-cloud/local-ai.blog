/**
 * Zen Password Gateway (Lock Screen) for /admin
 * Design System: local-ai.blog (Zen-Tech Edition)
 * Pure Command-Line Aesthetics on Deep Forest Black (#091614)
 */

import React, { useState, useEffect, useRef } from 'react';
import { verifyAdminPassword, createAdminSession } from '../../services/adminAuthService';

interface AdminLockScreenProps {
  onAuthenticated: () => void;
  onBackToBlog?: () => void;
}

export const AdminLockScreen: React.FC<AdminLockScreenProps> = ({
  onAuthenticated,
  onBackToBlog,
}) => {
  const [password, setPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep input focused at all times
  useEffect(() => {
    inputRef.current?.focus();

    const handleGlobalClick = () => {
      inputRef.current?.focus();
    };

    const handleWindowFocus = () => {
      inputRef.current?.focus();
    };

    window.addEventListener('click', handleGlobalClick);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      window.removeEventListener('click', handleGlobalClick);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, []);

  // Handle Escape key to return to blog if desired
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onBackToBlog) {
        e.preventDefault();
        onBackToBlog();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBackToBlog]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isVerifying || isSuccess) return;

    const trimmed = password.trim();

    // Check for exit command
    if ((trimmed === 'exit' || trimmed === 'quit' || trimmed === ':q') && onBackToBlog) {
      onBackToBlog();
      return;
    }

    if (!trimmed) {
      // Empty submit: trigger subtle red flash
      triggerError();
      return;
    }

    setIsVerifying(true);

    try {
      const isValid = await verifyAdminPassword(trimmed);

      if (isValid) {
        setIsSuccess(true);
        createAdminSession();

        // Smooth visual transition into Control Blog Post Center
        setTimeout(() => {
          onAuthenticated();
        }, 360);
      } else {
        triggerError();
      }
    } catch (err) {
      console.error('Password verification error:', err);
      triggerError();
    } finally {
      setIsVerifying(false);
    }
  };

  const triggerError = () => {
    setIsError(true);
    setPassword('');

    // Flash cursor red once, then reset and let user try again immediately
    setTimeout(() => {
      setIsError(false);
      inputRef.current?.focus();
    }, 650);
  };

  return (
    <div
      className={`fixed inset-0 w-full h-full bg-[#091614] text-[#F1F5F4] flex flex-col items-center justify-center p-6 select-none z-50 cursor-text transition-opacity duration-300 ${
        isSuccess ? 'opacity-0 scale-[0.99]' : 'opacity-100 scale-100'
      }`}
      onClick={() => inputRef.current?.focus()}
    >
      <div className="w-full max-w-sm flex flex-col items-center">
        {/* Terminal Header: Glowing Emerald Green Dot & Small Caps Title */}
        <div className="flex items-center gap-2.5 mb-4 select-none">
          <span
            className="w-2 h-2 rounded-full bg-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.85)]"
            aria-hidden="true"
          />
          <h1 className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#728984] font-medium m-0 p-0">
            local-ai.blog console lock
          </h1>
        </div>

        {/* Terminal Input Line */}
        <div className="w-full flex justify-center">
          <form
            onSubmit={handleSubmit}
            className={`w-full max-w-[280px] relative font-mono transition-transform duration-200 ${
              isError ? 'animate-shake' : ''
            }`}
          >
            <label htmlFor="console-auth-input" className="sr-only">
              Console adgangskode
            </label>

            {/* Hidden, accessible input field with autofocus */}
            <input
              id="console-auth-input"
              ref={inputRef}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isVerifying || isSuccess}
              autoFocus
              autoComplete="current-password"
              spellCheck={false}
              autoCapitalize="none"
              className="absolute inset-0 w-full h-full opacity-0 pointer-events-auto cursor-text z-10"
              aria-label="Console password"
            />

            {/* Visual Command-Line Aesthetics */}
            <div className="flex items-center justify-center min-h-[36px] w-full text-center">
              {/* Masked typed password characters */}
              {password.length > 0 && (
                <span className="text-[#F1F5F4] text-base tracking-[0.22em] select-none font-mono">
                  {'•'.repeat(password.length)}
                </span>
              )}

              {/* Blinking Terminal Cursor */}
              <span
                className={`inline-block font-mono font-bold text-xl select-none leading-none transition-colors duration-150 ${
                  isError
                    ? 'text-[#EF4444] shadow-[0_0_10px_rgba(239,68,68,0.9)] opacity-100'
                    : isSuccess
                    ? 'text-[#10B981] shadow-[0_0_12px_rgba(16,185,129,1)] opacity-100'
                    : 'text-[#10B981] animate-cursor-blink'
                } ${password.length > 0 ? 'ml-1' : ''}`}
                aria-hidden="true"
              >
                _
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
