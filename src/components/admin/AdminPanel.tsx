import React, { useState, useEffect, useCallback } from 'react';
import { StoredPost, sampleAdminPosts, initialDraftContent } from '../../data/adminSeed';
import { AdminTopNav } from './AdminTopNav';
import { AdminMetrics } from './AdminMetrics';
import { MarkdownWorkspace } from './MarkdownWorkspace';
import { ArticleListView } from './ArticleListView';
import { SiteSettingsWorkspace } from './SiteSettingsWorkspace';
import { Database, CheckCircle2 } from 'lucide-react';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { getTodayDateString } from '../../utils/dateUtils';

interface AdminPanelProps {
  onBackToBlog: () => void;
  onLockConsole?: () => void;
}

const STORAGE_POSTS_KEY = 'localai_blog_admin_posts_v1';
const STORAGE_CURRENT_KEY = 'localai_blog_current_draft_v1';

export const AdminPanel: React.FC<AdminPanelProps> = ({ onBackToBlog, onLockConsole }) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'settings'>('posts');
  const { saveSettings } = useSiteSettings();

  // Posts state initialized with 28 posts (5 drafts, 23 published)
  const [posts, setPosts] = useState<StoredPost[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_POSTS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load posts from storage', e);
    }
    // Expand to exactly 28 items if initial
    const base = [...sampleAdminPosts];
    while (base.length < 28) {
      const idx = base.length + 1;
      const isDraft = base.filter((p) => p.status === 'draft').length < 5;
      base.push({
        id: `post-gen-${idx}`,
        title: isDraft
          ? `Kladde ${idx}: Fine-tuning på Apple Silicon med MLX`
          : `Artikel ${idx}: Metal Acceleration Guide for Swift & Python`,
        slug: `artikel-${idx}-metal-acceleration`,
        status: isDraft ? 'draft' : 'published',
        category: idx % 2 === 0 ? 'mac' : 'benchmarks',
        hardwareArch: 'apple-m',
        hardwareLabel: 'M3 / M4 Apple Silicon',
        tags: ['Apple Silicon', 'Metal', 'MLX'],
        metrics: {
          primaryValue: '42.1 tok/s',
          primaryLabel: 'Gns. Hastighed',
          secondaryValue: '18.4 GB',
          secondaryLabel: 'RAM Forbrug',
        },
        markdown: `# Artikel ${idx}\n\nTeknisk analyse af lokal maskinlæring og Metal shaders.`,
        updatedAt: new Date(Date.now() - idx * 86400000).toISOString(),
        wordCount: 520,
        readTime: '3 min',
      });
    }
    return base;
  });

  // Current active draft in Zen Markdown Editor
  const [currentPost, setCurrentPost] = useState<StoredPost>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_CURRENT_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load active draft from storage', e);
    }
    return initialDraftContent;
  });

  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedTimestamp, setLastSavedTimestamp] = useState<Date>(new Date());
  const [lastSavedText, setLastSavedText] = useState('Gemt lokalt: Lige nu');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load physical posts from /content/posts/ on mount
  useEffect(() => {
    fetch('/api/posts')
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((diskPosts) => {
        if (diskPosts && Array.isArray(diskPosts) && diskPosts.length > 0) {
          setPosts((prev) => {
            const merged = [...diskPosts];
            for (const p of prev) {
              if (!merged.some((m) => m.slug === p.slug || m.id === p.id)) {
                merged.push(p);
              }
            }
            return merged;
          });
        }
      })
      .catch((err) => {
        console.warn('Could not read disk posts, using local cache', err);
      });
  }, []);

  // Synchronize to physical local drive (/content/posts/*.md) and localStorage
  const performSave = useCallback(
    async (postToSave: StoredPost, showFeedback: boolean = false) => {
      setIsSaving(true);
      try {
        const now = new Date();
        const updatedPost = {
          ...postToSave,
          updatedAt: now.toISOString(),
        };

        // 1. Write physical .md file to /content/posts/ via Node/Express backend
        try {
          await fetch('/api/posts/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedPost),
          });
        } catch (syncErr) {
          console.warn('Server sync error, falling back to local storage', syncErr);
        }

        // 2. Update local state and persistent storage
        setPosts((prevPosts) => {
          const updated = prevPosts.map((p) => (p.id === updatedPost.id ? updatedPost : p));
          if (!updated.some((p) => p.id === updatedPost.id)) {
            updated.unshift(updatedPost);
          }
          localStorage.setItem(STORAGE_POSTS_KEY, JSON.stringify(updated));
          return updated;
        });

        localStorage.setItem(STORAGE_CURRENT_KEY, JSON.stringify(updatedPost));

        setLastSavedTimestamp(now);
        setLastSavedText(`Gemt: ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);

        if (showFeedback) {
          setToastMessage(
            `Synkroniseret! /content/posts/${updatedPost.slug}.md`
          );
          setTimeout(() => setToastMessage(null), 3000);
        }
      } catch (err) {
        console.error('Save failed', err);
      } finally {
        setTimeout(() => setIsSaving(false), 300);
      }
    },
    []
  );

  // Auto-save Engine: Every 30 seconds for active post
  useEffect(() => {
    if (activeTab !== 'posts') return;
    const timer = setInterval(() => {
      performSave(currentPost, false);
    }, 30000);

    return () => clearInterval(timer);
  }, [currentPost, performSave, activeTab]);

  // Master save action triggered from TopNav button
  const handleTopNavSave = async () => {
    if (activeTab === 'posts') {
      performSave(currentPost, true);
    } else {
      setIsSaving(true);
      try {
        const res = await saveSettings();
        setToastMessage(res.message);
        setTimeout(() => setToastMessage(null), 3000);
      } catch (err: any) {
        setToastMessage('Fejl ved gemning af indstillinger');
      } finally {
        setIsSaving(false);
      }
    }
  };

  // Keyboard shortcut listener: Cmd+S / Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleTopNavSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPost, performSave, activeTab, saveSettings]);

  const handleNewPost = () => {
    setActiveTab('posts');
    const newId = `draft-${Date.now()}`;
    const today = getTodayDateString();
    const newPost: StoredPost = {
      id: newId,
      title: 'Nyt indlæg',
      slug: `nyt-indlaeg-${Date.now().toString().slice(-4)}`,
      date: today,
      readingTime: '1 min',
      hardware: 'M4 Apple Silicon',
      status: 'draft',
      category: 'mac',
      hardwareArch: 'apple-m',
      hardwareLabel: 'M4 Apple Silicon',
      tags: ['Lokal AI', 'Apple Silicon'],
      metrics: {
        primaryValue: '48.0 tok/s',
        primaryLabel: 'Inferenshastighed',
        secondaryValue: '16.0 GB',
        secondaryLabel: 'RAM Forbrug',
      },
      markdown: `# Nyt indlæg\n\nSkriv dit tekniske indhold her...`,
      updatedAt: new Date().toISOString(),
      wordCount: 7,
      readTime: '1 min',
    };
    setCurrentPost(newPost);
    performSave(newPost, true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeletePost = (id: string) => {
    setPosts((prev) => {
      const filtered = prev.filter((p) => p.id !== id);
      localStorage.setItem(STORAGE_POSTS_KEY, JSON.stringify(filtered));
      return filtered;
    });
    setToastMessage('Indlæg slettet');
    setTimeout(() => setToastMessage(null), 2500);
  };

  const draftsCount = posts.filter((p) => p.status === 'draft').length;
  const publishedCount = posts.filter((p) => p.status === 'published').length;

  return (
    /* The Eclipse Aura Setup:
       Outer page background: #161E1D (deep smoky forest-slate).
       Soft radial halo: radial-gradient(circle at 50% 30%, rgba(16, 185, 129, 0.03) 0%, transparent 60%).
       Central floating container with rounded corners (24px) using #091614 (Deep Forest Black) as the inner canvas.
       Mac-style ambient diffused drop shadow, microscopic inner glow, and 1px glowing aluminum border gradient.
    */
    <div className="relative min-h-screen bg-[#161E1D] p-3 sm:p-5 md:p-7 lg:p-10 xl:p-12 flex flex-col items-center justify-start font-sans selection:bg-[#10B981] selection:text-[#091614] overflow-x-hidden">
      {/* The Eclipse Aura: Soft Ambient Radial Glow Halo */}
      <div
        className="pointer-events-none fixed inset-0 z-0 animate-aura-pulse"
        style={{
          background: 'radial-gradient(circle at 50% 30%, rgba(16, 185, 129, 0.03) 0%, transparent 60%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-[1360px] bg-[#091614] rounded-[24px] overflow-hidden text-neutral-100 shadow-[0_30px_100px_-10px_rgba(0,0,0,0.6),0_10px_30px_-15px_rgba(0,0,0,0.4),inset_0_1px_0_0_rgba(255,255,255,0.05)] border-t border-white/10 border-x border-white/5 border-b border-transparent flex flex-col">
        
        {/* Top Navigation with tabs [Post Manager] [Websted Indstillinger] */}
        <AdminTopNav
          onBackToBlog={onBackToBlog}
          lastSavedText={lastSavedText}
          isSaving={isSaving}
          onManualSave={handleTopNavSave}
          onNewPost={handleNewPost}
          onLockConsole={onLockConsole}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {activeTab === 'posts' ? (
          <>
            {/* 2. Cleansed Top Stats Area: Single ultra-thin metrics bar */}
            <AdminMetrics
              totalPosts={posts.length}
              draftsCount={draftsCount}
              publishedCount={publishedCount}
            />

            {/* 3. Zen Markdown Editor: Clean borderless typing sheet + collapsible settings sidebar */}
            <MarkdownWorkspace
              post={currentPost}
              onChange={(updated) => setCurrentPost(updated)}
              onSyncLocalDB={() => performSave(currentPost, true)}
              isSaving={isSaving}
              lastSavedText={lastSavedText}
            />

            {/* 4. Article List View: Simple, minimalist text list below editor */}
            <ArticleListView
              posts={posts}
              currentPostId={currentPost.id}
              onSelectPost={(post) => {
                setCurrentPost(post);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onDeletePost={handleDeletePost}
            />
          </>
        ) : (
          /* Global Site Settings Workspace Tab */
          <SiteSettingsWorkspace
            onNotify={(msg) => {
              setToastMessage(msg);
              setTimeout(() => setToastMessage(null), 3000);
            }}
          />
        )}

      </div>

      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0c1d19] border border-[#16332c] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-xs font-mono animate-in slide-in-from-bottom-5 duration-200">
          <Database className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-[#6c8077] hover:text-white ml-2 text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
