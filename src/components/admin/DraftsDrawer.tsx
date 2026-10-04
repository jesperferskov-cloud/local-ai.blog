import React, { useState } from 'react';
import { StoredPost } from '../../data/adminSeed';
import { X, Search, Plus, FileText, CheckCircle2, Clock, Trash2, Cpu, ArrowRight } from 'lucide-react';

interface DraftsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  posts: StoredPost[];
  currentPostId: string;
  onSelectPost: (post: StoredPost) => void;
  onNewPost: () => void;
  onDeletePost: (id: string) => void;
  isDark: boolean;
}

export const DraftsDrawer: React.FC<DraftsDrawerProps> = ({
  isOpen,
  onClose,
  posts,
  currentPostId,
  onSelectPost,
  onNewPost,
  onDeletePost,
  isDark,
}) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'draft' | 'published'>('all');

  if (!isOpen) return null;

  const filteredPosts = posts.filter((p) => {
    const matchSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchFilter = filter === 'all' || p.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div
        className={`w-full max-w-md h-full shadow-2xl flex flex-col border-l transition-colors ${
          isDark ? 'bg-neutral-950 border-neutral-800 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className={`p-5 border-b flex items-center justify-between ${
          isDark ? 'border-neutral-800 bg-neutral-900/60' : 'border-neutral-200 bg-neutral-50'
        }`}>
          <div>
            <h2 className="text-base font-bold tracking-tight">
              Indlæg & Kladder ({posts.length})
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Administrer lokale artikler i SQLite lageret
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar: New post & Search */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 space-y-3">
          <button
            onClick={() => {
              onNewPost();
              onClose();
            }}
            className="w-full py-2 px-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Opret nyt indlæg</span>
          </button>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Søg i titler eller tags..."
              className={`w-full rounded-lg pl-8 pr-3 py-1.5 text-xs border ${
                isDark
                  ? 'bg-neutral-900 border-neutral-800 text-white placeholder-neutral-500'
                  : 'bg-neutral-50 border-neutral-300 text-neutral-900 placeholder-neutral-400'
              }`}
            />
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1.5 text-[11px] font-medium">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                filter === 'all'
                  ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-950'
                  : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-900'
              }`}
            >
              Alle ({posts.length})
            </button>
            <button
              onClick={() => setFilter('draft')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                filter === 'draft'
                  ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-950'
                  : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-900'
              }`}
            >
              Kladder ({posts.filter((p) => p.status === 'draft').length})
            </button>
            <button
              onClick={() => setFilter('published')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                filter === 'published'
                  ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-950'
                  : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-900'
              }`}
            >
              Udgivet ({posts.filter((p) => p.status === 'published').length})
            </button>
          </div>
        </div>

        {/* Post list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredPosts.map((p) => {
            const isSelected = p.id === currentPostId;
            return (
              <div
                key={p.id}
                onClick={() => {
                  onSelectPost(p);
                  onClose();
                }}
                className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all duration-150 ${
                  isSelected
                    ? isDark
                      ? 'bg-neutral-900 border-white text-white'
                      : 'bg-neutral-50 border-neutral-900 text-neutral-900 shadow-xs'
                    : isDark
                    ? 'bg-neutral-900/40 border-neutral-800/80 hover:border-neutral-700 text-neutral-300'
                    : 'bg-white border-neutral-200 hover:border-neutral-300 text-neutral-800'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold uppercase ${
                      p.status === 'published'
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/80'
                        : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    {p.status === 'published' ? 'Offentliggjort' : 'Kladde'}
                  </span>

                  <span className="text-[10px] text-neutral-400 font-mono">
                    {p.readTime}
                  </span>
                </div>

                <h4 className="text-xs font-semibold line-clamp-2 leading-snug">
                  {p.title}
                </h4>

                <div className="flex items-center justify-between text-[11px] text-neutral-500 mt-2.5 pt-2 border-t border-neutral-100 dark:border-neutral-800/60">
                  <span className="flex items-center gap-1 font-mono text-[10px]">
                    <Cpu className="w-3 h-3" />
                    {p.hardwareLabel}
                  </span>

                  {p.id !== currentPostId && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeletePost(p.id);
                      }}
                      className="text-neutral-400 hover:text-rose-500 transition-colors p-1"
                      title="Slet kladde"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Drawer footer */}
        <div className={`p-4 border-t text-[11px] text-neutral-500 flex justify-between items-center ${
          isDark ? 'border-neutral-800 bg-neutral-950' : 'border-neutral-200 bg-neutral-50'
        }`}>
          <span>SQLite Database: 28 records</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 cursor-pointer"
          >
            Luk
          </button>
        </div>
      </div>
    </div>
  );
};
