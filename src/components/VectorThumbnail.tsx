import React from 'react';
import { Article } from '../types';

export type VectorVariant = 'circuit' | 'neural' | 'cluster';

export interface VectorThumbnailProps {
  article?: Partial<Article>;
  primaryTag?: string;
  tags?: string[];
  className?: string;
}

/**
 * Resolves the vector variant based on the article's primary tag or category.
 *
 * Rules:
 *  - "Mac Setup" or "Benchmarks" (e.g. DeepSeek R1 på M4 Pro) -> 'circuit'
 *  - "iPhone AI" or "iOS" (e.g. CoreML Vision & YOLOv11)       -> 'neural'
 *  - "Hybrid Apps" or "Systemdesign" (e.g. Mac Studio Klynge) -> 'cluster'
 */
export function resolveVectorVariant(
  primaryTag?: string,
  tags?: string[],
  category?: string,
  categoryLabel?: string
): VectorVariant {
  const candidates: string[] = [];

  if (primaryTag) candidates.push(primaryTag);
  if (tags && Array.isArray(tags)) candidates.push(...tags);
  if (categoryLabel) candidates.push(categoryLabel);
  if (category) candidates.push(category);

  for (const raw of candidates) {
    const s = String(raw).toLowerCase().trim();

    // 1. iPhone AI / iOS
    if (
      s === 'iphone ai' ||
      s === 'ios' ||
      s.includes('iphone') ||
      s.includes('ios') ||
      s.includes('vision') ||
      s.includes('coreml') ||
      s.includes('yolo') ||
      s.includes('ane')
    ) {
      return 'neural';
    }

    // 2. Hybrid Apps / Systemdesign
    if (
      s === 'hybrid apps' ||
      s === 'systemdesign' ||
      s.includes('hybrid') ||
      s.includes('systemdesign') ||
      s.includes('system design') ||
      s.includes('cluster') ||
      s.includes('klynge') ||
      s.includes('distributed') ||
      s.includes('distribueret') ||
      s.includes('mesh')
    ) {
      return 'cluster';
    }

    // 3. Mac Setup / Benchmarks
    if (
      s === 'mac setup' ||
      s === 'benchmarks' ||
      s === 'benchmark' ||
      s.includes('mac') ||
      s.includes('benchmark') ||
      s.includes('m4') ||
      s.includes('m3') ||
      s.includes('m2') ||
      s.includes('silicon') ||
      s.includes('ollama') ||
      s.includes('mlx')
    ) {
      return 'circuit';
    }
  }

  return 'circuit';
}

