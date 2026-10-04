/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Article } from './types';
import { Navbar } from './components/Navbar';
import { HeroFeatured } from './components/HeroFeatured';
import { ArticlesSection, ArticleFilterCategory } from './components/ArticlesSection';
import { AboutCard } from './components/AboutCard';
import { Newsletter } from './components/Newsletter';
import { Footer } from './components/Footer';
import { ArticleModal } from './components/ArticleModal';
import { AboutModal } from './components/AboutModal';
import { AdminPanel } from './components/admin/AdminPanel';
import { AdminLockScreen } from './components/admin/AdminLockScreen';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { SiteSettingsProvider } from './context/SiteSettingsContext';
import { ThemeProvider } from './context/ThemeContext';
import { hasValidAdminSession, clearAdminSession } from './services/adminAuthService';

function BlogApp() {
  const { lang } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<ArticleFilterCategory>('all');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Admin session authentication state (local-first)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return hasValidAdminSession();
  });

  // Router state: checks if user is on /admin or #admin
  const [currentRoute, setCurrentRoute] = useState<'blog' | 'admin'>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path === '/admin' || hash === '#admin') {
        return 'admin';
      }
    }
    return 'blog';
  });

  // 1. Hidden Developer Hotkey listener: Option + Shift + A on any page redirects to /admin
  useEffect(() => {
    const handleDeveloperHotkey = (e: KeyboardEvent) => {
      // Option (altKey) + Shift + A (Mac produces 'Å' or 'å', code is 'KeyA')
      const isOptionKey = e.altKey;
      const isShiftKey = e.shiftKey;
      const isKeyA =
        e.code === 'KeyA' ||
        e.key.toLowerCase() === 'a' ||
        e.key === 'å' ||
        e.key === 'Å';

      if (isOptionKey && isShiftKey && isKeyA) {
        e.preventDefault();
        navigateTo('admin');
      }
    };

    window.addEventListener('keydown', handleDeveloperHotkey);
    return () => window.removeEventListener('keydown', handleDeveloperHotkey);
  }, []);

  // Listen to browser popstate for back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path === '/admin' || hash === '#admin') {
        setCurrentRoute('admin');
      } else {
        setCurrentRoute('blog');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Sync multi-tab storage changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'admin-session') {
        setIsAdminAuthenticated(hasValidAdminSession());
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const navigateTo = (route: 'blog' | 'admin') => {
    setCurrentRoute(route);
    const targetUrl = route === 'admin' ? '/admin' : '/';
    if (window.location.pathname !== targetUrl) {
      window.history.pushState(null, '', targetUrl);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategory = (cat: ArticleFilterCategory) => {
    setActiveCategory(cat);
    if (currentRoute !== 'blog') {
      navigateTo('blog');
    }
  };

  const handleLockConsole = () => {
    clearAdminSession();
    setIsAdminAuthenticated(false);
  };

  // If on /admin route:
  // - If not authenticated: show Zen Lock Screen Password Gateway
  // - If authenticated: show Control Blog Post Center
  if (currentRoute === 'admin') {
    if (!isAdminAuthenticated) {
      return (
        <AdminLockScreen
          onAuthenticated={() => setIsAdminAuthenticated(true)}
          onBackToBlog={() => navigateTo('blog')}
        />
      );
    }

    return (
      <AdminPanel
        onBackToBlog={() => navigateTo('blog')}
        onLockConsole={handleLockConsole}
      />
    );
  }

  return (
    /* The Eclipse Aura Setup:
       Outer page background: var(--bg-outer)
       Soft radial halo: radial-gradient(circle at 50% 30%, var(--accent-glow) 0%, transparent 60%)
       Central floating container with rounded corners (24px), Canvas background (var(--bg-inner)),
       Ambient diffused drop shadow, inner glow, and subtle aluminum border.
    */
    <div className="relative min-h-screen bg-outer p-3 sm:p-5 md:p-7 lg:p-10 xl:p-12 flex flex-col items-center justify-start font-sans selection:bg-accentGlow selection:text-canvas overflow-x-hidden transition-colors duration-500">
      {/* The Eclipse Aura: Soft Ambient Radial Glow Halo */}
      <div
        className="pointer-events-none fixed inset-0 z-0 animate-aura-pulse transition-opacity duration-700"
        style={{
          background: 'radial-gradient(circle at 50% 30%, var(--accent-glow) 0%, transparent 60%)',
          opacity: 'var(--halo-opacity)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-[1360px] bg-canvas rounded-[24px] overflow-hidden text-titleText shadow-[var(--shadow-main-container)] border border-borderSubtle transition-all duration-500 flex flex-col">
        
        {/* Navigation Bar with interactive DA / EN switch and Morgengry / Aftengry toggle */}
        <Navbar
          onSelectCategory={(cat) => handleSelectCategory(cat as ArticleFilterCategory)}
          searchOpen={searchOpen}
          onToggleSearch={() => setSearchOpen((prev) => !prev)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Main Content Flow */}
        <main className="flex-1 flex flex-col">
          {/* Centered Editorial Hero Section */}
          <HeroFeatured
            onReadArticle={(art) => setSelectedArticle(art)}
            onScrollToAbout={() => {
              const el = document.getElementById('bag-om-bloggen');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
          />

          {/* Grid of Clean Articles */}
          <ArticlesSection
            activeCategory={activeCategory}
            onSelectCategory={handleSelectCategory}
            onReadArticle={(art) => setSelectedArticle(art)}
            searchQuery={searchQuery}
          />

          {/* "Bag om bloggen" (About Me) Editorial Signature Card */}
          <AboutCard id="bag-om-bloggen" />

          {/* Minimalist Newsletter */}
          <Newsletter />
        </main>

        {/* Minimalist Zen-Tech Footer */}
        <Footer onNavigateToAdmin={() => navigateTo('admin')} />

      </div>

      {/* Interactive Modals */}
      <ArticleModal
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />

      <AboutModal
        isOpen={aboutOpen}
        onClose={() => setAboutOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <SiteSettingsProvider>
          <BlogApp />
        </SiteSettingsProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
