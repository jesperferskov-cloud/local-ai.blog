import React, { useState } from 'react';
import { toolsDirectory } from '../data/content';
import { Language } from '../types';
import { X, Copy, Check, ExternalLink, Cpu, Star } from 'lucide-react';

interface ToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const ToolsModal: React.FC<ToolsModalProps> = ({ isOpen, onClose, lang }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredTools = toolsDirectory.filter((tool) => {
    if (activeFilter === 'all') return true;
    return tool.category === activeFilter;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div
        className="relative bg-canvas border border-borderSubtle w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden my-8 text-titleText transition-colors duration-500"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-borderSubtle bg-cardSurface">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-canvas border border-borderSubtle text-accentGlow font-mono text-xs">
                &gt;_
              </span>
              <h2 className="text-xl font-bold tracking-tight text-titleText">
                {lang === 'da' ? 'Udforsk Værktøjer til Lokal AI' : 'Explore On-Device AI Tools'}
              </h2>
            </div>
            <p className="text-xs text-bodyText mt-1">
              {lang === 'da'
                ? 'Håndplukkede runtimes, biblioteker og GUI-værktøjer til Apple Silicon og privat inferens.'
                : 'Curated runtimes, developer frameworks, and GUIs engineered for Apple Silicon and private execution.'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-bodyText hover:text-titleText hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="px-6 py-3 border-b border-borderSubtle bg-canvas flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: lang === 'da' ? 'Alle' : 'All' },
            { id: 'runtime', label: 'Runtimes' },
            { id: 'developer', label: 'Developer SDKs' },
            { id: 'gui', label: 'GUI Apps' },
            { id: 'audio-vision', label: 'Audio & Vision' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                activeFilter === tab.id
                  ? 'bg-titleText text-canvas shadow-sm font-semibold'
                  : 'bg-cardSurface text-bodyText hover:text-titleText border border-borderSubtle'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tools List */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4 divide-y divide-borderSubtle">
          {filteredTools.map((tool) => (
            <div key={tool.id} className="pt-4 first:pt-0 space-y-2.5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-titleText">
                      {tool.name}
                    </h3>
                    {tool.githubStars && (
                      <span className="text-[11px] font-mono text-bodyText bg-cardSurface border border-borderSubtle px-2 py-0.5 rounded flex items-center gap-1">
                        <Star className="w-3 h-3 text-accentGlow" />
                        {tool.githubStars}
                      </span>
                    )}
                    <span className="text-[11px] font-mono text-bodyText/80 border border-borderSubtle px-1.5 py-0.5 rounded">
                      {tool.license}
                    </span>
                  </div>
                  <p className="text-xs text-bodyText mt-1 leading-relaxed">
                    {tool.description[lang]}
                  </p>
                </div>

                <a
                  href={tool.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-md text-bodyText hover:text-titleText hover:bg-black/5 dark:hover:bg-white/5 transition-colors shrink-0"
                  title="Official Website"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              {/* Install Command Bar */}
              {tool.installCommand && (
                <div className="bg-[#050e0d] text-white border border-borderSubtle rounded-lg p-2.5 flex items-center justify-between font-mono text-xs">
                  <div className="flex items-center gap-2 overflow-hidden mr-2">
                    <span className="text-accentGlow select-none">$</span>
                    <span className="text-neutral-200 truncate">{tool.installCommand}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(tool.installCommand!, tool.id)}
                    className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white bg-neutral-800 hover:bg-neutral-700 px-2 py-1 rounded transition-colors shrink-0 cursor-pointer"
                  >
                    {copiedId === tool.id ? (
                      <>
                        <Check className="w-3 h-3 text-accentGlow" />
                        <span className="text-accentGlow">{lang === 'da' ? 'Kopieret' : 'Copied'}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>{lang === 'da' ? 'Kopier' : 'Copy'}</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Specs & Recommendation */}
              <div className="flex flex-wrap items-center justify-between text-[11px] text-bodyText pt-1">
                <span className="flex items-center gap-1">
                  <Cpu className="w-3 h-3 text-accentGlow" />
                  {tool.systemRequirement}
                </span>
                <span className="italic">
                  {lang === 'da' ? 'Ideel til: ' : 'Ideal for: '}
                  {tool.recommendedFor[lang]}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-cardSurface border-t border-borderSubtle flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-canvas hover:bg-black/5 dark:hover:bg-white/5 border border-borderSubtle text-titleText text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            {lang === 'da' ? 'Luk' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
