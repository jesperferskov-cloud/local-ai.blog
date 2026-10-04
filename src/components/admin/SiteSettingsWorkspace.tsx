import React, { useState, useEffect } from 'react';
import { useSiteSettings, DEFAULT_SITE_SETTINGS } from '../../context/SiteSettingsContext';
import {
  Save,
  Check,
  RefreshCw,
  RotateCcw,
  Globe,
  Sliders,
  Sparkles,
  FileCode,
  HardDrive,
  Eye,
  Type,
  Layers,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { AiDisclaimer } from '../AiDisclaimer';

interface SiteSettingsWorkspaceProps {
  onNotify?: (msg: string) => void;
}

export const SiteSettingsWorkspace: React.FC<SiteSettingsWorkspaceProps> = ({ onNotify }) => {
  const {
    settings,
    updateSettings,
    saveSettings,
    resetToDefaults,
    isSaving,
    lastSavedFormatted,
  } = useSiteSettings();

  // Local draft state for pristine input typing
  const [formData, setFormData] = useState({
    blogName: settings.blogName || 'local-ai.blog',
    heroTitle: settings.heroTitle || '',
    heroSubtitle: settings.heroSubtitle || '',
    disclaimerText: settings.disclaimerText || '',
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [activeLangTab, setActiveLangTab] = useState<'da' | 'en'>('da');
  const [previewTab, setPreviewTab] = useState<'desktop' | 'mobile'>('desktop');

  // Keep form data in sync if settings update externally
  useEffect(() => {
    setFormData({
      blogName: settings.blogName || 'local-ai.blog',
      heroTitle: settings.heroTitle || '',
      heroSubtitle: settings.heroSubtitle || '',
      disclaimerText: settings.disclaimerText || '',
    });
    setHasUnsavedChanges(false);
  }, [settings]);

  // Handle immediate field changes and update global context for instant reactive feedback
  const handleFieldChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      return updated;
    });
    setHasUnsavedChanges(true);

    // Update global state immediately for zero-latency live rendering
    updateSettings({ [field]: value });
  };

  const handleSave = async () => {
    const res = await saveSettings({
      ...settings,
      blogName: formData.blogName.trim() || 'local-ai.blog',
      heroTitle: formData.heroTitle.trim(),
      heroSubtitle: formData.heroSubtitle.trim(),
      disclaimerText: formData.disclaimerText.trim(),
    });

    setHasUnsavedChanges(false);

    if (onNotify) {
      onNotify(res.message);
    }
  };

  const handleReset = async () => {
    if (window.confirm('Er du sikker på, at du vil nulstille alle indstillinger til standardværdierne?')) {
      await resetToDefaults();
      setFormData({
        blogName: DEFAULT_SITE_SETTINGS.blogName,
        heroTitle: DEFAULT_SITE_SETTINGS.heroTitle,
        heroSubtitle: DEFAULT_SITE_SETTINGS.heroSubtitle,
        disclaimerText: DEFAULT_SITE_SETTINGS.disclaimerText,
      });
      setHasUnsavedChanges(false);
      if (onNotify) {
        onNotify('Indstillinger nulstillet til standard');
      }
    }
  };

  // Keyboard shortcut listener: Cmd+S / Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <div className="w-full px-4 sm:px-8 lg:px-10 py-6 sm:py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[rgba(255,255,255,0.05)]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-[#14332c] text-[#10B981] border border-[#1e4c41]">
              <Sliders className="w-4 h-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
              Websted Indstillinger
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-[#728984] border border-white/10">
              Global Site Settings
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#728984] font-mono mt-1.5">
            Styr global typografi, hero-overskrifter og AI-entusiast deklaration i realtid med direkte synkronisering til disk.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 self-start sm:self-center">
          <button
            type="button"
            onClick={handleReset}
            disabled={isSaving}
            className="px-3 py-2 text-[#728984] hover:text-white rounded-xl text-xs font-mono transition-colors border border-white/5 hover:border-white/15 hover:bg-white/5 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Gendan standardtekster"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Nulstil</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs font-mono font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-lg active:scale-95 disabled:opacity-60 ${
              hasUnsavedChanges
                ? 'bg-[#10B981] hover:bg-emerald-400 text-[#091614] shadow-[0_0_20px_rgba(16,185,129,0.35)]'
                : 'bg-white hover:bg-neutral-200 text-[#091614]'
            }`}
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#091614]" />
                <span>Gemmer...</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5 text-[#091614]" />
                <span>Gem Indstillinger</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Main Two-Column Layout: Left = Configuration Inputs, Right = Live Instant Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (Inputs Sheet): 7 cols */}
        <div className="lg:col-span-7 bg-[#0c1d19] rounded-2xl p-6 sm:p-8 lg:p-10 border border-[rgba(255,255,255,0.04)] shadow-xl space-y-8">
          
          <div className="flex items-center justify-between pb-4 border-b border-[rgba(255,255,255,0.04)] text-xs font-mono text-[#6c8077]">
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4 text-[#10B981]" />
              <span className="text-white font-medium uppercase tracking-wider text-[11px]">
                Typografi & Branding
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              <span>Lokal disk integration</span>
            </div>
          </div>

          {/* FIELD 1: Blog Name / Title */}
          <div className="space-y-2 group">
            <div className="flex items-center justify-between text-xs font-mono">
              <label htmlFor="field-blog-name" className="text-[#728984] group-focus-within:text-[#10B981] transition-colors uppercase tracking-wider text-[11px] font-medium flex items-center gap-2">
                <span>Blog Navn / Titel</span>
                <span className="text-[10px] text-[#465b53] lowercase font-normal">(blog title)</span>
              </label>
              <span className="text-[10px] text-[#556961]">Standard: local-ai.blog</span>
            </div>

            <div className="pt-1 pb-3 border-b border-[rgba(255,255,255,0.04)] focus-within:border-[#10B981]/50 transition-colors">
              <input
                id="field-blog-name"
                type="text"
                value={formData.blogName}
                onChange={(e) => handleFieldChange('blogName', e.target.value)}
                placeholder="local-ai.blog"
                className="w-full bg-transparent border-0 outline-none text-xl sm:text-2xl font-mono text-white tracking-tight placeholder-[#3f534c] focus:ring-0 px-0 selection:bg-[#10B981]/30 selection:text-white"
              />
            </div>
            <p className="text-[11px] text-[#556961] font-mono">
              Anvendes som primært brand-logo i øverste venstre hjørne, i footer-ophavsretten og i browserens faneblad.
            </p>
          </div>

          {/* FIELD 2: Hero Main Title */}
          <div className="space-y-2 group">
            <div className="flex items-center justify-between text-xs font-mono">
              <label htmlFor="field-hero-title" className="text-[#728984] group-focus-within:text-[#10B981] transition-colors uppercase tracking-wider text-[11px] font-medium flex items-center gap-2">
                <span>Hero Hovedoverskrift</span>
                <span className="text-[10px] text-[#465b53] lowercase font-normal">(hero main title)</span>
              </label>
              <span className="text-[10px] text-[#556961]">
                {formData.heroTitle.length} tegn
              </span>
            </div>

            <div className="pt-1 pb-3 border-b border-[rgba(255,255,255,0.04)] focus-within:border-[#10B981]/50 transition-colors">
              <input
                id="field-hero-title"
                type="text"
                value={formData.heroTitle}
                onChange={(e) => handleFieldChange('heroTitle', e.target.value)}
                placeholder="Mine Erfaringer med Lokal AI på Apple Silicon"
                className="w-full bg-transparent border-0 outline-none text-2xl sm:text-3xl font-semibold text-white tracking-tight placeholder-[#3f534c] focus:ring-0 px-0 leading-tight selection:bg-[#10B981]/30 selection:text-white"
              />
            </div>
            <p className="text-[11px] text-[#556961] font-mono">
              Massiv redaktionel overskrift i toppen af bloggen (skalerer til 4xl-6xl på desktop, varm off-white #F1F5F4).
            </p>
          </div>

          {/* FIELD 3: Hero Subtitle */}
          <div className="space-y-2 group">
            <div className="flex items-center justify-between text-xs font-mono">
              <label htmlFor="field-hero-subtitle" className="text-[#728984] group-focus-within:text-[#10B981] transition-colors uppercase tracking-wider text-[11px] font-medium flex items-center gap-2">
                <span>Hero Underoverskrift</span>
                <span className="text-[10px] text-[#465b53] lowercase font-normal">(hero subtitle / deck)</span>
              </label>
              <span className="text-[10px] text-[#556961]">
                {formData.heroSubtitle.length} tegn (~70-80 pr. linje)
              </span>
            </div>

            <div className="pt-1 pb-3 border-b border-[rgba(255,255,255,0.04)] focus-within:border-[#10B981]/50 transition-colors">
              <textarea
                id="field-hero-subtitle"
                rows={3}
                value={formData.heroSubtitle}
                onChange={(e) => handleFieldChange('heroSubtitle', e.target.value)}
                placeholder="Personlige eksperimenter, prompts og ufiltrerede tests af åbne modeller direkte på hverdagens hardware."
                className="w-full bg-transparent border-0 outline-none text-base sm:text-lg text-[#8c9e97] placeholder-[#3f534c] leading-relaxed resize-none focus:ring-0 px-0 selection:bg-[#10B981]/30 selection:text-white"
              />
            </div>
            <p className="text-[11px] text-[#556961] font-mono">
              Centreret tekstblok med max bredde på 2xl for optimal redaktionel læsbarhed i Soft Sage (#728984).
            </p>
          </div>

          {/* FIELD 4: Enthusiast Disclaimer */}
          <div className="space-y-2 group">
            <div className="flex items-center justify-between text-xs font-mono">
              <label htmlFor="field-disclaimer" className="text-[#728984] group-focus-within:text-[#10B981] transition-colors uppercase tracking-wider text-[11px] font-medium flex items-center gap-2">
                <span>Entusiast-deklaration</span>
                <span className="text-[10px] text-[#465b53] lowercase font-normal">(ai disclaimer note)</span>
              </label>
              <span className="text-[10px] text-[#556961]">
                {formData.disclaimerText.length} tegn
              </span>
            </div>

            <div className="pt-1 pb-3 border-b border-[rgba(255,255,255,0.04)] focus-within:border-[#10B981]/50 transition-colors">
              <textarea
                id="field-disclaimer"
                rows={4}
                value={formData.disclaimerText}
                onChange={(e) => handleFieldChange('disclaimerText', e.target.value)}
                placeholder="Entusiast-deklaration: Jeg er ikke certificeret it-ekspert, men en nysgerrig AI-entusiast..."
                className="w-full bg-transparent border-0 outline-none text-xs sm:text-sm font-mono text-neutral-200 placeholder-[#3f534c] leading-relaxed resize-none focus:ring-0 px-0 italic selection:bg-[#10B981]/30 selection:text-white"
              />
            </div>
            <p className="text-[11px] text-[#556961] font-mono">
              Pre-udfyldt med din personlige note om Gemma 2-9B / M4-tests. Vises direkte over tag-pillerne med en pulserende smaragdgrøn indikator.
            </p>
          </div>

          {/* Bottom Sheet Persistence Status */}
          <div className="pt-4 border-t border-[rgba(255,255,255,0.04)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] font-mono text-[#5c736a]">
            <div className="flex items-center gap-2">
              <FileCode className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Synkroniserer med: <code className="text-[#8c9e97]">/settings.json</code></span>
            </div>
            <div className="flex items-center gap-2">
              <HardDrive className="w-3.5 h-3.5" />
              <span>{lastSavedFormatted}</span>
            </div>
          </div>

          {/* Big Action Save Button at bottom of form */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="w-full py-3 px-5 bg-white hover:bg-neutral-200 text-[#091614] rounded-xl text-xs font-semibold font-mono transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-[0.99] disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#091614]" />
                  <span>Gemmer til settings.json...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-[#091614]" />
                  <span>Gem Indstillinger (Ctrl/Cmd+S)</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Right Column (Live Instant Preview Sheet): 5 cols */}
        <div className="lg:col-span-5 flex flex-col gap-6 sticky top-6">
          
          <div className="bg-[#0c1d19] rounded-2xl p-6 border border-[rgba(255,255,255,0.04)] shadow-xl space-y-6">
            
            {/* Preview Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(255,255,255,0.05)] text-xs font-mono">
              <div className="flex items-center gap-2 text-[#8c9e97]">
                <Eye className="w-3.5 h-3.5 text-[#10B981]" />
                <span className="uppercase tracking-wider text-[11px] font-medium text-white">
                  Live Forhåndsvisning
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-[#10B981]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                <span>Reaktiv Live Synk</span>
              </div>
            </div>

            {/* Simulated Canvas Preview Container */}
            <div className="bg-[#091614] rounded-xl border border-white/5 p-5 sm:p-6 space-y-6 overflow-hidden">
              
              {/* 1. Mini Navbar Brand Simulator */}
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981]" />
                  <span className="font-mono text-xs sm:text-sm text-[#F1F5F4] tracking-tight font-medium">
                    {formData.blogName || 'local-ai.blog'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono text-[#728984]">
                  <span>Vejledninger</span>
                  <span>·</span>
                  <span>Om</span>
                  <span>·</span>
                  <span className="text-[#10B981] font-semibold">DA</span>
                </div>
              </div>

              {/* 2. Hero Stack Simulator */}
              <div className="text-center space-y-3 pt-2">
                {/* Eyebrow */}
                <div>
                  <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#728984]">
                    {settings.eyebrowText || 'UDVALGT ARTIKEL • 6 MIN LÆSETID'}
                  </span>
                </div>

                {/* Main Heading */}
                <h2 className="text-xl sm:text-2xl font-semibold text-[#F1F5F4] tracking-tight leading-tight transition-all">
                  {formData.heroTitle || 'Mine Erfaringer med Lokal AI på Apple Silicon'}
                </h2>

                {/* Subtitle */}
                <p className="text-xs sm:text-sm text-[#728984] leading-relaxed max-w-md mx-auto transition-all">
                  {formData.heroSubtitle || 'Personlige eksperimenter, prompts og ufiltrerede tests af åbne modeller direkte på hverdagens hardware.'}
                </p>

                {/* AI Disclaimer Component */}
                <div className="pt-2">
                  <AiDisclaimer
                    text={
                      formData.disclaimerText ||
                      'Entusiast-deklaration: Jeg er ikke certificeret it-ekspert, men en nysgerrig AI-entusiast. Her deler jeg personlige observationer, brugbare prompts og rå tests af modeller som Gemma 2-9B på Macs med M4-chips.'
                    }
                  />
                </div>

                {/* Tag Pills */}
                <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                  {(settings.tags || ['Apple Silicon', 'CoreML', 'Gemma 2-9B', 'Privatliv']).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-full text-[9px] font-mono text-[#8c9e97] bg-white/5 border border-white/10"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Mini Author Byline */}
                <div className="pt-2 flex items-center justify-center gap-2 text-[10px] font-mono text-[#728984]">
                  <span className="text-[#F1F5F4] font-medium">{settings.authorName || 'Jesper'}</span>
                  <span>•</span>
                  <span>{settings.authorRole || 'Selvlært AI Entusiast'}</span>
                </div>
              </div>

            </div>

            {/* Information Card */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-xs font-mono text-[#728984] space-y-2">
              <div className="flex items-center gap-2 text-neutral-300 font-medium text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
                <span>Øjeblikkelig Synkronisering</span>
              </div>
              <p className="text-[11px] leading-relaxed text-[#556961]">
                Når du klikker på <strong>Gem Indstillinger</strong>, overskrives <code className="text-[#8c9e97]">settings.json</code> direkte på din maskine samt i browserens lokale lagring. Ændringerne slår igennem på forsiden uden behov for genindlæsning.
              </p>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
