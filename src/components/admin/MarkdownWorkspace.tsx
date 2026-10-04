import React, { useState, useRef, useCallback } from 'react';
import { StoredPost } from '../../data/adminSeed';
import { updateMarkdownCoverImage } from '../../services/articleMarkdownService';
import { VectorThumbnail } from '../VectorThumbnail';
import { ArticleMetadataLine } from '../ArticleMetadataLine';
import { getTodayDateString, formatArticleDate } from '../../utils/dateUtils';
import {
  PanelRightClose,
  PanelRightOpen,
  Eye,
  Edit3,
  RefreshCw,
  Check,
  HardDrive,
  FileText,
  Image as ImageIcon,
  UploadCloud,
  Trash2,
  Copy,
  AlertCircle,
  Sparkles,
  Calendar,
} from 'lucide-react';

interface MarkdownWorkspaceProps {
  post: StoredPost;
  onChange: (updated: StoredPost) => void;
  onSyncLocalDB: () => void;
  isSaving: boolean;
  lastSavedText: string;
  notifySubscribers?: boolean;
  onNotifySubscribersChange?: (val: boolean) => void;
}

export const MarkdownWorkspace: React.FC<MarkdownWorkspaceProps> = ({
  post,
  onChange,
  onSyncLocalDB,
  isSaving,
  lastSavedText,
  notifySubscribers = false,
  onNotifySubscribersChange,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [previewMode, setPreviewMode] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cover image upload states
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [copiedPath, setCopiedPath] = useState(false);

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[æ]/g, 'ae')
      .replace(/[ø]/g, 'oe')
      .replace(/[å]/g, 'aa')
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const handleTitleChange = (newTitle: string) => {
    const updated: StoredPost = {
      ...post,
      title: newTitle,
      slug: generateSlug(newTitle),
    };
    onChange(updated);
  };

  const handleSlugChange = (newSlug: string) => {
    onChange({ ...post, slug: newSlug });
  };

  const handleMarkdownChange = (newMarkdown: string) => {
    const words = newMarkdown.trim().split(/\s+/).filter(Boolean).length;
    const readMinutes = Math.max(1, Math.ceil(words / 200));
    onChange({
      ...post,
      markdown: newMarkdown,
      wordCount: words,
      readTime: `${readMinutes} min`,
    });
  };

  // Process dropped or selected image file
  const handleImageFile = useCallback(
    async (file: File) => {
      // Validate file extension (.png, .jpg, .jpeg)
      const fileNameLower = file.name.toLowerCase();
      const isValidExt =
        fileNameLower.endsWith('.png') ||
        fileNameLower.endsWith('.jpg') ||
        fileNameLower.endsWith('.jpeg');

      if (!isValidExt) {
        setUploadError('Understøtter kun .png eller .jpg filer.');
        setTimeout(() => setUploadError(null), 4000);
        return;
      }

      setIsUploading(true);
      setUploadError(null);

      try {
        // Read file as base64 DataURL
        const reader = new FileReader();
        const dataUrl = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error('Kunne ikke læse filen fra disken.'));
          reader.readAsDataURL(file);
        });

        // Post to backend to save directly to /public/images/posts/[post-slug]-[filename]
        const currentSlug = post.slug || generateSlug(post.title) || 'artikel';
        const res = await fetch('/api/upload/cover', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slug: currentSlug,
            filename: file.name,
            dataUrl,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Fejl under gemning af billede');
        }

        const generatedCoverPath = data.coverImage; // e.g. "/images/posts/post-slug-screenshot.png"

        // Automatically write generated path directly into Markdown frontmatter header
        const updatedMarkdown = updateMarkdownCoverImage(post.markdown, generatedCoverPath);

        const updatedPost: StoredPost = {
          ...post,
          coverImage: generatedCoverPath,
          markdown: updatedMarkdown,
        };

        // Notify parent state
        onChange(updatedPost);

        // Immediate background sync to physical /content/posts/[slug].md
        await fetch('/api/posts/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedPost),
        }).catch((err) => console.warn('[Auto-sync coverImage to disk]:', err));

        onSyncLocalDB();
      } catch (err: any) {
        console.error('Billedupload fejl:', err);
        setUploadError(err.message || 'Kunne ikke gemme billedet.');
        setTimeout(() => setUploadError(null), 4500);
      } finally {
        setIsUploading(false);
      }
    },
    [post, onChange, onSyncLocalDB]
  );

  // Drag and drop event handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleImageFile(file);
    }
  };

  // Remove cover image action ("Fjern billede")
  const handleRemoveCover = async () => {
    const previousPath = post.coverImage;

    // Remove coverImage from Markdown frontmatter header
    const updatedMarkdown = updateMarkdownCoverImage(post.markdown, null);

    const updatedPost: StoredPost = {
      ...post,
      coverImage: '',
      markdown: updatedMarkdown,
    };

    onChange(updatedPost);

    // Sync to disk: reverts the post to using the automatic SVG Vector Generator
    await fetch('/api/posts/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedPost),
    }).catch((err) => console.warn('[Auto-sync remove coverImage]:', err));

    onSyncLocalDB();

    // Optionally cleanup disk file
    if (previousPath) {
      fetch('/api/upload/cover', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coverImage: previousPath }),
      }).catch(() => {});
    }
  };

  const copyCoverPath = () => {
    if (post.coverImage) {
      navigator.clipboard.writeText(post.coverImage);
      setCopiedPath(true);
      setTimeout(() => setCopiedPath(false), 2000);
    }
  };

  const categories = [
    { id: 'mac', label: 'Mac' },
    { id: 'iphone', label: 'iOS' },
    { id: 'hybrid', label: 'Hybrid Setup' },
    { id: 'benchmarks', label: 'Benchmarks' },
  ] as const;

  return (
    <div className="w-full px-6 sm:px-10 py-6 sm:py-8">
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* Left Side: Clean, borderless typing sheet on dark-slate green background */}
        <div className="flex-1 w-full bg-[#0c1d19] rounded-2xl p-6 sm:p-10 transition-all border border-[rgba(255,255,255,0.04)] relative">
          
          {/* Top Sheet Toolbar: Mode Toggle (Edit / Preview) & Sidebar toggle affordance */}
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-[rgba(255,255,255,0.05)] text-xs font-mono text-[#6c8077]">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPreviewMode(false)}
                className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                  !previewMode ? 'text-white font-medium' : 'text-[#6c8077] hover:text-neutral-300'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Skriv</span>
              </button>
              <span className="text-[#2b3d37]">/</span>
              <button
                onClick={() => setPreviewMode(true)}
                className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                  previewMode ? 'text-white font-medium' : 'text-[#6c8077] hover:text-neutral-300'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Forhåndsvisning</span>
              </button>
            </div>

            <button
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="lg:hidden text-[#6c8077] hover:text-white flex items-center gap-1 cursor-pointer"
              title="Indstillinger"
            >
              {sidebarOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
              <span>Indstillinger</span>
            </button>
          </div>

          {!previewMode ? (
            <div className="space-y-4">
              {/* Input for "Titel": NO borders, pristine typography */}
              <div>
                <input
                  type="text"
                  value={post.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Indtast artikelns titel..."
                  className="w-full bg-transparent border-0 outline-none text-2xl sm:text-3xl lg:text-4xl font-semibold text-white tracking-tight placeholder-[#3f534c] focus:ring-0 px-0 leading-tight"
                />
              </div>

              {/* Input for "Slug": NO borders */}
              <div className="flex items-center gap-2 text-xs font-mono text-[#5c736a] pb-4 border-b border-[rgba(255,255,255,0.03)]">
                <span className="text-[#3c4f46]">slug:</span>
                <input
                  type="text"
                  value={post.slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="artikel-slug"
                  className="bg-transparent border-0 outline-none text-xs font-mono text-[#8c9e97] focus:text-white placeholder-[#3c4f46] focus:ring-0 p-0 flex-1"
                />
              </div>

              {/* Input for Markdown Body: NO borders */}
              <div>
                <textarea
                  ref={textareaRef}
                  value={post.markdown}
                  onChange={(e) => handleMarkdownChange(e.target.value)}
                  placeholder="Skriv din artikel i Markdown her..."
                  className="w-full h-[480px] sm:h-[560px] bg-transparent border-0 outline-none text-sm font-mono text-neutral-200 placeholder-[#3f534c] leading-relaxed resize-none focus:ring-0 px-0 pt-2 selection:bg-[#10B981]/30 selection:text-white"
                />
              </div>
            </div>
          ) : (
            <div className="min-h-[560px] space-y-6">
              {/* 16:9 Cover preview or SVG Vector Generator fallback banner */}
              <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden bg-[#091614] border border-white/5 relative flex items-center justify-center">
                {post.coverImage ? (
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center relative">
                    <VectorThumbnail
                      article={post as any}
                      primaryTag={post.tags?.[0]}
                      tags={post.tags}
                    />
                    <div className="absolute bottom-3 right-3 text-[10px] font-mono text-[#728984] bg-[#0c1d19]/80 px-2 py-0.5 rounded border border-white/5">
                      Automatisk SVG Vector Generator
                    </div>
                  </div>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">
                {post.title || 'Uden titel'}
              </h1>
              <div className="pt-1">
                <ArticleMetadataLine
                  date={post.date || getTodayDateString()}
                  readingTime={post.readingTime || post.readTime}
                  hardware={post.hardware || post.hardwareLabel}
                  updated={post.updated}
                  lang="da"
                />
              </div>
              <div className="prose prose-invert max-w-none text-sm font-sans text-neutral-300 leading-relaxed whitespace-pre-wrap pt-2">
                {post.markdown || 'Intet indhold endnu.'}
              </div>
            </div>
          )}

          {/* Bottom sheet status indicator */}
          <div className="pt-4 mt-6 border-t border-[rgba(255,255,255,0.04)] flex items-center justify-between text-[11px] font-mono text-[#5c736a]">
            <div>
              Ord: {post.wordCount || 0} · Læsetid: {post.readTime || '1 min'}
            </div>
            <div>
              {lastSavedText}
            </div>
          </div>
        </div>

        {/* Right Side: Collapsible settings sidebar containing Cover Image, Kategori, Udgivelsesstatus, and Synkroniser lokalt */}
        <aside
          className={`transition-all duration-300 flex flex-col gap-6 ${
            sidebarOpen ? 'w-full lg:w-72 xl:w-80' : 'w-full lg:w-12'
          }`}
        >
          {sidebarOpen ? (
            <div className="bg-[#0c1d19] rounded-2xl p-6 border border-[rgba(255,255,255,0.04)] space-y-6 text-xs font-mono">
              
              {/* Header with collapse button */}
              <div className="flex items-center justify-between pb-3 border-b border-[rgba(255,255,255,0.05)]">
                <span className="text-[#8c9e97] uppercase tracking-wider text-[11px] font-medium flex items-center gap-1.5">
                  <span>Control Blog Post Center</span>
                </span>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="text-[#6c8077] hover:text-white transition-colors cursor-pointer"
                  title="Skjul sidebar"
                >
                  <PanelRightClose className="w-4 h-4" />
                </button>
              </div>

              {/* 1. Dato (Publish Date) Calendar Date-Picker */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="post-date-picker" className="text-[#6c8077] uppercase tracking-wider text-[10px] block font-medium">
                    Dato (Udgivelsesdato)
                  </label>
                  <span className="text-[10px] font-mono text-[#10B981]">
                    {formatArticleDate(post.date || getTodayDateString(), 'da')}
                  </span>
                </div>
                <div className="relative flex items-center">
                  <input
                    id="post-date-picker"
                    type="date"
                    value={post.date || getTodayDateString()}
                    onChange={(e) => onChange({ ...post, date: e.target.value })}
                    className="w-full bg-[#091614] border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-2 text-xs font-mono text-[#F1F5F4] focus:outline-none focus:border-[#10B981] transition-colors [color-scheme:dark] cursor-pointer"
                  />
                  <Calendar className="w-3.5 h-3.5 text-[#6c8077] absolute right-3 pointer-events-none" />
                </div>
              </div>

              {/* 2. Hardware Specs */}
              <div className="space-y-2">
                <label htmlFor="post-hardware-input" className="text-[#6c8077] uppercase tracking-wider text-[10px] block font-medium">
                  Hardware (Specs)
                </label>
                <input
                  id="post-hardware-input"
                  type="text"
                  value={post.hardware || post.hardwareLabel || ''}
                  onChange={(e) =>
                    onChange({
                      ...post,
                      hardware: e.target.value,
                      hardwareLabel: e.target.value,
                    })
                  }
                  placeholder="f.eks. M4 Pro • 48GB"
                  className="w-full bg-[#091614] border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-2 text-xs font-mono text-[#F1F5F4] focus:outline-none focus:border-[#10B981] placeholder-[#3f534c] transition-colors"
                />
              </div>

              {/* 3. Omslagsbillede / Cover Image (Drag-and-Drop + 16:9 Thumbnail Preview) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-[#6c8077] uppercase tracking-wider text-[10px] block">
                    Omslagsbillede / Cover Image
                  </label>
                  {post.coverImage && (
                    <span className="text-[10px] font-mono text-[#10B981] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                      16:9
                    </span>
                  )}
                </div>

                {/* Hidden native file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleImageFile(e.target.files[0]);
                      e.target.value = '';
                    }
                  }}
                />

                {post.coverImage ? (
                  /* 16:9 Thumbnail Preview with "Fjern billede" option */
                  <div className="space-y-2">
                    <div className="aspect-[16/9] w-full rounded-xl overflow-hidden bg-[#091614] border border-[rgba(255,255,255,0.08)] relative group shadow-sm">
                      <img
                        src={post.coverImage}
                        alt="Cover forhåndsvisning"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {/* Subtle gradient overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2 justify-between">
                        <span className="text-[10px] font-mono text-neutral-300 truncate max-w-[170px]">
                          {post.coverImage.split('/').pop()}
                        </span>
                      </div>
                    </div>

                    {/* Relative path display with copy affordance */}
                    <div className="flex items-center gap-1.5 bg-[#091614] border border-[rgba(255,255,255,0.06)] rounded-lg px-2.5 py-1.5 text-[10px] text-[#7d9188]">
                      <span className="truncate flex-1 font-mono text-[#8c9e97]" title={post.coverImage}>
                        {post.coverImage}
                      </span>
                      <button
                        type="button"
                        onClick={copyCoverPath}
                        className="text-[#6c8077] hover:text-white transition-colors cursor-pointer shrink-0"
                        title="Kopier relativ sti"
                      >
                        {copiedPath ? (
                          <Check className="w-3 h-3 text-[#10B981]" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>

                    {/* Action buttons: "Skift billede" & "Fjern billede" */}
                    <div className="flex items-center gap-2 pt-0.5">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="flex-1 py-1.5 px-2 bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white rounded-lg text-[11px] font-mono transition-colors text-center border border-white/5 cursor-pointer disabled:opacity-50"
                      >
                        Skift billede
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveCover}
                        disabled={isUploading}
                        className="py-1.5 px-2.5 bg-rose-950/30 hover:bg-rose-900/40 text-rose-300 hover:text-rose-200 rounded-lg text-[11px] font-mono transition-colors border border-rose-500/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        title="Fjern billede og gendan automatisk SVG Vector Generator"
                      >
                        <Trash2 className="w-3 h-3 text-rose-400" />
                        <span>Fjern billede</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Clean, dashed drag-and-drop upload area */
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-4 sm:p-5 flex flex-col items-center justify-center text-center transition-all cursor-pointer select-none ${
                      isDragging
                        ? 'border-[#10B981] bg-[#10B981]/10 text-white scale-[1.01]'
                        : 'border-[rgba(255,255,255,0.08)] bg-[#091614]/60 hover:border-[#10B981]/50 hover:bg-[#10B981]/5 text-[#728984]'
                    }`}
                  >
                    {isUploading ? (
                      <div className="py-2 flex flex-col items-center gap-2">
                        <RefreshCw className="w-5 h-5 text-[#10B981] animate-spin" />
                        <span className="text-[11px] text-neutral-300 font-mono">
                          Gemmer lokalt til disk...
                        </span>
                      </div>
                    ) : (
                      <>
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center mb-2 text-[#8c9e97] group-hover:text-white">
                          <UploadCloud className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-medium text-[#F1F5F4] leading-snug">
                          Træk & slip billede her
                        </span>
                        <span className="text-[10px] text-[#728984] mt-0.5">
                          .png eller .jpg fra din Mac
                        </span>
                        <span className="mt-2.5 px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 text-[10px] text-[#8c9e97] hover:text-white border border-white/5 transition-colors">
                          Vælg fra computer
                        </span>
                      </>
                    )}
                  </div>
                )}

                {/* Subdued notice about automatic fallback */}
                {!post.coverImage && (
                  <p className="text-[10px] text-[#4d635a] leading-normal pt-1">
                    Uden billede anvendes den automatiske SVG Vector Generator.
                  </p>
                )}

                {/* Upload error display */}
                {uploadError && (
                  <div className="p-2 rounded-lg bg-rose-950/40 border border-rose-500/20 text-rose-300 text-[10px] flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                    <span>{uploadError}</span>
                  </div>
                )}
              </div>

              {/* 2. Kategori */}
              <div className="space-y-2 pt-2 border-t border-[rgba(255,255,255,0.05)]">
                <label className="text-[#6c8077] uppercase tracking-wider text-[10px] block">
                  Kategori
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((cat) => {
                    const isActive = post.category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => onChange({ ...post, category: cat.id })}
                        className={`py-2 px-2.5 rounded-lg text-xs transition-colors cursor-pointer border text-center truncate ${
                          isActive
                            ? 'bg-[#14332c] text-white border-[#1e4c41]'
                            : 'bg-transparent text-[#7d9188] border-[rgba(255,255,255,0.05)] hover:text-white hover:border-[rgba(255,255,255,0.1)]'
                        }`}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Udgivelsesstatus (Draft/Publish) */}
              <div className="space-y-2">
                <label className="text-[#6c8077] uppercase tracking-wider text-[10px] block">
                  Udgivelsesstatus
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onChange({ ...post, status: 'draft' })}
                    className={`py-2 px-3 rounded-lg text-xs transition-colors cursor-pointer border flex items-center justify-center gap-1.5 ${
                      post.status === 'draft'
                        ? 'bg-[#14332c] text-white border-[#1e4c41]'
                        : 'bg-transparent text-[#7d9188] border-[rgba(255,255,255,0.05)] hover:text-white'
                    }`}
                  >
                    <span>Draft</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange({ ...post, status: 'published' })}
                    className={`py-2 px-3 rounded-lg text-xs transition-colors cursor-pointer border flex items-center justify-center gap-1.5 ${
                      post.status === 'published'
                        ? 'bg-[#14332c] text-white border-[#1e4c41]'
                        : 'bg-transparent text-[#7d9188] border-[rgba(255,255,255,0.05)] hover:text-white'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] shadow-[0_0_6px_#10B981]" />
                    <span>Publish</span>
                  </button>
                </div>

                {/* Send notifikation til abonnenter toggle / checkbox */}
                <div className="pt-2">
                  <label className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#091614] border border-[rgba(255,255,255,0.06)] hover:border-[#10B981]/40 transition-colors cursor-pointer select-none group">
                    <input
                      type="checkbox"
                      checked={Boolean(notifySubscribers)}
                      onChange={(e) => onNotifySubscribersChange?.(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded border-[#1e4c41] bg-[#0c1d19] text-[#10B981] focus:ring-0 cursor-pointer accent-[#10B981]"
                    />
                    <div className="flex flex-col">
                      <span className="text-xs text-[#F1F5F4] font-medium leading-tight group-hover:text-white">
                        Send notifikation til abonnenter
                      </span>
                      <span className="text-[10px] text-[#6c8077] leading-tight mt-1 font-mono">
                        Udsendes automatisk når status er Publish og du klikker Gem
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* 4. Button "Synkroniser lokalt" */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onSyncLocalDB}
                  disabled={isSaving}
                  className="w-full py-2.5 px-4 bg-white hover:bg-neutral-200 text-[#091614] rounded-lg text-xs font-semibold font-mono transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Synkroniserer...</span>
                    </>
                  ) : (
                    <>
                      <HardDrive className="w-3.5 h-3.5" />
                      <span>Synkroniser lokalt</span>
                    </>
                  )}
                </button>
              </div>

              {/* Subdued File Destination Note */}
              <div className="pt-3 border-t border-[rgba(255,255,255,0.05)] text-[11px] text-[#556961] space-y-1">
                <div className="flex items-center gap-1.5 text-[#7d9188]">
                  <FileText className="w-3.5 h-3.5" />
                  <span className="truncate">/content/posts/{post.slug}.md</span>
                </div>
                <p className="text-[10px] text-[#42544d] leading-normal">
                  Gemmer direkte som ren Markdown-fil på din lokale disk.
                </p>
              </div>

            </div>
          ) : (
            <div className="hidden lg:flex flex-col items-center py-4 bg-[#0c1d19] rounded-2xl border border-[rgba(255,255,255,0.04)]">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 text-[#7d9188] hover:text-white transition-colors cursor-pointer"
                title="Åbn indstillinger"
              >
                <PanelRightOpen className="w-4 h-4" />
              </button>
            </div>
          )}
        </aside>

      </div>
    </div>
  );
};
