import React from 'react';
import { ArrowLeft, Plus, Check, Lock, FileText, Sliders } from 'lucide-react';
import { useSiteSettings } from '../../context/SiteSettingsContext';

interface AdminTopNavProps {
  onBackToBlog: () => void;
  lastSavedText: string;
  isSaving: boolean;
  onManualSave: () => void;
  onNewPost: () => void;
  onLockConsole?: () => void;
  activeTab: 'posts' | 'settings';
  onTabChange: (tab: 'posts' | 'settings') => void;
}

export const AdminTopNav: React.FC<AdminTopNavProps> = ({
  onBackToBlog,
  lastSavedText,
  isSaving,
  onManualSave,
  onNewPost,
  onLockConsole,
  activeTab,
  onTabChange,
}) => {
  const { settings } = useSiteSettings();
  const blogTitle = settings.blogName || 'local-ai.blog';

  return (
    <header className="w-full border-b border-[rgba(255,255,255,0.05)] bg-[#091614] px-4 sm:px-8 lg:px-10 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono">
      {/* Left: Back to blog link & brand */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        <button
          onClick={onBackToBlog}
          className="text-[#8c9e97] hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer group"
          title="Tilbage til forsiden"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span className="font-medium text-[#F1F5F4]">{blogTitle}</span>
        </button>

        <span className="text-[#2b3d37]">/</span>

        <span className="text-[#728984]">admin</span>
      </div>

      {/* Center: Primary Tab Switcher [Post Manager] [Websted Indstillinger] */}
      <div className="flex items-center bg-[#0c1d19] p-1 rounded-xl border border-white/5 self-start md:self-center">
        <button
          type="button"
          onClick={() => onTabChange('posts')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'posts'
              ? 'bg-[#14332c] text-[#F1F5F4] border border-[#1e4c41] shadow-sm font-medium'
              : 'text-[#728984] hover:text-[#F1F5F4]'
          }`}
          aria-pressed={activeTab === 'posts'}
        >
          <FileText className={`w-3.5 h-3.5 ${activeTab === 'posts' ? 'text-[#10B981]' : ''}`} />
          <span>Post Manager</span>
          {activeTab === 'posts' && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] shadow-[0_0_6px_#10B981]" />
          )}
        </button>

        <button
          type="button"
          onClick={() => onTabChange('settings')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-[#14332c] text-[#F1F5F4] border border-[#1e4c41] shadow-sm font-medium'
              : 'text-[#728984] hover:text-[#F1F5F4]'
          }`}
          aria-pressed={activeTab === 'settings'}
        >
          <Sliders className={`w-3.5 h-3.5 ${activeTab === 'settings' ? 'text-[#10B981]' : ''}`} />
          <span>Websted Indstillinger</span>
          {activeTab === 'settings' && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] shadow-[0_0_6px_#10B981]" />
          )}
        </button>
      </div>

      {/* Right: Quick actions: New post & Save button */}
      <div className="flex items-center gap-3 self-end md:self-center">
        <span className="hidden lg:inline-block text-[#556961] text-[11px]">
          {isSaving ? 'Synkroniserer...' : lastSavedText}
        </span>

        {activeTab === 'posts' && (
          <button
            onClick={onNewPost}
            className="text-[#8c9e97] hover:text-white transition-colors flex items-center gap-1 cursor-pointer py-1 px-2 rounded hover:bg-white/5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nyt indlæg</span>
          </button>
        )}

        <button
          onClick={onManualSave}
          disabled={isSaving}
          className="px-3 py-1.5 bg-[#14332c] hover:bg-[#1c473d] text-white rounded text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
        >
          <Check className="w-3 h-3 text-[#10B981]" />
          <span>{activeTab === 'settings' ? 'Gem Indstillinger' : 'Gem'}</span>
        </button>

        {onLockConsole && (
          <button
            onClick={onLockConsole}
            title="Lås konsol (skift til låseskærm)"
            className="p-1.5 text-[#728984] hover:text-[#10B981] transition-colors rounded hover:bg-white/5 cursor-pointer ml-1"
            aria-label="Lås konsol"
          >
            <Lock className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </header>
  );
};
