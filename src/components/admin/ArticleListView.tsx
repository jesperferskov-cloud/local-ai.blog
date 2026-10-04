import React from 'react';
import { StoredPost } from '../../data/adminSeed';
import { Trash2 } from 'lucide-react';
import { formatArticleDate } from '../../utils/dateUtils';

interface ArticleListViewProps {
  posts: StoredPost[];
  currentPostId: string;
  onSelectPost: (post: StoredPost) => void;
  onDeletePost: (id: string) => void;
}

export const ArticleListView: React.FC<ArticleListViewProps> = ({
  posts,
  currentPostId,
  onSelectPost,
  onDeletePost,
}) => {
  const formatDate = (dateStr?: string) => {
    return formatArticleDate(dateStr, 'da') || dateStr || '';
  };

  return (
    <section className="w-full px-6 sm:px-10 py-10 border-t border-[rgba(255,255,255,0.05)]">
      {/* Section Header: Minimalist open-space editorial feel */}
      <div className="flex items-center justify-between pb-6">
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
          Artikler
        </h2>
        <span className="text-xs font-mono text-[#556961]">
          {posts.length} indlæg
        </span>
      </div>

      {/* Minimalist text list of posts without heavy table lines */}
      <div className="space-y-1">
        {posts.map((post) => {
          const isSelected = post.id === currentPostId;
          const isPublished = post.status === 'published';

          return (
            <div
              key={post.id}
              onClick={() => onSelectPost(post)}
              className={`w-full py-3.5 px-4 rounded-xl flex items-center justify-between text-left cursor-pointer transition-colors group ${
                isSelected
                  ? 'bg-white/[0.04] text-white'
                  : 'text-[#8c9e97] hover:bg-white/[0.02] hover:text-neutral-200'
              }`}
            >
              {/* Left: Status indicator dot & Title */}
              <div className="flex items-center gap-3.5 min-w-0 pr-4">
                {/* Small status indicator */}
                <span
                  className={`w-2 h-2 rounded-full shrink-0 transition-all ${
                    isPublished
                      ? 'bg-[#10B981] shadow-[0_0_8px_#10B981]'
                      : 'bg-[#ffb95f]/70'
                  }`}
                  title={isPublished ? 'Udgivet' : 'Kladde'}
                />

                {/* Optional mini cover thumbnail preview */}
                {post.coverImage ? (
                  <div className="w-7 h-4 rounded overflow-hidden shrink-0 border border-white/10 bg-[#091614] hidden sm:block">
                    <img src={post.coverImage} alt="" className="w-full h-full object-cover" />
                  </div>
                ) : null}

                {/* Title */}
                <span className={`text-xs sm:text-sm font-medium truncate ${
                  isSelected ? 'text-white' : 'text-neutral-200 group-hover:text-white'
                }`}>
                  {post.title}
                </span>
              </div>

              {/* Right: Date & quiet action */}
              <div className="flex items-center gap-4 shrink-0">
                {/* Date */}
                <span className="text-xs font-mono text-[#556961]">
                  {formatDate(post.date || post.updatedAt)}
                </span>

                {/* Hover Delete Action */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Er du sikker på, at du vil slette "${post.title}"?`)) {
                      onDeletePost(post.id);
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-[#556961] hover:text-rose-400 cursor-pointer rounded"
                  title="Slet indlæg"
                  aria-label="Slet indlæg"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