export const VectorThumbnail: React.FC<VectorThumbnailProps> = ({
  article,
  primaryTag,
  tags,
  className = '',
}) => {
  const resolvedTags = tags || article?.tags || [];
  const resolvedPrimaryTag =
    primaryTag ||
    article?.primaryTag ||
    (resolvedTags.length > 0 ? resolvedTags[0] : undefined);

  const category = article?.category;
  const categoryLabel =
    typeof article?.categoryLabel === 'object'
      ? article.categoryLabel.da || article.categoryLabel.en
      : (article?.categoryLabel as string | undefined);

  const variant = resolveVectorVariant(
    resolvedPrimaryTag,
    resolvedTags,
    category,
    categoryLabel
  );

  return (
    <div
      className={`w-full h-full relative overflow-hidden select-none bg-transparent flex items-center justify-center ${className}`}
      data-testid="vector-thumbnail"
      data-variant={variant}
    >
      {/* Static subtle corner glow in thumbnail canvas reading CSS variable */}
      <div
        className="absolute inset-0 pointer-events-none z-0 transition-opacity duration-500"
        style={{
          background:
            'radial-gradient(120px circle at top right, var(--accent-glow), transparent 70%)',
          opacity: 'var(--halo-opacity)',
        }}
        aria-hidden="true"
      />

      {/* Dynamic ambient radial lighting for depth */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40 group-hover:opacity-75 transition-opacity duration-700 z-0"
        style={{
          background:
            variant === 'circuit'
              ? 'radial-gradient(circle at 50% 50%, var(--accent-glow) 0%, transparent 65%)'
              : variant === 'neural'
              ? 'radial-gradient(circle at 60% 48%, var(--accent-glow) 0%, transparent 65%)'
              : 'radial-gradient(circle at 50% 52%, var(--accent-glow) 0%, transparent 70%)',
          opacity: 'calc(var(--halo-opacity) * 2.2)',
        }}
      />

      {variant === 'circuit' && <CircuitVariant />}
      {variant === 'neural' && <NeuralVariant />}
      {variant === 'cluster' && <ClusterVariant />}
    </div>
  );
};

/* =========================================================================
   VARIANT 1: INTEGRATED CIRCUIT PATH ("Mac Setup" | "Benchmarks")
   Motherboard traces with micro-nodes and 3 pulsing emerald central nodes.
   Smart SVG Shift: Reads var(--border-subtle) and var(--accent-glow).
   ========================================================================= */
const CircuitVariant: React.FC = () => {
  return (
    <svg
      viewBox="0 0 400 250"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full text-[var(--text-body)] transition-all duration-500"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        {/* Soft neon emerald glow filter */}
        <filter id="circuit-neon-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Die substrate linear gradient referencing CSS variables */}
        <linearGradient id="circuit-die-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--bg-card)" />
          <stop offset="100%" stopColor="var(--bg-inner)" />
        </linearGradient>
      </defs>

      {/* Blueprint background grid */}
      <g stroke="var(--border-subtle)" strokeWidth="0.6">
        <line x1="50" y1="0" x2="50" y2="250" />
        <line x1="100" y1="0" x2="100" y2="250" />
        <line x1="150" y1="0" x2="150" y2="250" />
        <line x1="250" y1="0" x2="250" y2="250" />
        <line x1="300" y1="0" x2="300" y2="250" />
        <line x1="350" y1="0" x2="350" y2="250" />
        <line x1="0" y1="50" x2="400" y2="50" />
        <line x1="0" y1="100" x2="400" y2="100" />
        <line x1="0" y1="150" x2="400" y2="150" />
        <line x1="0" y1="200" x2="400" y2="200" />
      </g>

      {/* Corner Precision Registration Crosshairs */}
      <g stroke="var(--text-body)" strokeOpacity="0.35" strokeWidth="0.75">
        <path d="M 18 24 h 12 M 24 18 v 12" />
        <path d="M 370 24 h 12 M 376 18 v 12" />
        <path d="M 18 226 h 12 M 24 220 v 12" />
        <path d="M 370 226 h 12 M 376 220 v 12" />
      </g>

      {/* Monospace Blueprint Technical Etchings */}
      <text
        x="36"
        y="30"
        fill="var(--text-body)"
        fillOpacity="0.45"
        fontSize="7"
        fontFamily="monospace"
        letterSpacing="0.18em"
      >
        ARCH // M4-SILICON-TRACE
      </text>
      <text
        x="365"
        y="30"
        textAnchor="end"
        fill="var(--text-body)"
        fillOpacity="0.45"
        fontSize="7"
        fontFamily="monospace"
        letterSpacing="0.15em"
      >
        800 GB/S UMA BUS
      </text>
      <text
        x="36"
        y="226"
        fill="var(--text-body)"
        fillOpacity="0.38"
        fontSize="6.5"
        fontFamily="monospace"
        letterSpacing="0.16em"
      >
        INTG_CKT_REV 4.2
      </text>
      <text
        x="365"
        y="226"
        textAnchor="end"
        fill="var(--text-body)"
        fillOpacity="0.38"
        fontSize="6.5"
        fontFamily="monospace"
        letterSpacing="0.16em"
      >
        METAL SHADER KERNEL
      </text>

      {/* ========================================================= */}
      {/* MOTHERBOARD TRACE PATHS: Soft, elegant sage outline       */}
      {/* Automatically rendered using var(--border-subtle)         */}
      {/* ========================================================= */}
      <g
        stroke="var(--border-subtle)"
        strokeWidth="1.25"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="group-hover:stroke-[var(--text-body)] transition-all duration-500"
      >
        {/* West / Left Bus: 4-lane memory bus routing into center chip */}
        <path d="M 0 65 L 58 65 L 85 92 L 155 92" />
        <path d="M 0 80 L 52 80 L 80 108 L 155 108" />
        <path d="M 0 142 L 52 142 L 80 114 L 155 114" />
        <path d="M 0 170 L 62 170 L 92 140 L 155 140" />
        <path d="M 0 195 L 75 195 L 115 155 L 155 155" />

        {/* North / Top Bus: Power rails and clock trace */}
        <path d="M 170 0 L 170 42 L 182 54 L 182 80" />
        <path d="M 195 0 L 195 80" />
        <path d="M 205 0 L 205 80" />
        <path d="M 230 0 L 230 42 L 218 54 L 218 80" />

        {/* East / Right Bus: PCIe / Thunderbolt lanes */}
        <path d="M 245 92 L 315 92 L 345 62 L 400 62" />
        <path d="M 245 108 L 320 108 L 348 80 L 400 80" />
        <path d="M 245 125 L 325 125 L 355 155 L 400 155" />
        <path d="M 245 142 L 315 142 L 342 169 L 400 169" />
        <path d="M 245 158 L 305 158 L 335 188 L 400 188" />

        {/* South / Bottom Bus: High-speed differential routing */}
        <path d="M 175 250 L 175 210 L 185 200 L 185 170" />
        <path d="M 195 250 L 195 170" />
        <path d="M 205 250 L 205 170" />
        <path d="M 225 250 L 225 210 L 215 200 L 215 170" />

        {/* Serpentine tuning trace (bottom-left) */}
        <path
          d="M 60 215 L 75 215 L 75 225 L 90 225 L 90 215 L 105 215 L 105 225 L 120 225 L 120 215 L 135 215 L 145 205"
        />

        {/* Peripheral branch trace (top-right) */}
        <path d="M 285 45 L 310 45 L 325 30 L 345 30" />
      </g>

      {/* ========================================================= */}
      {/* MICRO-NODES (Copper/silicon solder joints & vias)         */}
      {/* ========================================================= */}
      <g fill="var(--text-body)" fillOpacity="0.4">
        {/* West trace via nodes */}
        <circle cx="58" cy="65" r="2" />
        <circle cx="85" cy="92" r="2" />
        <circle cx="52" cy="80" r="2" />
        <circle cx="80" cy="108" r="2" />
        <circle cx="52" cy="142" r="2" />
        <circle cx="80" cy="114" r="2" />
        <circle cx="62" cy="170" r="2" />
        <circle cx="92" cy="140" r="2" />
        <circle cx="75" cy="195" r="2" />
        <circle cx="115" cy="155" r="2" />

        {/* East trace via nodes */}
        <circle cx="315" cy="92" r="2" />
        <circle cx="345" cy="62" r="2" />
        <circle cx="320" cy="108" r="2" />
        <circle cx="348" cy="80" r="2" />
        <circle cx="325" cy="125" r="2" />
        <circle cx="355" cy="155" r="2" />
        <circle cx="315" cy="142" r="2" />
        <circle cx="342" cy="169" r="2" />
        <circle cx="305" cy="158" r="2" />
        <circle cx="335" cy="188" r="2" />

        {/* North/South via nodes */}
        <circle cx="182" cy="54" r="2" />
        <circle cx="218" cy="54" r="2" />
        <circle cx="185" cy="200" r="2" />
        <circle cx="215" cy="200" r="2" />

        {/* Peripheral via cluster */}
        <circle cx="310" cy="45" r="1.5" />
        <circle cx="325" cy="30" r="1.5" />
        <circle cx="145" cy="205" r="1.5" />
      </g>

      {/* ========================================================= */}
      {/* CENTRAL SILICON CARRIER FOOTPRINT                         */}
      {/* ========================================================= */}
      <rect
        x="155"
        y="80"
        width="90"
        height="90"
        rx="10"
        fill="url(#circuit-die-grad)"
        stroke="var(--border-subtle)"
        strokeWidth="1.2"
        className="transition-colors duration-500"
      />

      {/* Intermediate die bevel with fine dashed pattern */}
      <rect
        x="166"
        y="91"
        width="68"
        height="68"
        rx="6"
        fill="var(--bg-inner)"
        stroke="var(--border-subtle)"
        strokeWidth="0.8"
        strokeDasharray="4 2.5"
        className="transition-colors duration-500"
      />

      {/* Micro-pins surrounding the die */}
      <g stroke="var(--border-subtle)" strokeWidth="0.85">
        <line x1="172" y1="80" x2="172" y2="86" />
        <line x1="182" y1="80" x2="182" y2="86" />
        <line x1="192" y1="80" x2="192" y2="86" />
        <line x1="208" y1="80" x2="208" y2="86" />
        <line x1="218" y1="80" x2="218" y2="86" />
        <line x1="228" y1="80" x2="228" y2="86" />

        <line x1="172" y1="164" x2="172" y2="170" />
        <line x1="182" y1="164" x2="182" y2="170" />
        <line x1="192" y1="164" x2="192" y2="170" />
        <line x1="208" y1="164" x2="208" y2="170" />
        <line x1="218" y1="164" x2="218" y2="170" />
        <line x1="228" y1="164" x2="228" y2="170" />
      </g>

      {/* Micro internal circuitry inside die */}
      <g stroke="var(--border-subtle)" strokeWidth="0.6">
        <rect x="174" y="99" width="18" height="18" rx="2" />
        <rect x="208" y="99" width="18" height="18" rx="2" />
        <rect x="174" y="133" width="18" height="18" rx="2" />
        <rect x="208" y="133" width="18" height="18" rx="2" />
      </g>

      {/* ========================================================= */}
      {/* 3 CENTRAL NODES: SHINING IN RICH EMERALD var(--accent-glow)*/}
      {/* Node 1: (183, 115) | Node 2: (200, 132) | Node 3: (217, 115) */}
      {/* ========================================================= */}
      <path
        d="M 183 115 L 200 132 L 217 115"
        stroke="var(--accent-glow)"
        strokeWidth="1.3"
        strokeOpacity="0.8"
        fill="none"
        strokeLinecap="round"
        className="opacity-80 group-hover:opacity-100 transition-opacity duration-300"
      />
      <line
        x1="200"
        y1="132"
        x2="200"
        y2="148"
        stroke="var(--accent-glow)"
        strokeWidth="1"
        strokeOpacity="0.6"
        strokeDasharray="2 2"
        className="opacity-80 group-hover:opacity-100 transition-opacity duration-300"
      />

      {/* --- CENTRAL NODE 1 (183, 115) --- */}
      <g className="animate-pulse" style={{ animationDuration: '3s' }}>
        {/* Soft neon aura */}
        <circle cx="183" cy="115" r="10" fill="var(--accent-glow)" fillOpacity="0.18" />
        {/* Mid ring */}
        <circle
          cx="183"
          cy="115"
          r="5.5"
          stroke="var(--accent-glow)"
          strokeWidth="1.2"
          strokeOpacity="0.9"
          fill="var(--accent-glow)"
          fillOpacity="0.25"
        />
        {/* Neon core bead */}
        <circle
          cx="183"
          cy="115"
          r="2.8"
          fill="var(--accent-glow)"
          className="drop-shadow-[0_0_6px_var(--accent-glow)] opacity-90 group-hover:opacity-100 transition-opacity duration-300"
        />
      </g>

      {/* --- CENTRAL NODE 2 (200, 132) --- */}
      <g className="animate-pulse" style={{ animationDuration: '2.4s', animationDelay: '0.4s' }}>
        {/* Soft neon aura */}
        <circle cx="200" cy="132" r="12" fill="var(--accent-glow)" fillOpacity="0.2" />
        {/* Mid ring */}
        <circle
          cx="200"
          cy="132"
          r="6"
          stroke="var(--accent-glow)"
          strokeWidth="1.3"
          strokeOpacity="0.95"
          fill="var(--accent-glow)"
          fillOpacity="0.3"
        />
        {/* Neon core bead */}
        <circle
          cx="200"
          cy="132"
          r="3.2"
          fill="var(--accent-glow)"
          className="drop-shadow-[0_0_8px_var(--accent-glow)] opacity-95 group-hover:opacity-100 transition-opacity duration-300"
        />
      </g>

      {/* --- CENTRAL NODE 3 (217, 115) --- */}
      <g className="animate-pulse" style={{ animationDuration: '3.2s', animationDelay: '0.8s' }}>
        {/* Soft neon aura */}
        <circle cx="217" cy="115" r="10" fill="var(--accent-glow)" fillOpacity="0.18" />
        {/* Mid ring */}
        <circle
          cx="217"
          cy="115"
          r="5.5"
          stroke="var(--accent-glow)"
          strokeWidth="1.2"
          strokeOpacity="0.9"
          fill="var(--accent-glow)"
          fillOpacity="0.25"
        />
        {/* Neon core bead */}
        <circle
          cx="217"
          cy="115"
          r="2.8"
          fill="var(--accent-glow)"
          className="drop-shadow-[0_0_6px_var(--accent-glow)] opacity-90 group-hover:opacity-100 transition-opacity duration-300"
        />
      </g>
    </svg>
  );
};

/* =========================================================================
   VARIANT 2: ABSTRACT NEURAL NETWORK LAYERS ("iPhone AI" | "iOS")
   Circuit lines rendered as var(--border-subtle), active nodes as var(--accent-glow).
   ========================================================================= */
const NeuralVariant: React.FC = () => {
  const inputNodes = [
    { x: 75, y: 80, id: 'in-0' },
    { x: 75, y: 125, id: 'in-1' },
    { x: 75, y: 170, id: 'in-2' },
  ];

  const hidden1Nodes = [
    { x: 158, y: 62, id: 'h1-0' },
    { x: 158, y: 104, id: 'h1-1', active: true },
    { x: 158, y: 146, id: 'h1-2' },
    { x: 158, y: 188, id: 'h1-3' },
  ];

  const hidden2Nodes = [
    { x: 242, y: 62, id: 'h2-0' },
    { x: 242, y: 104, id: 'h2-1' },
    { x: 242, y: 146, id: 'h2-2', active: true },
    { x: 242, y: 188, id: 'h2-3' },
  ];

  const outputNodes = [
    { x: 325, y: 100, id: 'out-0', active: true },
    { x: 325, y: 150, id: 'out-1' },
  ];

  return (
    <svg
      viewBox="0 0 400 250"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full text-[var(--text-body)] transition-all duration-500"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Minimalist Abstract Blueprint Frame */}
      <rect
        x="24"
        y="20"
        width="352"
        height="210"
        rx="8"
        fill="none"
        stroke="var(--border-subtle)"
        strokeWidth="1"
      />

      {/* Frame Precision Viewfinder Corners */}
      <g stroke="var(--text-body)" strokeOpacity="0.4" strokeWidth="1">
        <path d="M 24 32 L 24 20 L 36 20" />
        <path d="M 376 32 L 376 20 L 364 20" />
        <path d="M 24 218 L 24 230 L 36 230" />
        <path d="M 376 218 L 376 230 L 364 230" />
      </g>

      {/* Sub-grid horizontal reference lines */}
      <g stroke="var(--border-subtle)" strokeWidth="0.6" strokeDasharray="3 4">
        <line x1="24" y1="62" x2="376" y2="62" />
        <line x1="24" y1="125" x2="376" y2="125" />
        <line x1="24" y1="188" x2="376" y2="188" />
        <line x1="75" y1="20" x2="75" y2="230" />
        <line x1="158" y1="20" x2="158" y2="230" />
        <line x1="242" y1="20" x2="242" y2="230" />
        <line x1="325" y1="20" x2="325" y2="230" />
      </g>

      {/* Monospace Metadata & Architectural Headers */}
      <text
        x="36"
        y="36"
        fill="var(--text-body)"
        fillOpacity="0.45"
        fontSize="7"
        fontFamily="monospace"
        letterSpacing="0.18em"
      >
        COREML // INT8 ANE GRAPH
      </text>
      <text
        x="364"
        y="36"
        textAnchor="end"
        fill="var(--text-body)"
        fillOpacity="0.45"
        fontSize="7"
        fontFamily="monospace"
        letterSpacing="0.16em"
      >
        FPS 60.0 · REALTIME
      </text>

      {/* Layer Subtitle Indicators */}
      <text
        x="75"
        y="214"
        textAnchor="middle"
        fill="var(--text-body)"
        fillOpacity="0.4"
        fontSize="6"
        fontFamily="monospace"
        letterSpacing="0.12em"
      >
        INPUT [3]
      </text>
      <text
        x="158"
        y="214"
        textAnchor="middle"
        fill="var(--text-body)"
        fillOpacity="0.4"
        fontSize="6"
        fontFamily="monospace"
        letterSpacing="0.12em"
      >
        DENSE_01
      </text>
      <text
        x="242"
        y="214"
        textAnchor="middle"
        fill="var(--text-body)"
        fillOpacity="0.4"
        fontSize="6"
        fontFamily="monospace"
        letterSpacing="0.12em"
      >
        DENSE_02
      </text>
      <text
        x="325"
        y="214"
        textAnchor="middle"
        fill="var(--text-body)"
        fillOpacity="0.4"
        fontSize="6"
        fontFamily="monospace"
        letterSpacing="0.12em"
      >
        LOGITS [2]
      </text>

      {/* ========================================================= */}
      {/* SYNAPTIC PATHS (Circuit Lines rendered via var(--border-subtle)) */}
      {/* ========================================================= */}
      <g
        stroke="var(--border-subtle)"
        strokeWidth="0.8"
        strokeDasharray="2.5 3.5"
        fill="none"
      >
        {inputNodes.map((n1) =>
          hidden1Nodes.map((n2) => (
            <line
              key={`${n1.id}-${n2.id}`}
              x1={n1.x}
              y1={n1.y}
              x2={n2.x}
              y2={n2.y}
            />
          ))
        )}

        {hidden1Nodes.map((n1) =>
          hidden2Nodes.map((n2) => (
            <line
              key={`${n1.id}-${n2.id}`}
              x1={n1.x}
              y1={n1.y}
              x2={n2.x}
              y2={n2.y}
            />
          ))
        )}

        {hidden2Nodes.map((n1) =>
          outputNodes.map((n2) => (
            <line
              key={`${n1.id}-${n2.id}`}
              x1={n1.x}
              y1={n1.y}
              x2={n2.x}
              y2={n2.y}
            />
          ))
        )}
      </g>

      {/* ========================================================= */}
      {/* ACTIVE INFERENCE PATHWAY (Rich Emerald var(--accent-glow))*/}
      {/* ========================================================= */}
      <g stroke="var(--accent-glow)" strokeWidth="1.2" strokeDasharray="3 2" fill="none" className="opacity-80 group-hover:opacity-100 transition-opacity duration-300">
        <line x1="75" y1="125" x2="158" y2="104" strokeOpacity="0.65" />
        <line x1="158" y1="104" x2="242" y2="146" strokeOpacity="0.75" />
        <line x1="242" y1="146" x2="325" y2="100" strokeOpacity="0.85" />
      </g>

      {/* ========================================================= */}
      {/* NEURAL NODES RENDERING                                    */}
      {/* ========================================================= */}
      {/* Input Layer Nodes */}
      {inputNodes.map((node) => (
        <g key={node.id}>
          <circle
            cx={node.x}
            cy={node.y}
            r="6"
            stroke="var(--border-subtle)"
            strokeWidth="1"
            fill="var(--bg-inner)"
          />
          <circle cx={node.x} cy={node.y} r="2.2" fill="var(--text-body)" fillOpacity="0.45" />
        </g>
      ))}

      {/* Hidden Layer 1 Nodes */}
      {hidden1Nodes.map((node) =>
        node.active ? (
          <g key={node.id} className="animate-pulse" style={{ animationDuration: '2.5s' }}>
            <circle cx={node.x} cy={node.y} r="10" fill="var(--accent-glow)" fillOpacity="0.18" />
            <circle
              cx={node.x}
              cy={node.y}
              r="6"
              stroke="var(--accent-glow)"
              strokeWidth="1.2"
              fill="var(--bg-inner)"
            />
            <circle cx={node.x} cy={node.y} r="2.8" fill="var(--accent-glow)" className="opacity-90 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-[0_0_6px_var(--accent-glow)]" />
          </g>
        ) : (
          <g key={node.id}>
            <circle
              cx={node.x}
              cy={node.y}
              r="5"
              stroke="var(--border-subtle)"
              strokeWidth="0.9"
              fill="var(--bg-inner)"
            />
            <circle cx={node.x} cy={node.y} r="1.8" fill="var(--text-body)" fillOpacity="0.4" />
          </g>
        )
      )}

      {/* Hidden Layer 2 Nodes */}
      {hidden2Nodes.map((node) =>
        node.active ? (
          <g key={node.id} className="animate-pulse" style={{ animationDuration: '2.8s', animationDelay: '0.3s' }}>
            <circle cx={node.x} cy={node.y} r="10" fill="var(--accent-glow)" fillOpacity="0.18" />
            <circle
              cx={node.x}
              cy={node.y}
              r="6"
              stroke="var(--accent-glow)"
              strokeWidth="1.2"
              fill="var(--bg-inner)"
            />
            <circle cx={node.x} cy={node.y} r="2.8" fill="var(--accent-glow)" className="opacity-90 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-[0_0_6px_var(--accent-glow)]" />
          </g>
        ) : (
          <g key={node.id}>
            <circle
              cx={node.x}
              cy={node.y}
              r="5"
              stroke="var(--border-subtle)"
              strokeWidth="0.9"
              fill="var(--bg-inner)"
            />
            <circle cx={node.x} cy={node.y} r="1.8" fill="var(--text-body)" fillOpacity="0.4" />
          </g>
        )
      )}

      {/* Output Layer Nodes */}
      {outputNodes.map((node) =>
        node.active ? (
          <g key={node.id} className="animate-pulse" style={{ animationDuration: '2.2s', animationDelay: '0.6s' }}>
            <circle cx={node.x} cy={node.y} r="12" fill="var(--accent-glow)" fillOpacity="0.2" />
            <circle
              cx={node.x}
              cy={node.y}
              r="7"
              stroke="var(--accent-glow)"
              strokeWidth="1.3"
              fill="var(--bg-inner)"
            />
            <circle cx={node.x} cy={node.y} r="3.2" fill="var(--accent-glow)" className="opacity-95 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-[0_0_8px_var(--accent-glow)]" />
          </g>
        ) : (
          <g key={node.id}>
            <circle
              cx={node.x}
              cy={node.y}
              r="6"
              stroke="var(--border-subtle)"
              strokeWidth="1"
              fill="var(--bg-inner)"
            />
            <circle cx={node.x} cy={node.y} r="2.2" fill="var(--text-body)" fillOpacity="0.4" />
          </g>
        )
      )}
    </svg>
  );
};

/* =========================================================================
   VARIANT 3: FUTURISTIC CLUSTER NODE DIAGRAM ("Hybrid Apps" | "Systemdesign")
   Geometric structural grids reading var(--border-subtle) and emerald beacons.
   ========================================================================= */
const ClusterVariant: React.FC = () => {
  const nodeA = { x: 200, y: 70, label: 'NODE_01' };
  const nodeB = { x: 115, y: 175, label: 'NODE_02' };
  const nodeC = { x: 285, y: 175, label: 'NODE_03' };
  const centerHub = { x: 200, y: 140 };

  return (
    <svg
      viewBox="0 0 400 250"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full text-[var(--text-body)] transition-all duration-500"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Background radial & isometric grid lines */}
      <g stroke="var(--border-subtle)" strokeWidth="0.6">
        <circle cx={centerHub.x} cy={centerHub.y} r="50" strokeDasharray="3 4" />
        <circle cx={centerHub.x} cy={centerHub.y} r="95" strokeDasharray="4 6" />
        <circle cx={centerHub.x} cy={centerHub.y} r="130" strokeDasharray="2 4" strokeOpacity="0.6" />

        <line x1="200" y1="10" x2="200" y2="240" strokeDasharray="2 3" />
        <line x1="30" y1="140" x2="370" y2="140" strokeDasharray="2 3" />
      </g>

      {/* Perimeter blueprint registration bracket */}
      <g stroke="var(--text-body)" strokeOpacity="0.3" strokeWidth="0.75">
        <path d="M 22 30 h 12 M 22 30 v 12" />
        <path d="M 378 30 h -12 M 378 30 v 12" />
        <path d="M 22 220 h 12 M 22 220 v -12" />
        <path d="M 378 220 h -12 M 378 220 v -12" />
      </g>

      {/* Cluster Metadata Typography */}
      <text
        x="36"
        y="30"
        fill="var(--text-body)"
        fillOpacity="0.45"
        fontSize="7"
        fontFamily="monospace"
        letterSpacing="0.18em"
      >
        TOPOLOGY // TB5 CLUSTER MESH
      </text>
      <text
        x="364"
        y="30"
        textAnchor="end"
        fill="var(--text-body)"
        fillOpacity="0.45"
        fontSize="7"
        fontFamily="monospace"
        letterSpacing="0.16em"
      >
        80 GBPS DUPLEX LINK
      </text>
      <text
        x="200"
        y="232"
        textAnchor="middle"
        fill="var(--text-body)"
        fillOpacity="0.4"
        fontSize="6.5"
        fontFamily="monospace"
        letterSpacing="0.18em"
      >
        AGGREGATED UMA: 384 GB · DISTRIBUTED PIPELINE
      </text>

      {/* Interconnect Bus Vectors */}
      <g stroke="var(--border-subtle)" strokeWidth="1.2" fill="none">
        <line x1={nodeA.x - 4} y1={nodeA.y + 4} x2={nodeB.x - 4} y2={nodeB.y - 4} />
        <line x1={nodeA.x + 4} y1={nodeA.y - 4} x2={nodeB.x + 4} y2={nodeB.y + 4} strokeDasharray="4 3" strokeOpacity="0.7" />

        <line x1={nodeA.x + 4} y1={nodeA.y + 4} x2={nodeC.x + 4} y2={nodeC.y - 4} />
        <line x1={nodeA.x - 4} y1={nodeA.y - 4} x2={nodeC.x - 4} y2={nodeC.y + 4} strokeDasharray="4 3" strokeOpacity="0.7" />

        <line x1={nodeB.x} y1={nodeB.y - 3} x2={nodeC.x} y2={nodeC.y - 3} />
        <line x1={nodeB.x} y1={nodeB.y + 3} x2={nodeC.x} y2={nodeC.y + 3} strokeDasharray="4 3" strokeOpacity="0.7" />

        <line x1={nodeA.x} y1={nodeA.y} x2={centerHub.x} y2={centerHub.y} strokeOpacity="0.7" />
        <line x1={nodeB.x} y1={nodeB.y} x2={centerHub.x} y2={centerHub.y} strokeOpacity="0.7" />
        <line x1={nodeC.x} y1={nodeC.y} x2={centerHub.x} y2={centerHub.y} strokeOpacity="0.7" />
      </g>

      {/* Interconnect bus micro directional chevrons */}
      <g stroke="var(--text-body)" strokeOpacity="0.5" strokeWidth="0.8" fill="none">
        <path d="M 152 118 L 157 123 L 152 128" />
        <path d="M 248 118 L 243 123 L 248 128" />
        <path d="M 195 171 L 200 175 L 195 179" />
      </g>

      {/* Centroid routing hub */}
      <g
        style={{
          transformOrigin: `${centerHub.x}px ${centerHub.y}px`,
          animation: 'spin 18s linear infinite',
        }}
      >
        <circle
          cx={centerHub.x}
          cy={centerHub.y}
          r="16"
          stroke="var(--border-subtle)"
          strokeWidth="0.85"
          strokeDasharray="3 3"
        />
        <line
          x1={centerHub.x - 12}
          y1={centerHub.y}
          x2={centerHub.x + 12}
          y2={centerHub.y}
          stroke="var(--border-subtle)"
          strokeWidth="0.75"
        />
        <line
          x1={centerHub.x}
          y1={centerHub.y - 12}
          x2={centerHub.x}
          y2={centerHub.y + 12}
          stroke="var(--border-subtle)"
          strokeWidth="0.75"
        />
      </g>

      {/* Centroid Glowing Hub Packet */}
      <g className="animate-pulse" style={{ animationDuration: '2s' }}>
        <circle cx={centerHub.x} cy={centerHub.y} r="8" fill="var(--accent-glow)" fillOpacity="0.2" />
        <circle cx={centerHub.x} cy={centerHub.y} r="3" fill="var(--accent-glow)" className="opacity-90 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-[0_0_6px_var(--accent-glow)]" />
      </g>

      {/* --- NODE A (Master / Coordinator: 200, 70) --- */}
      <g>
        <circle
          cx={nodeA.x}
          cy={nodeA.y}
          r="28"
          stroke="var(--border-subtle)"
          strokeWidth="0.85"
          strokeDasharray="5 3.5"
          style={{
            transformOrigin: `${nodeA.x}px ${nodeA.y}px`,
            animation: 'spin 28s linear infinite',
          }}
        />

        <circle
          cx={nodeA.x}
          cy={nodeA.y}
          r="18"
          stroke="var(--border-subtle)"
          strokeWidth="0.7"
          strokeDasharray="3 2"
          style={{
            transformOrigin: `${nodeA.x}px ${nodeA.y}px`,
            animation: 'spin 20s linear infinite reverse',
          }}
        />

        <circle
          cx={nodeA.x}
          cy={nodeA.y}
          r="11"
          stroke="var(--border-subtle)"
          strokeWidth="0.75"
        />

        <circle
          cx={nodeA.x}
          cy={nodeA.y}
          r="7"
          fill="var(--bg-card)"
          stroke="var(--accent-glow)"
          strokeWidth="1.2"
        />
        <circle
          cx={nodeA.x}
          cy={nodeA.y}
          r="3.5"
          fill="var(--accent-glow)"
          className="shadow-[0_0_8px_var(--accent-glow)] animate-pulse opacity-90 group-hover:opacity-100 transition-opacity duration-300"
        />

        <text
          x={nodeA.x}
          y={nodeA.y - 33}
          textAnchor="middle"
          fill="var(--text-body)"
          fillOpacity="0.5"
          fontSize="6"
          fontFamily="monospace"
          letterSpacing="0.12em"
        >
          {nodeA.label} // 192GB
        </text>
      </g>

      {/* --- NODE B (Worker Alpha: 115, 175) --- */}
      <g>
        <circle
          cx={nodeB.x}
          cy={nodeB.y}
          r="26"
          stroke="var(--border-subtle)"
          strokeWidth="0.85"
          strokeDasharray="4 3"
          style={{
            transformOrigin: `${nodeB.x}px ${nodeB.y}px`,
            animation: 'spin 22s linear infinite reverse',
          }}
        />

        <circle
          cx={nodeB.x}
          cy={nodeB.y}
          r="16"
          stroke="var(--border-subtle)"
          strokeWidth="0.7"
          strokeDasharray="2 3"
          style={{
            transformOrigin: `${nodeB.x}px ${nodeB.y}px`,
            animation: 'spin 16s linear infinite',
          }}
        />

        <circle
          cx={nodeB.x}
          cy={nodeB.y}
          r="10"
          stroke="var(--border-subtle)"
          strokeWidth="0.75"
        />

        <circle
          cx={nodeB.x}
          cy={nodeB.y}
          r="6.5"
          fill="var(--bg-card)"
          stroke="var(--accent-glow)"
          strokeWidth="1.2"
        />
        <circle
          cx={nodeB.x}
          cy={nodeB.y}
          r="3.2"
          fill="var(--accent-glow)"
          className="shadow-[0_0_8px_var(--accent-glow)] animate-pulse opacity-90 group-hover:opacity-100 transition-opacity duration-300"
          style={{ animationDelay: '0.4s' }}
        />

        <text
          x={nodeB.x}
          y={nodeB.y + 36}
          textAnchor="middle"
          fill="var(--text-body)"
          fillOpacity="0.5"
          fontSize="6"
          fontFamily="monospace"
          letterSpacing="0.12em"
        >
          {nodeB.label} // 192GB
        </text>
      </g>

      {/* --- NODE C (Worker Beta: 285, 175) --- */}
      <g>
        <circle
          cx={nodeC.x}
          cy={nodeC.y}
          r="26"
          stroke="var(--border-subtle)"
          strokeWidth="0.85"
          strokeDasharray="6 3.5"
          style={{
            transformOrigin: `${nodeC.x}px ${nodeC.y}px`,
            animation: 'spin 25s linear infinite',
          }}
        />

        <circle
          cx={nodeC.x}
          cy={nodeC.y}
          r="16"
          stroke="var(--border-subtle)"
          strokeWidth="0.7"
          strokeDasharray="3 2.5"
          style={{
            transformOrigin: `${nodeC.x}px ${nodeC.y}px`,
            animation: 'spin 18s linear infinite reverse',
          }}
        />

        <circle
          cx={nodeC.x}
          cy={nodeC.y}
          r="10"
          stroke="var(--border-subtle)"
          strokeWidth="0.75"
        />

        <circle
          cx={nodeC.x}
          cy={nodeC.y}
          r="6.5"
          fill="var(--bg-card)"
          stroke="var(--accent-glow)"
          strokeWidth="1.2"
        />
        <circle
          cx={nodeC.x}
          cy={nodeC.y}
          r="3.2"
          fill="var(--accent-glow)"
          className="shadow-[0_0_8px_var(--accent-glow)] animate-pulse opacity-90 group-hover:opacity-100 transition-opacity duration-300"
          style={{ animationDelay: '0.8s' }}
        />

        <text
          x={nodeC.x}
          y={nodeC.y + 36}
          textAnchor="middle"
          fill="var(--text-body)"
          fillOpacity="0.5"
          fontSize="6"
          fontFamily="monospace"
          letterSpacing="0.12em"
        >
          {nodeC.label} // 192GB
        </text>
      </g>
    </svg>
  );
};

export default VectorThumbnail;
