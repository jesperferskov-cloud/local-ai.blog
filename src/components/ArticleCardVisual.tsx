import React from 'react';
import { Article } from '../types';
import { Cpu, Zap, Activity, HardDrive, Smartphone, Radio, Waves, Terminal } from 'lucide-react';

interface ArticleCardVisualProps {
  mockupType: Article['mockupType'];
  metrics: Article['metrics'];
}

export const ArticleCardVisual: React.FC<ArticleCardVisualProps> = ({ mockupType, metrics }) => {
  switch (mockupType) {
    case 'deepseek-chart':
      return (
        <div className="w-full h-44 bg-neutral-950 rounded-lg p-4 flex flex-col justify-between font-mono text-[11px] text-neutral-300 border border-neutral-800 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2">
            <span className="text-neutral-400 font-medium flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-neutral-300" />
              DeepSeek R1 Throughput
            </span>
            <span className="text-emerald-400 text-[10px] bg-neutral-900 border border-neutral-800 px-1.5 py-0.5 rounded">
              M4 Pro
            </span>
          </div>

          {/* Bar comparison graph */}
          <div className="space-y-2.5 my-auto">
            <div>
              <div className="flex justify-between text-[10px] text-neutral-400 mb-1">
                <span>14B (Q8_0)</span>
                <span className="text-neutral-100 font-semibold">38.4 tok/s · 16.2 GB</span>
              </div>
              <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden flex">
                <div className="h-full bg-white rounded-full" style={{ width: '84%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[10px] text-neutral-400 mb-1">
                <span>32B (Q4_K_M)</span>
                <span className="text-neutral-100 font-semibold">19.2 tok/s · 20.8 GB</span>
              </div>
              <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden flex">
                <div className="h-full bg-neutral-400 rounded-full" style={{ width: '46%' }} />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-neutral-500 pt-1.5 border-t border-neutral-900">
            <span>Context: 16k tokens</span>
            <span className="text-neutral-300">Peak TTFT: 140ms</span>
          </div>
        </div>
      );

    case 'coreml-vision':
      return (
        <div className="w-full h-44 bg-neutral-950 rounded-lg p-4 flex flex-col justify-between font-mono text-[11px] text-neutral-300 border border-neutral-800 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2">
            <span className="text-neutral-400 font-medium flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-neutral-300" />
              YOLOv11 on A18 Pro ANE
            </span>
            <span className="text-emerald-400 text-[10px] bg-neutral-900 border border-neutral-800 px-1.5 py-0.5 rounded">
              60.0 FPS
            </span>
          </div>

          {/* Vision radar / bounding box mockup */}
          <div className="relative h-16 bg-neutral-900/60 rounded border border-neutral-800/80 flex items-center justify-center overflow-hidden my-auto">
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:12px_12px] opacity-10" />
            <div className="border border-emerald-400/80 rounded px-2 py-0.5 text-[9px] text-emerald-300 bg-emerald-950/40 flex items-center gap-1">
              <span>Person 98.4%</span>
              <span className="text-neutral-400">· 8.4ms</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-neutral-400 pt-1.5 border-t border-neutral-900">
            <span className="text-neutral-500">ANE Latens: 8.4 ms</span>
            <span className="text-emerald-400 font-medium">1.6W Forbrug</span>
          </div>
        </div>
      );

    case 'mac-cluster':
      return (
        <div className="w-full h-44 bg-neutral-950 rounded-lg p-4 flex flex-col justify-between font-mono text-[11px] text-neutral-300 border border-neutral-800 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2">
            <span className="text-neutral-400 font-medium flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-neutral-300" />
              Thunderbolt 5 Cluster
            </span>
            <span className="text-white text-[10px] bg-neutral-900 border border-neutral-800 px-1.5 py-0.5 rounded">
              80 Gbps Link
            </span>
          </div>

          {/* Node topology visual */}
          <div className="grid grid-cols-2 gap-2 my-auto items-center">
            <div className="bg-neutral-900 border border-neutral-800 p-2 rounded text-center">
              <div className="text-[10px] text-neutral-400">Mac Studio 01</div>
              <div className="text-xs text-white font-semibold mt-0.5">192 GB UMA</div>
              <div className="text-[9px] text-neutral-500">Layers 1-40</div>
            </div>
            <div className="bg-neutral-900 border border-neutral-800 p-2 rounded text-center">
              <div className="text-[10px] text-neutral-400">Mac Studio 02</div>
              <div className="text-xs text-white font-semibold mt-0.5">192 GB UMA</div>
              <div className="text-[9px] text-neutral-500">Layers 41-80</div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-neutral-500 pt-1.5 border-t border-neutral-900">
            <span>Model: Llama-3 405B Q4</span>
            <span className="text-neutral-200 font-medium">12.4 tok/s</span>
          </div>
        </div>
      );

    case 'runtime-comparison':
      return (
        <div className="w-full h-44 bg-neutral-950 rounded-lg p-4 flex flex-col justify-between font-mono text-[11px] text-neutral-300 border border-neutral-800 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2">
            <span className="text-neutral-400 font-medium flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-neutral-300" />
              Runtime Benchmark
            </span>
            <span className="text-neutral-400 text-[10px]">M3 Max · Qwen 32B</span>
          </div>

          <div className="space-y-1.5 my-auto">
            <div className="flex items-center justify-between text-[10px]">
              <span className="w-16 text-neutral-400">MLX (Apple)</span>
              <div className="flex-1 mx-2 bg-neutral-900 h-1.5 rounded-full overflow-hidden">
                <div className="bg-white h-full" style={{ width: '92%' }} />
              </div>
              <span className="w-14 text-right text-white font-semibold">44.8 t/s</span>
            </div>

            <div className="flex items-center justify-between text-[10px]">
              <span className="w-16 text-neutral-400">Ollama</span>
              <div className="flex-1 mx-2 bg-neutral-900 h-1.5 rounded-full overflow-hidden">
                <div className="bg-neutral-400 h-full" style={{ width: '78%' }} />
              </div>
              <span className="w-14 text-right text-neutral-300">38.1 t/s</span>
            </div>

            <div className="flex items-center justify-between text-[10px]">
              <span className="w-16 text-neutral-400">llama.cpp</span>
              <div className="flex-1 mx-2 bg-neutral-900 h-1.5 rounded-full overflow-hidden">
                <div className="bg-neutral-500 h-full" style={{ width: '76%' }} />
              </div>
              <span className="w-14 text-right text-neutral-400">37.2 t/s</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-neutral-500 pt-1.5 border-t border-neutral-900">
            <span>Metal Shader Kernel</span>
            <span className="text-white">+22% MLX fordel</span>
          </div>
        </div>
      );

    case 'code-copilot':
      return (
        <div className="w-full h-44 bg-neutral-950 rounded-lg p-4 flex flex-col justify-between font-mono text-[11px] text-neutral-300 border border-neutral-800 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2">
            <span className="text-neutral-400 font-medium flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-neutral-300" />
              VS Code Inline Stream
            </span>
            <span className="text-emerald-400 text-[10px] bg-neutral-900 border border-neutral-800 px-1.5 py-0.5 rounded">
              0 KB ekstern
            </span>
          </div>

          <div className="bg-neutral-900/90 rounded p-2 text-[10px] text-neutral-400 space-y-0.5 my-auto border border-neutral-800">
            <div className="text-neutral-500">// Qwen 2.5 Coder 32B stream</div>
            <div className="text-neutral-200">
              <span className="text-neutral-400">async function</span> optimizeWeights(model) {'{'}
            </div>
            <div className="text-neutral-400 pl-3">
              const quantized = await mlx.quantize(model, 4);
            </div>
            <div className="text-neutral-500 pl-3 flex items-center gap-1">
              <span>return quantized;</span>
              <span className="w-1.5 h-3 bg-neutral-200 animate-pulse inline-block" />
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-neutral-500 pt-1.5 border-t border-neutral-900">
            <span>Latens: &lt;18ms</span>
            <span className="text-neutral-200 font-semibold">54.1 tok/s</span>
          </div>
        </div>
      );

    case 'whisper-audio':
      return (
        <div className="w-full h-44 bg-neutral-950 rounded-lg p-4 flex flex-col justify-between font-mono text-[11px] text-neutral-300 border border-neutral-800 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2">
            <span className="text-neutral-400 font-medium flex items-center gap-1.5">
              <Waves className="w-3.5 h-3.5 text-neutral-300" />
              Whisper Large-v3 Turbo
            </span>
            <span className="text-emerald-400 text-[10px] bg-neutral-900 border border-neutral-800 px-1.5 py-0.5 rounded">
              12.8x Real-Time
            </span>
          </div>

          {/* Audio waveform mockup */}
          <div className="flex items-center justify-center gap-1 h-14 my-auto px-2">
            {[4, 12, 28, 48, 22, 38, 55, 32, 16, 42, 50, 30, 18, 44, 25, 12, 6].map((h, i) => (
              <div
                key={i}
                className="w-1.5 bg-neutral-300 rounded-full transition-all"
                style={{ height: `${h}%`, opacity: i % 2 === 0 ? 0.9 : 0.6 }}
              />
            ))}
          </div>

          <div className="flex items-center justify-between text-[10px] text-neutral-500 pt-1.5 border-t border-neutral-900">
            <span>Dansk Lydmodel</span>
            <span className="text-neutral-200 font-medium">1.4% WER Fejlrate</span>
          </div>
        </div>
      );

    default:
      return null;
  }
};
