import React, { useState, useRef, useCallback } from 'react';
import {
  PanelRightClose,
  PanelRightOpen,
  Eye,
  Edit3,
  RefreshCw,
  FileText,
  AlertCircle,
  Sparkles,
  Calendar,
  ArrowLeft,
} from 'lucide-react';
import {
  formatToDateTimeLocal,
  isDateInFuture,
  formatArticleDateTime,
  getNowDateTimeLocalString,
} from '../utils/dateUtils';
import { VectorThumbnail } from '../components/VectorThumbnail';
import { ArticleMetadataLine } from '../components/ArticleMetadataLine';

/**
 * ============================================================================
 * VIGTIGT: Frontend Filtreringslogik for Tidsindstillet Publicering (Scheduling)
 * ============================================================================
 * For at forhindre, at fremtidige planlagte artikler vises for almindelige læsere,
 * filtreres artiklerne på klientsiden i ArticleGrid / ArticlesSection med:
 * 
 * const isArticleReleased = (post) => {
 *   if (!post.date) return true;
 *   return new Date(post.date) <= new Date();
 * };
 * 
 * const visiblePosts = posts.filter(
 *   (post) => post.status === 'published' && new Date(post.date) <= new Date()
 * );
 * ============================================================================
 */

const DEFAULT_POST = {
  id: 'ny-artikel',
  title: 'DeepSeek R1 på M4 Pro: 32B vs 14B Kvantisering',
  slug: 'deepseek-r1-m4-pro-32b-vs-14b',
  date: '2025-02-24T08:00',
  status: 'draft',
  category: 'mac',
  hardware: 'M4 Pro • 48GB',
  hardwareLabel: 'M4 Pro • 48GB',
  tags: ['Mac Setup', 'Benchmarks', 'Kvantisering'],
  markdown: `# Introduktion til Lokal Inferens\n\nHer starter selve artiklen skrevet i rå Markdown...`,
  coverImage: '',
  wordCount: 140,
  readTime: '2 min',
};

