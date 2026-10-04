import React, { useState, useEffect } from 'react';
import { Play, Pause, Cpu, HardDrive, Terminal, Copy, Check, Activity, Zap } from 'lucide-react';
import { Language } from '../types';

interface HardwareTelemetryProps {
  lang: Language;
}

export const HardwareTelemetry: React.FC<HardwareTelemetryProps> = ({ lang }) => {
  const [isRunning, setIsRunning] = useState(true);
  const [tokenCount, setTokenCount] = useState(1482);
  const [currentTokSec, setCurrentTokSec] = useState(48.2);
  const [copied, setCopied] = useState(false);
  const [selectedModel, setSelectedModel] = useState<'llama70b' | 'deepseek32b' | 'qwen32b'>('llama70b');

  // Simulated live token counter & slight oscillation for realism
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setTokenCount((prev) => prev + Math.floor(Math.random() * 4) + 2);
      // Small jitter around ~48 tok/s
      setCurrentTokSec(+(47.8 + Math.random() * 0.9).toFixed(1));
    }, 120);
    return () => clearInterval(interval);
  }, [isRunning]);

  const copyCommand = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full h-full bg-neutral-950 text-neutral-100 rounded-xl p-5 md:p-6 flex flex-col justify-between border border-neutral-800 shadow-2xl relative overflow-hidden font-mono selection:bg-neutral-800 selection:text-white">
      {/* Subtle background grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* Header bar of telemetry card */}
      <div className="relative z-10 space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold tracking-wider text-neutral-200 uppercase">
              {lang === 'da' ? 'Lokal Inferens - 48 Tok/s' : 'Local Inference - 48 Tok/s'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] px-2 py-0.5 rounded border border-neutral-700 bg-neutral-900 text-neutral-300">
              Ollama 0.4.1
            </span>
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              title={isRunning ? (lang === 'da' ? 'Pause simulering' : 'Pause stream') : (lang === 'da' ? 'Start simulering' : 'Resume stream')}
            >
              {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
            </button>
          </div>
        </div>

        {/* Primary Spec Chips */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-lg p-2.5 flex items-center justify-between">
            <span className="text-neutral-400 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-neutral-300" />
              SoC
            </span>
            <span className="font-semibold text-neutral-200">M3 MAX - 128GB</span>
          </div>

          <div className="bg-neutral-900/90 border border-neutral-800 rounded-lg p-2.5 flex items-center justify-between">
            <span className="text-neutral-400 flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-neutral-300" />
              {lang === 'da' ? 'RAM Allokering' : 'RAM Allocated'}
            </span>
            <span className="font-semibold text-emerald-400">41.8 GB / 120 GB</span>
          </div>
        </div>

        {/* Unified Memory Progress Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-[11px] text-neutral-400">
            <span>Unified Memory Utilisation</span>
            <span>34.8% Active</span>
          </div>
          <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800 flex">
            <div className="h-full bg-neutral-100 transition-all duration-500" style={{ width: '34.8%' }} />
            <div className="h-full bg-neutral-700/60 transition-all duration-500" style={{ width: '12%' }} />
            <div className="h-full bg-transparent flex-1" />
          </div>
          <div className="flex justify-between text-[10px] text-neutral-500">
            <span>0 GB</span>
            <span className="text-neutral-300 font-medium">Model weights: 41.8 GB</span>
            <span>128 GB</span>
          </div>
        </div>
      </div>

      {/* Centerpiece: Real-time SVG Waveform & Tok/S Display */}
      <div className="relative z-10 py-4 my-2 border-y border-neutral-800/80">
        <div className="flex items-baseline justify-between mb-2">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-neutral-400">
              {lang === 'da' ? 'Realtids Gennemstrømning' : 'Real-time Throughput'}
            </div>
            <div className="text-3xl font-bold tracking-tight text-white flex items-baseline gap-1 mt-0.5">
              <span>{currentTokSec}</span>
              <span className="text-xs font-normal text-neutral-400">tokens/sec</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] uppercase tracking-wider text-neutral-400">
              {lang === 'da' ? 'Genererede Tokens' : 'Tokens Emitted'}
            </div>
            <div className="text-lg font-semibold text-neutral-200 tabular-nums">
              {tokenCount.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Live SVG latency sparkline */}
        <div className="h-12 w-full pt-1">
          <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 200 40">
            <defs>
              <linearGradient id="tokenGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d="M 0,25 Q 25,18 50,22 T 100,16 T 150,19 T 200,15 L 200,40 L 0,40 Z"
              fill="url(#tokenGrad)"
            />
            <path
              d="M 0,25 Q 25,18 50,22 T 100,16 T 150,19 T 200,15"
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.5"
            />
          </svg>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-neutral-900 text-[11px]">
          <div>
            <span className="text-neutral-500 block">TTFT</span>
            <span className="text-neutral-200 font-medium">182 ms</span>
          </div>
          <div>
            <span className="text-neutral-500 block">GPU Temp</span>
            <span className="text-neutral-200 font-medium">54° C (Stille)</span>
          </div>
          <div>
            <span className="text-neutral-500 block">Effekt</span>
            <span className="text-neutral-200 font-medium">38.4 Watt</span>
          </div>
        </div>
      </div>

      {/* Terminal Command bar */}
      <div className="relative z-10 pt-1">
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-lg p-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 overflow-hidden mr-2">
            <Terminal className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <code className="text-neutral-300 truncate text-[11px]">
              ollama run llama3.3:70b-instruct-q4_K_M
            </code>
          </div>
          <button
            onClick={() => copyCommand('ollama run llama3.3:70b-instruct-q4_K_M')}
            className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white transition-colors shrink-0 bg-neutral-800 hover:bg-neutral-700 px-2 py-1 rounded"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">{lang === 'da' ? 'Kopieret' : 'Copied'}</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>{lang === 'da' ? 'Kopier' : 'Copy'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
