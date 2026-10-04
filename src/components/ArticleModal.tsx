import React, { useState, useEffect, useMemo } from 'react';
import { Article, Language } from '../types';
import { X, Copy, Check, Terminal, Share2 } from 'lucide-react';
import { ArticleCardVisual } from './ArticleCardVisual';
import { ArticleFallbackBanner } from './ArticleFallbackBanner';
import { loadArticleMarkdown, parseFrontmatter } from '../services/articleMarkdownService';
import { useLanguage } from '../context/LanguageContext';
import { formatArticleDate } from '../utils/dateUtils';

interface ArticleModalProps {
  article: Article | null;
  onClose: () => void;
  lang?: Language;
}

export const ArticleModal: React.FC<ArticleModalProps> = ({ article, onClose }) => {
  const { lang, setLang, t } = useLanguage();
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (article) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [article, onClose]);

  // Load article markdown and evaluate English fallback status
  const markdownResult = useMemo(() => {
    if (!article) return null;
    return loadArticleMarkdown(article.slug, lang);
  }, [article, lang]);

  if (!article) return null;

  const copyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const isDanishFallback = lang === 'en' && markdownResult?.isFallback;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div
        className="relative bg-[#091614] border border-white/10 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col text-neutral-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header inside modal */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 sm:px-8 py-3.5 border-b border-white/5 bg-[#091614]/95 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-xs text-[#728984] font-mono">
            <span className="font-semibold text-[#10B981] uppercase tracking-wider">
              {article.categoryLabel[lang] || article.categoryLabel.da}
            </span>
            <span className="text-white/20">/</span>
            <span>{article.hardwareLabel}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={copyShareLink}
              className="p-1.5 rounded-lg text-[#728984] hover:text-[#F1F5F4] hover:bg-white/5 transition-colors text-xs flex items-center gap-1.5 cursor-pointer font-mono"
              title={t('copyLink')}
            >
              {linkCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#10B981]" />
                  <span className="text-[11px] text-[#10B981]">{t('copied')}</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[11px]">{t('share')}</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#728984] hover:text-[#F1F5F4] hover:bg-white/5 transition-colors cursor-pointer"
              aria-label={t('close')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Article Body */}
        <div className="overflow-y-auto p-6 sm:p-10 space-y-8">
          
          {/* Fallback routing notice card if English version is missing */}
          {isDanishFallback && (
            <ArticleFallbackBanner
              onSwitchToDanish={() => setLang('da')}
              autoRedirectSeconds={6}
            />
          )}

          {/* Article Header */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs text-[#728984] font-mono">
              <span className="text-[#F1F5F4] font-medium">{article.author.name}</span>
              <span>·</span>
              <span>{formatArticleDate(article.date, lang) || article.date}</span>
              <span>·</span>
              <span>{article.readTime[lang] || article.readTime.da}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-[#F1F5F4] leading-tight text-balance">
              {article.title[lang] || article.title.da}
            </h1>

            <p className="text-base sm:text-lg text-[#728984] leading-relaxed font-normal">
              {article.subtitle[lang] || article.subtitle.da}
            </p>
          </div>

          {/* Visual Performance Mockup or Uploaded Cover Image */}
          {(() => {
            const parsed = markdownResult?.markdown ? parseFrontmatter(markdownResult.markdown).data : null;
            const cover = (parsed?.coverImage || article.coverImage || '').trim();
            if (cover) {
              return (
                <div className="border border-white/5 rounded-xl overflow-hidden bg-[#091614] aspect-[16/9] w-full relative">
                  <img
                    src={cover}
                    alt={article.title[lang] || article.title.da}
                    className="w-full h-full object-cover"
                  />
                </div>
              );
            }
            return (
              <div className="border border-white/5 rounded-xl overflow-hidden bg-[#0E1F1C] p-3">
                <ArticleCardVisual mockupType={article.mockupType} metrics={article.metrics} />
              </div>
            );
          })()}

          {/* Summary Callout Box */}
          <div className="p-5 sm:p-6 rounded-xl bg-[#0E1F1C] border border-white/5 text-sm text-[#728984] leading-relaxed space-y-2">
            <div className="font-semibold text-[#F1F5F4] uppercase text-xs tracking-wider font-mono flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              <span>{t('executiveTakeaway')}</span>
            </div>
            <p className="text-[#F1F5F4]/90">
              {article.content.summary[lang] || article.content.summary.da}
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-8 divide-y divide-white/5">
            {article.content.sections.map((section, idx) => (
              <div key={idx} className="pt-6 first:pt-0 space-y-4">
                <h3 className="text-lg sm:text-xl font-semibold text-[#F1F5F4] tracking-tight">
                  {section.heading[lang] || section.heading.da}
                </h3>

                <div className="space-y-3 text-sm sm:text-base text-[#728984] leading-relaxed">
                  {(section.paragraphs[lang] || section.paragraphs.da).map((p, pIdx) => (
                    <p key={pIdx}>{p}</p>
                  ))}
                </div>

                {/* Terminal Command if provided */}
                {section.terminalCommand && (
                  <div className="my-4">
                    <div className="text-[11px] font-mono uppercase text-[#728984] mb-1.5 flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-[#10B981]" />
                      <span>{t('terminalExecution')}</span>
                    </div>
                    <div className="bg-[#050e0d] text-white rounded-lg p-3 font-mono text-xs flex items-center justify-between border border-white/5">
                      <div className="flex items-center gap-2 overflow-hidden mr-2">
                        <span className="text-[#10B981] select-none">$</span>
                        <span className="text-[#F1F5F4] truncate">{section.terminalCommand}</span>
                      </div>
                      <button
                        onClick={() => copyCommand(section.terminalCommand!)}
                        className="flex items-center gap-1 text-[11px] text-[#728984] hover:text-[#F1F5F4] bg-[#0E1F1C] hover:bg-white/10 px-2.5 py-1 rounded transition-colors shrink-0 cursor-pointer"
                      >
                        {copiedCmd === section.terminalCommand ? (
                          <>
                            <Check className="w-3 h-3 text-[#10B981]" />
                            <span className="text-[#10B981]">{t('copied')}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>{t('copyLink')}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Data Points Grid if provided */}
                {section.dataPoints && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
                    {section.dataPoints.map((dp, dpIdx) => (
                      <div key={dpIdx} className="p-3 bg-[#0E1F1C] border border-white/5 rounded-lg">
                        <div className="text-xs text-[#728984] font-mono">
                          {dp.label[lang] || dp.label.da}
                        </div>
                        <div className="text-base font-semibold font-mono text-[#F1F5F4] mt-0.5">
                          {dp.value}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Author Bio Box */}
          <div className="pt-6 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#132B25] border border-white/10 text-[#10B981] flex items-center justify-center font-mono text-xs font-semibold">
                {article.author.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="text-sm font-semibold text-[#F1F5F4]">{article.author.name}</div>
                <div className="text-xs text-[#728984] font-mono">
                  {article.author.role[lang] || article.author.role.da}
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="px-4 py-2 border border-white/10 hover:bg-white/5 text-[#728984] hover:text-[#F1F5F4] text-xs font-mono rounded-lg transition-colors cursor-pointer"
            >
              {t('close')}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