export const AdminConsole = ({
  post: controlledPost,
  onChange: onControlledChange,
  onSyncLocalDB,
  onBackToBlog,
  isSaving = false,
  lastSavedText = 'Gemt lokalt: Lige nu',
}) => {
  // Intern state hvis komponenten bruges standalone
  const [internalPost, setInternalPost] = useState(DEFAULT_POST);
  const currentPost = controlledPost || internalPost;

  const updatePost = useCallback(
    (updated) => {
      if (onControlledChange) {
        onControlledChange(updated);
      } else {
        setInternalPost(updated);
      }
    },
    [onControlledChange]
  );

  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Opgave 1: Editor tabs ('write' | 'preview' | 'braindump')
  const [editorMode, setEditorMode] = useState('write');
  const [brainDumpNotes, setBrainDumpNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState(null);

  const textareaRef = useRef(null);

  // Opgave 2: Tidsindstillet Publicering (Scheduling)
  // Hvis Publish er valgt, MEN dato er i fremtiden -> status er Scheduled
  const isScheduled = currentPost.status === 'published' && isDateInFuture(currentPost.date);

  const generateSlug = (text) => {
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

  const handleTitleChange = (newTitle) => {
    updatePost({
      ...currentPost,
      title: newTitle,
      slug: generateSlug(newTitle),
    });
  };

  const handleSlugChange = (newSlug) => {
    updatePost({ ...currentPost, slug: newSlug });
  };

  const handleMarkdownChange = (newMarkdown) => {
    const words = newMarkdown.trim().split(/\s+/).filter(Boolean).length;
    const readMinutes = Math.max(1, Math.ceil(words / 200));
    updatePost({
      ...currentPost,
      markdown: newMarkdown,
      wordCount: words,
      readTime: `${readMinutes} min`,
    });
  };

  /**
   * Opgave 1: Lokal AI Skriveassistent (Brain-dump mode)
   * 1. Sender prompt til Ollama default endpoint: http://localhost:11434/api/generate
   * 2. Prompt: "Du er teknisk skribent. Omsæt disse noter til et struktureret blogindlæg formateret i Markdown. Brug dansk sprog."
   * 3. Svaret indsættes i det primære "Skriv" (Markdown) felt
   * 4. UI skifter automatisk tilbage til "Skriv"-tabben
   * 5. "Tænker..." loading-state mens den genererer
   */
  const handleGenerateDraftFromNotes = async () => {
    if (!brainDumpNotes.trim() || isGenerating) return;

    setIsGenerating(true);
    setGenerationError(null);

    const promptText = `Du er teknisk skribent. Omsæt disse noter til et struktureret blogindlæg formateret i Markdown. Brug dansk sprog.\n\nNoter:\n${brainDumpNotes}`;

    try {
      let generatedMarkdown = '';

      // 1. Forsøg direkte kald til lokal Ollama instans
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 25000);

        const directRes = await fetch('http://localhost:11434/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'llama3.2', // Standard model i Ollama (eller mistral / qwen2.5-coder / deepseek-r1)
            prompt: promptText,
            stream: false,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (directRes.ok) {
          const directData = await directRes.json();
          if (directData && directData.response) {
            generatedMarkdown = directData.response;
          }
        }
      } catch (directErr) {
        console.warn('Direkte kald til Ollama fejlede (f.eks. pga. CORS i browser), prøver lokal proxy:', directErr);
      }

      // 2. Hvis direkte kald fejlede pga. browser CORS, anvend den lokale Node.js server-proxy
      if (!generatedMarkdown) {
        const proxyRes = await fetch('/api/ollama/proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: 'http://localhost:11434',
            endpoint: '/api/generate',
            payload: {
              model: 'llama3.2',
              prompt: promptText,
              stream: false,
            },
          }),
        });

        if (proxyRes.ok) {
          const proxyData = await proxyRes.json();
          if (proxyData && proxyData.response) {
            generatedMarkdown = proxyData.response;
          }
        } else {
          const errData = await proxyRes.json().catch(() => null);
          throw new Error(
            errData?.error ||
              'Kunne ikke forbinde til Ollama på http://localhost:11434. Sørg for at `ollama serve` kører på din Mac.'
          );
        }
      }

      if (!generatedMarkdown || !generatedMarkdown.trim()) {
        throw new Error('Modtog intet svar fra den lokale LLM.');
      }

      // Svaret indsættes i det primære "Skriv" (Markdown) felt
      handleMarkdownChange(generatedMarkdown);

      // UI skifter automatisk tilbage til "Skriv"-tabben
      setEditorMode('write');
    } catch (err) {
      console.error('[Brain-dump Lokal AI Fejl]:', err);
      setGenerationError(
        err?.message ||
          'Kunne ikke forbinde til Ollama på http://localhost:11434/api/generate. Kør `ollama serve` i en Mac-terminal.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const categories = [
    { id: 'mac', label: 'Mac' },
    { id: 'iphone', label: 'iOS' },
    { id: 'hybrid', label: 'Hybrid Setup' },
    { id: 'benchmarks', label: 'Benchmarks' },
  ];

  return (
    <div className="w-full min-h-screen bg-[#091614] text-[#F1F5F4] font-sans selection:bg-[#10B981]/30 selection:text-white">
      {/* Top Bar Navigation */}
      <header className="w-full px-6 sm:px-10 py-4 border-b border-[rgba(255,255,255,0.05)] bg-[#0c1d19]/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBackToBlog && (
            <button
              onClick={onBackToBlog}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#728984] hover:text-white transition-colors cursor-pointer"
              title="Tilbage til bloggen"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981]" />
            <h1 className="text-sm font-semibold tracking-tight text-white font-mono">
              local-ai.blog · Admin Console
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-[#6c8077]">
          <span>{lastSavedText}</span>
          <span className="text-[10px] bg-white/5 border border-white/5 px-2 py-0.5 rounded text-[#8c9e97]">
            Zero-Cloud
          </span>
        </div>
      </header>

      {/* Main Workspace Container */}
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* Left Side: Zen Markdown Typing Sheet */}
          <div className="flex-1 w-full bg-[#0c1d19] rounded-2xl p-6 sm:p-10 transition-all border border-[rgba(255,255,255,0.04)] relative shadow-[var(--shadow-card)]">
            
            {/* Opgave 1: Toolbar med "Skriv / Forhåndsvisning / 🧠 Brain-dump" */}
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-[rgba(255,255,255,0.05)] text-xs font-mono text-[#6c8077]">
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => setEditorMode('write')}
                  className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                    editorMode === 'write' ? 'text-white font-medium' : 'text-[#6c8077] hover:text-neutral-300'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Skriv</span>
                </button>
                <span className="text-[#2b3d37]">/</span>
                <button
                  type="button"
                  onClick={() => setEditorMode('preview')}
                  className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                    editorMode === 'preview' ? 'text-white font-medium' : 'text-[#6c8077] hover:text-neutral-300'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Forhåndsvisning</span>
                </button>
                <span className="text-[#2b3d37]">/</span>
                <button
                  type="button"
                  onClick={() => setEditorMode('braindump')}
                  className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                    editorMode === 'braindump'
                      ? 'text-[#10B981] font-semibold'
                      : 'text-[#6c8077] hover:text-neutral-300'
                  }`}
                >
                  <span>🧠 Brain-dump</span>
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

            {/* Mode 1: Skriv (Primær Markdown Editor) */}
            {editorMode === 'write' && (
              <div className="space-y-4">
                {/* Titel */}
                <div>
                  <input
                    type="text"
                    value={currentPost.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Indtast artiklens titel..."
                    className="w-full bg-transparent border-0 outline-none text-2xl sm:text-3xl lg:text-4xl font-semibold text-white tracking-tight placeholder-[#3f534c] focus:ring-0 px-0 leading-tight"
                  />
                </div>

                {/* Slug */}
                <div className="flex items-center gap-2 text-xs font-mono text-[#5c736a] pb-4 border-b border-[rgba(255,255,255,0.03)]">
                  <span className="text-[#3c4f46]">slug:</span>
                  <input
                    type="text"
                    value={currentPost.slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    placeholder="artikel-slug"
                    className="bg-transparent border-0 outline-none text-xs font-mono text-[#8c9e97] focus:text-white placeholder-[#3c4f46] focus:ring-0 p-0 flex-1"
                  />
                </div>

                {/* Markdown body */}
                <div>
                  <textarea
                    ref={textareaRef}
                    value={currentPost.markdown}
                    onChange={(e) => handleMarkdownChange(e.target.value)}
                    placeholder="Skriv din artikel i rå Markdown her..."
                    className="w-full h-[480px] sm:h-[560px] bg-transparent border-0 outline-none text-sm font-mono text-neutral-200 placeholder-[#3f534c] leading-relaxed resize-none focus:ring-0 px-0 pt-2 selection:bg-[#10B981]/30 selection:text-white"
                  />
                </div>
              </div>
            )}

            {/* Mode 2: Forhåndsvisning */}
            {editorMode === 'preview' && (
              <div className="min-h-[560px] space-y-6">
                <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden bg-[#091614] border border-white/5 relative flex items-center justify-center">
                  {currentPost.coverImage ? (
                    <img
                      src={currentPost.coverImage}
                      alt={currentPost.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center relative">
                      <VectorThumbnail
                        article={currentPost}
                        primaryTag={currentPost.tags?.[0]}
                        tags={currentPost.tags}
                      />
                      <div className="absolute bottom-3 right-3 text-[10px] font-mono text-[#728984] bg-[#0c1d19]/80 px-2 py-0.5 rounded border border-white/5">
                        Automatisk SVG Vector Generator
                      </div>
                    </div>
                  )}
                </div>

                <h1 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">
                  {currentPost.title || 'Uden titel'}
                </h1>
                <div className="pt-1">
                  <ArticleMetadataLine
                    date={currentPost.date || getNowDateTimeLocalString()}
                    readingTime={currentPost.readingTime || currentPost.readTime}
                    hardware={currentPost.hardware || currentPost.hardwareLabel}
                    updated={currentPost.updated}
                    lang="da"
                  />
                </div>
                <div className="prose prose-invert max-w-none text-sm font-sans text-neutral-300 leading-relaxed whitespace-pre-wrap pt-2">
                  {currentPost.markdown || 'Intet indhold endnu.'}
                </div>
              </div>
            )}

            {/* Mode 3: 🧠 Brain-dump (Lokal AI Skriveassistent) */}
            {editorMode === 'braindump' && (
              <div className="min-h-[560px] space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[rgba(255,255,255,0.04)]">
                  <div>
                    <h2 className="text-lg font-semibold text-white tracking-tight flex items-center gap-2">
                      <span>🧠 Brain-dump mode</span>
                    </h2>
                    <p className="text-xs text-[#728984] font-mono mt-0.5">
                      Skriv rå noter og stikord. En lokal LLM (f.eks. via Ollama) omskriver dem til et struktureret blogindlæg.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#10B981] bg-[#10B981]/10 px-2.5 py-1 rounded-full border border-[#10B981]/20 self-start sm:self-auto shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                    <span>Ollama: http://localhost:11434</span>
                  </div>
                </div>

                {/* Separat tekstområde til løse noter */}
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-[#6c8077] block">
                    Rå noter & tanker
                  </label>
                  <textarea
                    value={brainDumpNotes}
                    onChange={(e) => setBrainDumpNotes(e.target.value)}
                    disabled={isGenerating}
                    placeholder="Skriv dine rå noter her...&#10;&#10;F.eks.:&#10;• M4 Pro 48GB med 14 CPU / 20 GPU kerner&#10;• Kørte benchmark med MLX vs Ollama på DeepSeek R1 32B og 14B&#10;• 32B giver 18 tok/s ved Q4_K_M med 22GB RAM forbrug&#10;• Konklusion: Fantastisk balance mellem inferenshastighed og præcision"
                    className="w-full h-[360px] sm:h-[420px] bg-[#091614]/80 border border-[rgba(255,255,255,0.06)] rounded-xl p-4 text-sm font-mono text-neutral-200 placeholder-[#3f534c] leading-relaxed resize-none focus:outline-none focus:border-[#10B981]/60 focus:ring-1 focus:ring-[#10B981]/30 selection:bg-[#10B981]/30 selection:text-white transition-all disabled:opacity-50"
                  />
                </div>

                {/* Knap: ✨ Generer udkast (Lokal AI) */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
                  <button
                    type="button"
                    onClick={handleGenerateDraftFromNotes}
                    disabled={isGenerating || !brainDumpNotes.trim()}
                    className="py-2.5 px-5 bg-[#10B981] hover:bg-[#059669] text-[#091614] rounded-xl text-xs font-semibold font-mono transition-all flex items-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.25)] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed select-none"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-[#091614]" />
                        <span>Tænker...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-[#091614]" />
                        <span>✨ Generer udkast (Lokal AI)</span>
                      </>
                    )}
                  </button>

                  <div className="text-[11px] font-mono text-[#5c736a]">
                    {isGenerating ? (
                      <span className="text-[#10B981] animate-pulse">Lokal LLM genererer udkast i Markdown...</span>
                    ) : (
                      <span>Overføres automatisk til "Skriv" ved fuldførelse.</span>
                    )}
                  </div>
                </div>

                {/* Fejlbesked hvis Ollama ikke er tilgængelig */}
                {generationError && (
                  <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-semibold text-rose-200">{generationError}</p>
                      <p className="text-[11px] text-rose-300/80">
                        Tip: Kør <code className="bg-black/40 px-1 py-0.5 rounded text-rose-200">ollama serve</code> og hav <code className="bg-black/40 px-1 py-0.5 rounded text-rose-200">llama3.2</code> på din Mac.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Bottom status line */}
            <div className="pt-4 mt-6 border-t border-[rgba(255,255,255,0.04)] flex items-center justify-between text-[11px] font-mono text-[#5c736a]">
              <div>
                Ord: {currentPost.wordCount || 0} · Læsetid: {currentPost.readTime || '1 min'}
              </div>
              <div>{lastSavedText}</div>
            </div>
          </div>

          {/* Right Side: Control Blog Post Center Sidebar */}
          <aside
            className={`transition-all duration-300 flex flex-col gap-6 ${
              sidebarOpen ? 'w-full lg:w-72 xl:w-80' : 'w-full lg:w-12'
            }`}
          >
            {sidebarOpen ? (
              <div className="bg-[#0c1d19] rounded-2xl p-6 border border-[rgba(255,255,255,0.04)] space-y-6 text-xs font-mono shadow-[var(--shadow-card)]">
                
                {/* Header with collapse button */}
                <div className="flex items-center justify-between pb-3 border-b border-[rgba(255,255,255,0.05)]">
                  <span className="text-[#8c9e97] uppercase tracking-wider text-[11px] font-medium flex items-center gap-1.5">
                    <span>CONTROL BLOG POST CENTER</span>
                  </span>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="text-[#6c8077] hover:text-white transition-colors cursor-pointer"
                    title="Skjul sidebar"
                  >
                    <PanelRightClose className="w-4 h-4" />
                  </button>
                </div>

                {/* Opgave 2: DATO-inputfelt som type="datetime-local" med fuldt ISO-format */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="post-date-picker" className="text-[#6c8077] uppercase tracking-wider text-[10px] block font-medium">
                      Dato (Udgivelsesdato & Tid)
                    </label>
                    <span className={`text-[10px] font-mono ${isScheduled ? 'text-amber-400 font-medium' : 'text-[#10B981]'}`}>
                      {formatArticleDateTime(currentPost.date || getNowDateTimeLocalString(), 'da')}
                    </span>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      id="post-date-picker"
                      type="datetime-local"
                      value={formatToDateTimeLocal(currentPost.date)}
                      onChange={(e) => updatePost({ ...currentPost, date: e.target.value })}
                      className="w-full bg-[#091614] border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-2 text-xs font-mono text-[#F1F5F4] focus:outline-none focus:border-[#10B981] transition-colors [color-scheme:dark] cursor-pointer"
                    />
                    <Calendar className="w-3.5 h-3.5 text-[#6c8077] absolute right-3 pointer-events-none" />
                  </div>
                  {isScheduled && (
                    <p className="text-[10px] text-amber-400/90 font-mono leading-tight flex items-center gap-1.5 pt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                      <span>Planlagt til fremtidig frigivelse (Scheduled)</span>
                    </p>
                  )}
                </div>

                {/* Hardware Specs */}
                <div className="space-y-2">
                  <label htmlFor="post-hardware-input" className="text-[#6c8077] uppercase tracking-wider text-[10px] block font-medium">
                    Hardware (Specs)
                  </label>
                  <input
                    id="post-hardware-input"
                    type="text"
                    value={currentPost.hardware || currentPost.hardwareLabel || ''}
                    onChange={(e) =>
                      updatePost({
                        ...currentPost,
                        hardware: e.target.value,
                        hardwareLabel: e.target.value,
                      })
                    }
                    placeholder="f.eks. M4 Pro • 48GB"
                    className="w-full bg-[#091614] border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-2 text-xs font-mono text-[#F1F5F4] focus:outline-none focus:border-[#10B981] placeholder-[#3f534c] transition-colors"
                  />
                </div>

                {/* Kategori */}
                <div className="space-y-2 pt-2 border-t border-[rgba(255,255,255,0.05)]">
                  <label className="text-[#6c8077] uppercase tracking-wider text-[10px] block">
                    Kategori
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((cat) => {
                      const isActive = currentPost.category === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => updatePost({ ...currentPost, category: cat.id })}
                          className={`py-2 px-2.5 rounded-lg text-xs transition-colors cursor-pointer border text-center truncate ${
                            isActive
                              ? 'bg-[#14332c] text-white border-[#1e4c41]'
                              : 'bg-transparent text-[#7d9188] border-[rgba(255,255,255,0.05)] hover:text-white'
                          }`}
                        >
                          {cat.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Opgave 2: Udgivelsesstatus (Draft / Publish / Scheduled) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[#6c8077] uppercase tracking-wider text-[10px] block">
                      Udgivelsesstatus
                    </label>
                    {isScheduled && (
                      <span className="text-[10px] font-mono text-amber-400 bg-amber-950/40 border border-amber-500/20 px-1.5 py-0.5 rounded">
                        Planlagt
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => updatePost({ ...currentPost, status: 'draft' })}
                      className={`py-2 px-3 rounded-lg text-xs transition-colors cursor-pointer border flex items-center justify-center gap-1.5 ${
                        currentPost.status === 'draft'
                          ? 'bg-[#14332c] text-white border-[#1e4c41]'
                          : 'bg-transparent text-[#7d9188] border-[rgba(255,255,255,0.05)] hover:text-white'
                      }`}
                    >
                      <span>Draft</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => updatePost({ ...currentPost, status: 'published' })}
                      className={`py-2 px-3 rounded-lg text-xs transition-colors cursor-pointer border flex items-center justify-center gap-1.5 ${
                        currentPost.status === 'published'
                          ? isScheduled
                            ? 'bg-amber-950/40 text-amber-200 border-amber-500/30'
                            : 'bg-[#14332c] text-white border-[#1e4c41]'
                          : 'bg-transparent text-[#7d9188] border-[rgba(255,255,255,0.05)] hover:text-white'
                      }`}
                    >
                      {/* Opgave 2: Hvis Publish er valgt, MEN dato er i fremtiden -> Scheduled med gul prik */}
                      {currentPost.status === 'published' ? (
                        isScheduled ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b] animate-pulse" />
                            <span className="font-medium text-amber-300">Scheduled</span>
                          </>
                        ) : (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] shadow-[0_0_6px_#10B981]" />
                            <span>Publish</span>
                          </>
                        )
                      ) : (
                        <span>Publish</span>
                      )}
                    </button>
                  </div>

                  {isScheduled && (
                    <div className="p-2 rounded-lg bg-amber-950/20 border border-amber-500/20 text-amber-300 text-[10px] font-mono leading-relaxed flex items-start gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1 shrink-0" />
                      <span>
                        Tidsindstillet publicering: Artiklen frigives automatisk for læsere når dato og tidspunkt nås ({formatArticleDateTime(currentPost.date, 'da')}).
                      </span>
                    </div>
                  )}
                </div>

                {/* Synkroniser lokalt knap */}
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

                {/* Destination */}
                <div className="pt-3 border-t border-[rgba(255,255,255,0.05)] text-[11px] text-[#556961] space-y-1">
                  <div className="flex items-center gap-1.5 text-[#7d9188]">
                    <FileText className="w-3.5 h-3.5" />
                    <span className="truncate">/content/posts/{currentPost.slug}.md</span>
                  </div>
                  <p className="text-[10px] text-[#42544d] leading-normal">
                    Gemmer direkte i Markdown med YAML frontmatter (ISO datetime).
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
    </div>
  );
};

export default AdminConsole;
