import React, { useEffect, useRef, useState, useCallback } from 'react';
import { featuredArticle } from '../data/content';
import { Article } from '../types';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { AiDisclaimer } from './AiDisclaimer';

interface HeroFeaturedProps {
  onReadArticle: (article: Article) => void;
  onScrollToAbout?: () => void;
}

export const HeroFeatured: React.FC<HeroFeaturedProps> = ({ onReadArticle, onScrollToAbout }) => {
  const { lang, t } = useLanguage();
  const { settings: heroSettings } = useSiteSettings();

  // Master container ref for mouse parallax
  const containerRef = useRef<HTMLElement | null>(null);
  const yogiGroupRef = useRef<SVGGElement | null>(null);
  const yogiWrapperRef = useRef<HTMLDivElement | null>(null);

  // Dynamic interactive parallax state
  const [archDelta, setArchDelta] = useState(0);
  const isHoveringVisual = useRef(false);

  // Parallax animation interpolation values
  const targetShiftX = useRef(0);
  const targetShiftY = useRef(0);
  const currentShiftX = useRef(0);
  const currentShiftY = useRef(0);

  const targetTiltX = useRef(0);
  const targetTiltY = useRef(0);
  const currentTiltX = useRef(0);
  const currentTiltY = useRef(0);

  const targetArchDelta = useRef(0);
  const currentArchDelta = useRef(0);

  const rafId = useRef<number | null>(null);

  // Animation loop with smooth RAF lerping
  const startRafLoop = useCallback(() => {
    if (rafId.current !== null) return;

    const animate = () => {
      const lerp = 0.08;

      currentShiftX.current += (targetShiftX.current - currentShiftX.current) * lerp;
      currentShiftY.current += (targetShiftY.current - currentShiftY.current) * lerp;
      currentTiltX.current += (targetTiltX.current - currentTiltX.current) * lerp;
      currentTiltY.current += (targetTiltY.current - currentTiltY.current) * lerp;
      currentArchDelta.current += (targetArchDelta.current - currentArchDelta.current) * lerp;

      // Update CPU transform
      if (yogiWrapperRef.current) {
        const sx = currentShiftX.current.toFixed(2);
        const sy = currentShiftY.current.toFixed(2);
        const rx = currentTiltX.current.toFixed(2);
        const ry = currentTiltY.current.toFixed(2);
        yogiWrapperRef.current.style.transform = `translate3d(${sx}px, ${sy}px, 0) rotateX(${rx}deg) rotateY(${ry}deg)`;
      }

      // Update state for SVG arch expansion (clamped 0 to 3px)
      setArchDelta(Number(currentArchDelta.current.toFixed(2)));

      const dX = Math.abs(targetShiftX.current - currentShiftX.current);
      const dY = Math.abs(targetShiftY.current - currentShiftY.current);
      const dArch = Math.abs(targetArchDelta.current - currentArchDelta.current);

      if (isHoveringVisual.current || dX > 0.05 || dY > 0.05 || dArch > 0.02) {
        rafId.current = requestAnimationFrame(animate);
      } else {
        rafId.current = null;
      }
    };

    rafId.current = requestAnimationFrame(animate);
  }, []);

  // Mouse Move Parallax Handler
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    // Normalized coordinates from -1 (left/top) to +1 (right/bottom)
    const normX = Math.max(-1, Math.min(1, ((e.clientX - rect.left) / rect.width - 0.5) * 2));
    const normY = Math.max(-1, Math.min(1, ((e.clientY - rect.top) / rect.height - 0.5) * 2));

    // Shift floating CPU by ±10px horizontally and ±8px vertically
    targetShiftX.current = normX * 10;
    targetShiftY.current = normY * 8;

    // 3D subtle tilt ±2.5deg
    targetTiltX.current = -normY * 2.5;
    targetTiltY.current = normX * 2.5;

    // Radial distance from center expands/contracts the data arches by 0 to 3px
    const radialDist = Math.sqrt(normX * normX + normY * normY);
    targetArchDelta.current = Math.min(3, radialDist * 2.8);

    startRafLoop();
  }, [startRafLoop]);

  const handleMouseEnter = () => {
    isHoveringVisual.current = true;
    startRafLoop();
  };

  const handleMouseLeave = () => {
    isHoveringVisual.current = false;
    targetShiftX.current = 0;
    targetShiftY.current = 0;
    targetTiltX.current = 0;
    targetTiltY.current = 0;
    targetArchDelta.current = 0;
    startRafLoop();
  };

  useEffect(() => {
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  const handleScrollToAbout = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    if ('preventDefault' in e) e.preventDefault();
    if (onScrollToAbout) {
      onScrollToAbout();
    } else {
      const target = document.getElementById('bag-om-bloggen') || document.getElementById('om-mig');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const isEn = lang === 'en';

  // Dynamic hero texts with English localized fallback support
  const heroTitle =
    (isEn && heroSettings.translations?.en?.heroTitle) ||
    heroSettings.heroTitle ||
    t('featuredTitle');

  const heroSubtitle =
    (isEn && heroSettings.translations?.en?.heroSubtitle) ||
    heroSettings.heroSubtitle ||
    t('featuredDeck');

  const disclaimerText =
    (isEn && heroSettings.translations?.en?.disclaimerText) ||
    heroSettings.disclaimerText;

  const eyebrowText =
    (isEn && heroSettings.translations?.en?.eyebrowText) ||
    heroSettings.eyebrowText ||
    `${t('featured')} • 6 ${t('readTime').toUpperCase()}`;

  // Pill tags: minimal, subtle, dark
  const tags = heroSettings.tags || [
    t('tagAppleSilicon'),
    t('tagCoreML'),
    'Gemma 2-9B',
    t('tagPrivacy'),
    t('tagOllama'),
  ];

  const authorName =
    (isEn && heroSettings.translations?.en?.authorName) ||
    heroSettings.authorName ||
    t('authorName');

  const authorRole =
    (isEn && heroSettings.translations?.en?.authorRole) ||
    heroSettings.authorRole ||
    t('authorRole');

  const readActionLabel = t('readArticle');

  // Dynamic Concentric Arch Radii with mouse parallax expansion (±2 to 3px)
  const baseR1 = 118;
  const baseR2 = 148;
  const baseR3 = 178;
  const baseR4 = 208;
  const baseR5 = 238;

  const r1 = baseR1 + archDelta * 0.6;
  const r2 = baseR2 + archDelta * 0.9;
  const r3 = baseR3 + archDelta * 1.3;
  const r4 = baseR4 + archDelta * 1.7;
  const r5 = baseR5 + archDelta * 2.1;

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative w-full overflow-hidden border-b border-white/5 py-12 sm:py-16 lg:py-24 px-5 sm:px-8 lg:px-12 xl:px-16"
      aria-label="Hero - Udvalgt Artikel"
    >
      {/* ========================================================================= */}
      {/* 1. ORGANIC BOUNDED BACKDROP: THE SILICON DUNES                           */}
      {/* Three layered, overlapping SVG waves colored in #060F0E, #091614, #0E1F1C */}
      {/* with micro-thin glowing emerald (#10B981 at 0.15) outline along the crest */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0" aria-hidden="true">
        <svg
          className="w-full h-full object-cover min-h-[640px]"
          viewBox="0 0 1440 820"
          fill="none"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Emerald glow filter for wave crest outlines */}
            <filter id="crest-glow" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0.062   0 0 0 0 0.725   0 0 0 0 0.505  0 0 0 0.25 0"
              />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Subtle atmospheric radial spotlight over the Silicon Yogi area */}
            <radialGradient id="yogi-ambient-glow" cx="72%" cy="46%" r="40%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.08" />
              <stop offset="60%" stopColor="#0E1F1C" stopOpacity="0.02" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>

            {/* Dune 1 Gradient: Deep soft shadow to forest base */}
            <linearGradient id="dune-1-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#060F0E" />
              <stop offset="100%" stopColor="#050C0B" />
            </linearGradient>

            {/* Dune 2 Gradient: Deepest Forest */}
            <linearGradient id="dune-2-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#091614" />
              <stop offset="100%" stopColor="#071210" />
            </linearGradient>

            {/* Dune 3 Gradient: Medium Slate Forest */}
            <linearGradient id="dune-3-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0E1F1C" />
              <stop offset="100%" stopColor="#0A1815" />
            </linearGradient>
          </defs>

          {/* Deep Base Horizon Fill */}
          <rect width="1440" height="820" fill="#060F0E" />

          {/* Atmospheric Ambient Spotlight */}
          <rect width="1440" height="820" fill="url(#yogi-ambient-glow)" />

          {/* ------------------------------------------------------------- */}
          {/* DUNE 1: Deepest Horizon Layer (#060F0E) with subtle crest     */}
          {/* ------------------------------------------------------------- */}
          <g>
            <path
              d="M -50 180 C 260 70, 520 280, 840 160 C 1120 60, 1320 220, 1490 170 L 1490 850 L -50 850 Z"
              fill="url(#dune-1-grad)"
            />
            {/* Glowing crest line */}
            <path
              d="M -50 180 C 260 70, 520 280, 840 160 C 1120 60, 1320 220, 1490 170"
              stroke="#10B981"
              strokeWidth="1.4"
              strokeOpacity="0.15"
              fill="none"
              filter="url(#crest-glow)"
            />
            {/* Topographical echo contour lines for tactile depth */}
            <path
              d="M -50 205 C 260 95, 520 305, 840 185 C 1120 85, 1320 245, 1490 195"
              stroke="#728984"
              strokeWidth="0.8"
              strokeDasharray="4 8"
              strokeOpacity="0.08"
              fill="none"
            />
          </g>

          {/* ------------------------------------------------------------- */}
          {/* DUNE 2: Middle Dunes Layer (#091614 - Deepest Forest)         */}
          {/* ------------------------------------------------------------- */}
          <g>
            <path
              d="M -50 360 C 280 250, 600 440, 960 320 C 1220 240, 1380 390, 1490 350 L 1490 850 L -50 850 Z"
              fill="url(#dune-2-grad)"
            />
            {/* Glowing crest line */}
            <path
              d="M -50 360 C 280 250, 600 440, 960 320 C 1220 240, 1380 390, 1490 350"
              stroke="#10B981"
              strokeWidth="1.6"
              strokeOpacity="0.18"
              fill="none"
              filter="url(#crest-glow)"
            />
            {/* Topographical contour */}
            <path
              d="M -50 390 C 280 280, 600 470, 960 350 C 1220 270, 1380 420, 1490 380"
              stroke="#728984"
              strokeWidth="0.8"
              strokeDasharray="6 10"
              strokeOpacity="0.07"
              fill="none"
            />
          </g>

          {/* ------------------------------------------------------------- */}
          {/* DUNE 3: Foreground Dunes Layer (#0E1F1C - Medium Slate Forest)*/}
          {/* ------------------------------------------------------------- */}
          <g>
            <path
              d="M -50 540 C 320 460, 680 620, 1040 510 C 1260 450, 1390 530, 1490 500 L 1490 850 L -50 850 Z"
              fill="url(#dune-3-grad)"
            />
            {/* Glowing crest line */}
            <path
              d="M -50 540 C 320 460, 680 620, 1040 510 C 1260 450, 1390 530, 1490 500"
              stroke="#10B981"
              strokeWidth="1.8"
              strokeOpacity="0.22"
              fill="none"
              filter="url(#crest-glow)"
            />
          </g>

          {/* Playful Josh Comeau style stardust: drifting circuit sparkles in the dunes */}
          <g className="animate-stardust">
            <circle cx="210" cy="140" r="1.5" fill="#10B981" fillOpacity="0.6" />
            <circle cx="480" cy="220" r="1.2" fill="#728984" fillOpacity="0.5" />
            <circle cx="680" cy="110" r="1.8" fill="#10B981" fillOpacity="0.5" />
            <circle cx="1120" cy="160" r="1.5" fill="#10B981" fillOpacity="0.7" />
            <circle cx="1280" cy="280" r="1.2" fill="#728984" fillOpacity="0.6" />
            <circle cx="920" cy="460" r="1.4" fill="#10B981" fillOpacity="0.5" />
          </g>
        </svg>
      </div>

      {/* ========================================================================= */}
      {/* 2-COLUMN ASYMMETRIC LAYOUT (Desktop: 60% Left, 40% Right. Mobile: Stacked) */}
      {/* ========================================================================= */}
      <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 xl:gap-16 items-center">

        {/* ----------------------------------------------------------------------- */}
        {/* LEFT COLUMN: Editorial Asymmetric Typography Stack (60% on desktop)     */}
        {/* ----------------------------------------------------------------------- */}
        <div className="lg:col-span-7 flex flex-col items-start text-left">
          
          {/* 1. Small Caps Metadata: Tracked-wide, Soft Sage (#728984) */}
          <div className="flex items-center gap-2.5 mb-3 sm:mb-4 select-none">
            <span className="relative flex h-1.5 w-1.5 shrink-0" aria-hidden="true">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#10B981]"></span>
            </span>
            <span className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.2em] text-[#728984] font-medium">
              {eyebrowText}
            </span>
          </div>

          {/* 2. Bold Editorial Title: text-5xl md:text-6xl, Warm off-white (#F1F5F4) */}
          <h1 
            onClick={() => onReadArticle(featuredArticle)}
            className="text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-6xl font-semibold text-[#F1F5F4] tracking-tight leading-[1.08] sm:leading-[1.10] mb-4 sm:mb-5 text-balance hover:text-white cursor-pointer transition-colors group"
          >
            {heroTitle}
          </h1>

          {/* 3. Subtitle / Deck: max-w-2xl, Soft Sage (#728984) */}
          <p className="text-base sm:text-lg lg:text-xl text-[#728984] leading-relaxed mb-6 max-w-xl text-balance">
            {heroSubtitle}
          </p>

          {/* 4. Cozy Integrated Handwritten Note: "Entusiast-deklaration" */}
          <AiDisclaimer text={disclaimerText} className="mb-6 sm:mb-7" />

          {/* 5. Minimal Dark Pill Tags */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 mb-7 sm:mb-8 select-none">
            {tags.map((tag: string) => (
              <span
                key={tag}
                className="px-3.5 py-1 rounded-full text-xs font-mono text-[#8c9e97] bg-white/5 border border-white/10 hover:border-[#10B981]/40 hover:text-[#F1F5F4] transition-all cursor-default"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* 6. Author Badge & Direct Action CTA Button */}
          <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-5 pt-2">
            {/* Author Badge with Smooth Scroll to "Bag om bloggen" */}
            <button
              type="button"
              onClick={handleScrollToAbout}
              className="flex items-center gap-3 py-2 px-3.5 rounded-xl border border-white/5 bg-[#0E1F1C]/90 hover:border-white/20 hover:bg-[#0E1F1C] transition-all cursor-pointer group/author focus:outline-none focus-visible:ring-1 focus-visible:ring-[#10B981] shadow-sm text-left"
              title={lang === 'da' ? 'Gå til Bag om bloggen (Jesper)' : 'Jump to About Jesper'}
              aria-label={`${authorName} • ${authorRole}`}
            >
              <div className="w-8 h-8 rounded-full bg-[#132B25] border border-white/10 group-hover/author:border-[#10B981]/60 group-hover/author:shadow-[0_0_10px_rgba(16,185,129,0.35)] flex items-center justify-center shrink-0 transition-all">
                <span className="text-xs font-mono font-medium text-[#10B981]">
                  {authorName.charAt(0) || 'J'}
                </span>
              </div>
              <div className="flex flex-col">
                <strong className="text-xs sm:text-sm text-[#F1F5F4] font-medium group-hover/author:text-white transition-colors">
                  {authorName}
                </strong>
                <span className="text-[11px] text-[#728984] group-hover/author:text-[#9bb3ae] transition-colors">
                  {authorRole}
                </span>
              </div>
            </button>

            {/* Primary Action Button: Læs artikel */}
            <button
              type="button"
              onClick={() => onReadArticle(featuredArticle)}
              className="inline-flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-[#091614] font-medium text-xs sm:text-sm transition-all duration-200 shadow-[0_4px_16px_rgba(16,185,129,0.25)] hover:shadow-[0_6px_22px_rgba(16,185,129,0.4)] cursor-pointer group/cta focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <span>{readActionLabel}</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/cta:translate-x-1" />
            </button>
          </div>

        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* RIGHT COLUMN: The "Silicon Yogi" Central Visual (40% on desktop)        */}
        {/* Floating Isometric 3D Silicon Chip + Data Rainbow Arcs + Zen Core       */}
        {/* ----------------------------------------------------------------------- */}
        <div className="lg:col-span-5 flex items-center justify-center relative perspective-1000 mt-6 lg:mt-0">
          
          <div
            ref={yogiWrapperRef}
            onClick={() => onReadArticle(featuredArticle)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onReadArticle(featuredArticle);
              }
            }}
            tabIndex={0}
            role="button"
            aria-label={`${readActionLabel}: ${heroTitle}`}
            className="relative w-full max-w-[460px] sm:max-w-[480px] lg:max-w-[520px] aspect-square flex items-center justify-center cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981] rounded-3xl"
          >
            {/* Subtle Interactive Ambient Glow */}
            <div className="absolute inset-4 rounded-full bg-[#10B981]/5 filter blur-3xl pointer-events-none group-hover:bg-[#10B981]/12 transition-all duration-500" />

            {/* =================================================================== */}
            {/* THE MASTER SILICON YOGI VECTOR ART                                 */}
            {/* =================================================================== */}
            <svg
              className="w-full h-full select-none transform-gpu overflow-visible"
              viewBox="0 0 540 540"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Zen Core Hypnotic Emerald Radial Glow */}
                <radialGradient id="zen-emerald-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#34D399" stopOpacity="0.9" />
                  <stop offset="35%" stopColor="#10B981" stopOpacity="0.65" />
                  <stop offset="70%" stopColor="#064E3B" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                </radialGradient>

                {/* Substrate Top Metallic Sheen */}
                <linearGradient id="substrate-surface-sheen" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#163830" />
                  <stop offset="45%" stopColor="#0B231D" />
                  <stop offset="100%" stopColor="#071814" />
                </linearGradient>

                {/* Silicon Die Mirror Reflection Sheen */}
                <linearGradient id="silicon-die-sheen" x1="15%" y1="0%" x2="85%" y2="100%">
                  <stop offset="0%" stopColor="#1E473D" stopOpacity="0.95" />
                  <stop offset="35%" stopColor="#102F28" stopOpacity="0.9" />
                  <stop offset="50%" stopColor="#255C50" stopOpacity="0.75" />
                  <stop offset="65%" stopColor="#0B231E" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#061814" stopOpacity="0.95" />
                </linearGradient>

                {/* Gold/Copper Pin Gradient */}
                <linearGradient id="pin-gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.7" />
                </linearGradient>

                {/* Drop shadow for floating CPU */}
                <filter id="shadow-blur" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="12" />
                </filter>
              </defs>

              {/* ------------------------------------------------------------- */}
              {/* BACKDROP: CONCENTRIC DATA RAINBOW ARCHES (Signal Arcs)        */}
              {/* Thin glowing code pathways, dots & binary nodes rising over   */}
              {/* ------------------------------------------------------------- */}
              <g className="transition-all duration-300 ease-out">
                {/* Arch 5 (Outermost): Emerald halo arc */}
                <path
                  d={`M ${270 - r5} 325 A ${r5} ${r5} 0 0 1 ${270 + r5} 325`}
                  stroke="#10B981"
                  strokeWidth="1.2"
                  strokeDasharray="4 8"
                  strokeOpacity="0.22"
                  className="animate-data-dash"
                  fill="none"
                />

                {/* Arch 4: Soft Sage binary trace */}
                <path
                  d={`M ${270 - r4} 325 A ${r4} ${r4} 0 0 1 ${270 + r4} 325`}
                  stroke="#728984"
                  strokeWidth="1.4"
                  strokeDasharray="16 8 3 8"
                  strokeOpacity="0.35"
                  className="group-hover:stroke-opacity-60 transition-all"
                  fill="none"
                />

                {/* Arch 3: Vibrant Emerald primary data channel */}
                <path
                  d={`M ${270 - r3} 325 A ${r3} ${r3} 0 0 1 ${270 + r3} 325`}
                  stroke="#10B981"
                  strokeWidth="2.0"
                  strokeDasharray="36 12 8 12"
                  strokeOpacity="0.55"
                  className="group-hover:stroke-opacity-80 transition-all animate-data-dash"
                  fill="none"
                />

                {/* Arch 2: Harmonic Sage trace */}
                <path
                  d={`M ${270 - r2} 325 A ${r2} ${r2} 0 0 1 ${270 + r2} 325`}
                  stroke="#728984"
                  strokeWidth="1.5"
                  strokeDasharray="8 6"
                  strokeOpacity="0.45"
                  fill="none"
                />

                {/* Arch 1 (Innermost): High-frequency neural focus arc */}
                <path
                  d={`M ${270 - r1} 325 A ${r1} ${r1} 0 0 1 ${270 + r1} 325`}
                  stroke="#10B981"
                  strokeWidth="1.8"
                  strokeDasharray="20 10"
                  strokeOpacity="0.7"
                  className="group-hover:stroke-opacity-95 transition-all"
                  fill="none"
                />

                {/* Orbiting / Stationed Signal Nodes & Binary Glyphs along the Arcs */}
                <g className="select-none">
                  {/* Zenith Node on Arch 3 (Emerald) */}
                  <circle
                    cx="270"
                    cy={325 - r3}
                    r="4.5"
                    fill="#10B981"
                    className="shadow-[0_0_10px_#10B981]"
                  />
                  <circle
                    cx="270"
                    cy={325 - r3}
                    r="8"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="0.8"
                    strokeOpacity="0.5"
                  />

                  {/* Left 45-deg Node on Arch 4 */}
                  <circle
                    cx={270 - r4 * 0.707}
                    cy={325 - r4 * 0.707}
                    r="3.5"
                    fill="#728984"
                    fillOpacity="0.8"
                  />

                  {/* Right 45-deg Node on Arch 4 */}
                  <circle
                    cx={270 + r4 * 0.707}
                    cy={325 - r4 * 0.707}
                    r="3.5"
                    fill="#10B981"
                    fillOpacity="0.85"
                  />

                  {/* Left 60-deg Node on Arch 2 */}
                  <circle
                    cx={270 - r2 * 0.5}
                    cy={325 - r2 * 0.866}
                    r="3"
                    fill="#10B981"
                    fillOpacity="0.75"
                  />

                  {/* Right 60-deg Node on Arch 2 */}
                  <circle
                    cx={270 + r2 * 0.5}
                    cy={325 - r2 * 0.866}
                    r="3"
                    fill="#728984"
                    fillOpacity="0.7"
                  />

                  {/* Binary & Math Glyphs floating along the arches */}
                  <text
                    x={270 - r3 * 0.8}
                    y={325 - r3 * 0.55}
                    fill="#728984"
                    fontSize="7.5"
                    fontFamily="monospace"
                    letterSpacing="0.1em"
                    fillOpacity="0.75"
                  >
                    01
                  </text>

                  <text
                    x={270 + r3 * 0.74}
                    y={325 - r3 * 0.55}
                    fill="#10B981"
                    fontSize="7.5"
                    fontFamily="monospace"
                    letterSpacing="0.1em"
                    fillOpacity="0.85"
                  >
                    101
                  </text>

                  <text
                    x={270 - r4 * 0.35}
                    y={325 - r4 * 0.92}
                    fill="#728984"
                    fontSize="7"
                    fontFamily="monospace"
                    letterSpacing="0.15em"
                    fillOpacity="0.65"
                  >
                    λ_CORE
                  </text>

                  <text
                    x={270 + r4 * 0.32}
                    y={325 - r4 * 0.92}
                    fill="#10B981"
                    fontSize="7"
                    fontFamily="monospace"
                    letterSpacing="0.15em"
                    fillOpacity="0.75"
                  >
                    ANE // 38T
                  </text>
                </g>
              </g>

              {/* ------------------------------------------------------------- */}
              {/* THE SHADOW BENEATH THE CHIP (Breathing in inverse sync)       */}
              {/* ------------------------------------------------------------- */}
              <ellipse
                cx="270"
                cy="472"
                rx="105"
                ry="22"
                fill="#030807"
                filter="url(#shadow-blur)"
                className="animate-shadow-breathe"
              />

              {/* ------------------------------------------------------------- */}
              {/* THE FLOATING ISOMETRIC CHIP (Silicon Yogi Body)               */}
              {/* 45-degree angle in 3D space with @keyframes float-yogi        */}
              {/* ------------------------------------------------------------- */}
              <g ref={yogiGroupRef} className="animate-float-yogi">
                
                {/* =========================================================== */}
                {/* 1. GOLD / COPPER CONTACT PINS (Radiating from outer edges)  */}
                {/* =========================================================== */}
                <g className="transition-all duration-300">
                  {/* Front-Left Pins (protruding along 155,340 to 270,400) */}
                  {[0, 1, 2, 3, 4, 5, 6].map((i) => {
                    const t = (i + 1) / 8;
                    const px = 160 + (270 - 160) * t;
                    const py = 340 + (398 - 340) * t + 18;
                    return (
                      <g key={`pin-fl-${i}`}>
                        <line
                          x1={px}
                          y1={py}
                          x2={px - 8}
                          y2={py + 12}
                          stroke="url(#pin-gold-grad)"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          className="group-hover:stroke-[#10B981] transition-colors"
                        />
                        <circle
                          cx={px - 8}
                          cy={py + 12}
                          r="1.6"
                          fill="#10B981"
                          fillOpacity="0.85"
                        />
                      </g>
                    );
                  })}

                  {/* Front-Right Pins (protruding along 270,400 to 380,340) */}
                  {[0, 1, 2, 3, 4, 5, 6].map((i) => {
                    const t = (i + 1) / 8;
                    const px = 270 + (380 - 270) * t;
                    const py = 398 - (398 - 340) * t + 18;
                    return (
                      <g key={`pin-fr-${i}`}>
                        <line
                          x1={px}
                          y1={py}
                          x2={px + 8}
                          y2={py + 12}
                          stroke="url(#pin-gold-grad)"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          className="group-hover:stroke-[#10B981] transition-colors"
                        />
                        <circle
                          cx={px + 8}
                          cy={py + 12}
                          r="1.6"
                          fill="#10B981"
                          fillOpacity="0.85"
                        />
                      </g>
                    );
                  })}
                </g>

                {/* =========================================================== */}
                {/* 2. ISOMETRIC CHIP BASE SLAB (Faceted 3D Physical Carrier)   */}
                {/* =========================================================== */}
                {/* Front-Left Slab Thickness Face */}
                <polygon
                  points="160,340 270,398 270,418 160,360"
                  fill="#051210"
                  stroke="#10B981"
                  strokeWidth="0.8"
                  strokeOpacity="0.3"
                />

                {/* Front-Right Slab Thickness Face */}
                <polygon
                  points="270,398 380,340 380,360 270,418"
                  fill="#0B231D"
                  stroke="#10B981"
                  strokeWidth="0.8"
                  strokeOpacity="0.4"
                />

                {/* Top Carrier Substrate Surface (Diamond 220px wide, 116px deep) */}
                <polygon
                  points="270,282 380,340 270,398 160,340"
                  fill="url(#substrate-surface-sheen)"
                  stroke="#728984"
                  strokeWidth="1.2"
                  strokeOpacity="0.5"
                  className="group-hover:stroke-[#10B981] group-hover:stroke-opacity-70 transition-all duration-500"
                />

                {/* Substrate Inner Bevel Border */}
                <polygon
                  points="270,290 370,340 270,390 170,340"
                  fill="none"
                  stroke="#728984"
                  strokeWidth="0.8"
                  strokeDasharray="4 2"
                  strokeOpacity="0.3"
                />

                {/* Precision Alignment Crosshairs on Substrate Corners */}
                <g stroke="#728984" strokeWidth="0.7" strokeOpacity="0.4">
                  <path d="M 268 285 L 272 285 M 270 283 L 270 287" />
                  <path d="M 374 340 L 378 340 M 376 338 L 376 342" />
                  <path d="M 268 395 L 272 395 M 270 393 L 270 397" />
                  <path d="M 162 340 L 166 340 M 164 338 L 164 342" />
                </g>

                {/* =========================================================== */}
                {/* 3. UNIFIED MEMORY (UMA) ISOMETRIC DUAL PACKAGES             */}
                {/* =========================================================== */}
                {/* Left RAM Module (Slightly raised isometric slab) */}
                <g className="transition-all duration-300">
                  {/* Thickness */}
                  <polygon points="174,320 196,331 196,335 174,324" fill="#040F0D" />
                  <polygon points="196,331 210,324 210,328 196,335" fill="#071916" />
                  {/* Top face */}
                  <polygon
                    points="188,313 210,324 196,331 174,320"
                    fill="#0A221C"
                    stroke="#728984"
                    strokeWidth="0.6"
                    strokeOpacity="0.45"
                    className="group-hover:stroke-[#10B981] transition-colors"
                  />
                  {/* Label */}
                  <text
                    x="193"
                    y="323"
                    fill="#728984"
                    fontSize="4"
                    fontFamily="monospace"
                    letterSpacing="0.1em"
                    textAnchor="middle"
                    fillOpacity="0.7"
                    transform="rotate(27 193 323)"
                  >
                    UMA-L
                  </text>
                </g>

                {/* Right RAM Module */}
                <g className="transition-all duration-300">
                  {/* Thickness */}
                  <polygon points="330,324 344,331 344,335 330,328" fill="#040F0D" />
                  <polygon points="344,331 366,320 366,324 344,335" fill="#071916" />
                  {/* Top face */}
                  <polygon
                    points="352,313 366,320 344,331 330,324"
                    fill="#0A221C"
                    stroke="#728984"
                    strokeWidth="0.6"
                    strokeOpacity="0.45"
                    className="group-hover:stroke-[#10B981] transition-colors"
                  />
                  <text
                    x="347"
                    y="323"
                    fill="#728984"
                    fontSize="4"
                    fontFamily="monospace"
                    letterSpacing="0.1em"
                    textAnchor="middle"
                    fillOpacity="0.7"
                    transform="rotate(-27 347 323)"
                  >
                    UMA-R
                  </text>
                </g>

                {/* =========================================================== */}
                {/* 4. SILICON DIE (Elevated Inner Monolith with Micro Traces)   */}
                {/* =========================================================== */}
                {/* Die Elevation Bevels (thickness 4px) */}
                <polygon points="196,340 270,378 270,382 196,344" fill="#04120F" />
                <polygon points="270,378 344,340 344,344 270,382" fill="#0A231D" />

                {/* Die Mirror Sheen Surface */}
                <polygon
                  points="270,302 344,340 270,378 196,340"
                  fill="url(#silicon-die-sheen)"
                  stroke="#10B981"
                  strokeWidth="0.9"
                  strokeOpacity="0.4"
                  className="group-hover:stroke-opacity-80 transition-all duration-500"
                />

                {/* Micro Circuit Trace Corridors in Isometric Matrix */}
                <g stroke="#728984" strokeWidth="0.6" strokeOpacity="0.3" fill="none" className="group-hover:stroke-[#10B981] group-hover:stroke-opacity-50 transition-colors">
                  {/* West-East bus traces */}
                  <path d="M 216 338 L 246 323" />
                  <path d="M 226 348 L 256 333" />
                  <path d="M 284 347 L 314 332" />
                  <path d="M 294 357 L 324 342" />

                  {/* North-South bus traces */}
                  <path d="M 250 312 L 235 320 L 235 345" />
                  <path d="M 290 312 L 305 320 L 305 345" />
                  <path d="M 250 368 L 235 360 L 235 348" />
                  <path d="M 290 368 L 305 360 L 305 348" />
                </g>

                {/* Solder Vias along the die boundary */}
                <g fill="#10B981" fillOpacity="0.7">
                  <circle cx="218" cy="336" r="1.2" />
                  <circle cx="236" cy="345" r="1.2" />
                  <circle cx="304" cy="345" r="1.2" />
                  <circle cx="322" cy="336" r="1.2" />
                  <circle cx="270" cy="310" r="1.3" />
                  <circle cx="270" cy="370" r="1.3" />
                </g>

                {/* Laser-etched Model Monogram */}
                <text
                  x="270"
                  y="319"
                  fill="#728984"
                  fontSize="4.5"
                  fontFamily="monospace"
                  letterSpacing="0.2em"
                  textAnchor="middle"
                  fillOpacity="0.75"
                >
                  LOCAL // M4
                </text>

                {/* =========================================================== */}
                {/* 5. THE ZEN CORE (Mind of the Local Model in Deep Meditation) */}
                {/* At the center of the chip: pulsing emerald faceted node     */}
                {/* =========================================================== */}
                {/* Outer Perspective Ripple 2 */}
                <ellipse
                  cx="270"
                  cy="340"
                  rx="62"
                  ry="32"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="0.8"
                  strokeDasharray="4 4"
                  className="animate-zen-ripple-slow pointer-events-none"
                />

                {/* Inner Perspective Ripple 1 */}
                <ellipse
                  cx="270"
                  cy="340"
                  rx="42"
                  ry="22"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="1.0"
                  strokeDasharray="2 3"
                  className="animate-zen-ripple-fast pointer-events-none"
                />

                {/* Ambient Meditation Aura Ring */}
                <ellipse
                  cx="270"
                  cy="340"
                  rx="26"
                  ry="14"
                  fill="url(#zen-emerald-glow)"
                  className="pointer-events-none"
                />

                {/* The Central Meditating Emerald Faceted Node */}
                <g className="animate-zen-breathe">
                  {/* Base Core Plate */}
                  <polygon
                    points="270,326 288,335 270,344 252,335"
                    fill="#082A21"
                    stroke="#10B981"
                    strokeWidth="1.2"
                    className="drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                  />

                  {/* Faceted Emerald Jewel (Top facet) */}
                  <polygon
                    points="270,328 284,335 270,342 256,335"
                    fill="#10B981"
                    fillOpacity="0.85"
                  />

                  {/* Facet Light Reflections */}
                  <polygon
                    points="270,328 284,335 270,335"
                    fill="#34D399"
                    fillOpacity="0.95"
                  />
                  <polygon
                    points="270,335 284,335 270,342"
                    fill="#059669"
                    fillOpacity="0.9"
                  />
                  <polygon
                    points="256,335 270,328 270,335"
                    fill="#6EE7B7"
                    fillOpacity="0.8"
                  />

                  {/* Pulsing Luminous Nucleus Point */}
                  <circle
                    cx="270"
                    cy="335"
                    r="3.5"
                    fill="#FFFFFF"
                    className="drop-shadow-[0_0_12px_#34D399]"
                  />
                </g>

                {/* Etched Meditation Status Beneath the Core */}
                <text
                  x="270"
                  y="360"
                  fill="#10B981"
                  fontSize="4.2"
                  fontFamily="monospace"
                  letterSpacing="0.22em"
                  fontWeight="600"
                  textAnchor="middle"
                  className="select-none drop-shadow-[0_0_4px_rgba(16,185,129,0.6)]"
                >
                  OFFLINE MEDITATION
                </text>

              </g>
            </svg>

            {/* Playful Floating Badge underneath the visual: 100% Local / Zero Cloud */}
            <div className="absolute -bottom-3 sm:-bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0E1F1C]/90 border border-white/10 backdrop-blur-md text-[10px] sm:text-[11px] font-mono text-[#728984] group-hover:border-[#10B981]/50 group-hover:text-[#F1F5F4] transition-all shadow-md select-none whitespace-nowrap">
              <span className="relative flex h-1.5 w-1.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#10B981]"></span>
              </span>
              <span>100% ON-DEVICE • ZERO CLOUD</span>
              <Sparkles className="w-3 h-3 text-[#10B981] opacity-70 group-hover:opacity-100 transition-opacity" />
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
