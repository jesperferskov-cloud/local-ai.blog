import React, { useState } from 'react';
import {
  AssistantMode,
  executeAssistantRequest,
  calculateQuantizationMemory,
  AssistantResponse,
} from '../../services/aiAssistantService';
import {
  Sparkles,
  Bot,
  Cloud,
  HardDrive,
  Cpu,
  Layers,
  Wand2,
  Search,
  Calculator,
  ArrowRight,
  Copy,
  Check,
  RefreshCw,
  Send,
  X,
  AlertCircle,
  Sliders,
  CheckCircle2,
} from 'lucide-react';

interface AIAssistantSidepanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentTitle: string;
  currentContent: string;
  currentTags: string[];
  onAppendContent: (text: string) => void;
  onReplaceContent: (text: string) => void;
  isDark: boolean;
}

export const AIAssistantSidepanel: React.FC<AIAssistantSidepanelProps> = ({
  isOpen,
  onClose,
  currentTitle,
  currentContent,
  currentTags,
  onAppendContent,
  onReplaceContent,
  isDark,
}) => {
  const [mode, setMode] = useState<AssistantMode>('local');
  const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434');
  const [ollamaModel, setOllamaModel] = useState('llama3.2');
  const [cloudApiKey, setCloudApiKey] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');

  // Quantization Calculator inputs
  const [quantModelB, setQuantModelB] = useState<number>(32);
  const [quantFormat, setQuantFormat] = useState<'FP16' | 'Q8_0' | 'Q5_K_M' | 'Q4_K_M' | 'Q3_K_M'>('Q4_K_M');
  const [quantContextK, setQuantContextK] = useState<number>(16);

  // Execution state
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<AssistantResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleAction = async (actionType: 'outline' | 'improve' | 'seo' | 'quant_calc' | 'custom') => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await executeAssistantRequest({
        mode,
        actionType,
        customPrompt,
        currentTitle,
        currentContent,
        currentTags,
        ollamaUrl,
        ollamaModel,
        cloudApiKey: cloudApiKey.trim() || undefined,
        quantParams: {
          modelSizeB: quantModelB,
          quantFormat: quantFormat,
          contextLengthK: quantContextK,
        },
      });

      setResponse(res);
    } catch (err: any) {
      setError(err?.message || 'Fejl under udførelse af AI-anmodning.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyResponse = () => {
    if (!response) return;
    navigator.clipboard.writeText(response.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAppend = () => {
    if (!response) return;
    onAppendContent(`\n\n${response.content}`);
  };

  const handleReplace = () => {
    if (!response) return;
    if (window.confirm('Er du sikker på, at du vil erstatte hele det aktuelle markdown-indhold?')) {
      onReplaceContent(response.content);
    }
  };

  // Live calculation for preview inside the calculator tab
  const liveCalc = calculateQuantizationMemory(quantModelB, quantFormat, quantContextK);

  return (
    <aside
      className={`w-full lg:w-[430px] flex-shrink-0 border-l flex flex-col h-full overflow-hidden transition-colors ${
        isDark
          ? 'bg-neutral-950 border-neutral-800 text-neutral-100'
          : 'bg-white border-neutral-200 text-neutral-900'
      }`}
    >
      {/* Panel Top Header */}
      <div
        className={`p-4 border-b flex items-center justify-between ${
          isDark ? 'border-neutral-800 bg-neutral-900/60' : 'border-neutral-200 bg-neutral-50'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shadow-xs ${
              isDark ? 'bg-neutral-900 text-white border border-neutral-800' : 'bg-neutral-900 text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
              AI Redaktør Assistent
            </h3>
            <p className="text-[11px] text-neutral-500 font-medium">
              Human-in-the-Loop teknisk medforfatter
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className={`p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 transition-colors cursor-pointer ${
            isDark ? 'hover:bg-neutral-800 hover:text-white' : 'hover:bg-neutral-200'
          }`}
          title="Luk assistent panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Mode Switcher: Local Assistant (Ollama) vs Cloud Assistant (Gemini) */}
      <div
        className={`p-4 border-b space-y-3 ${
          isDark ? 'border-neutral-800 bg-neutral-950' : 'border-neutral-200 bg-white'
        }`}
      >
        <div
          className={`grid grid-cols-2 gap-1.5 p-1 rounded-lg text-xs font-medium border ${
            isDark
              ? 'bg-neutral-900 border-neutral-800'
              : 'bg-neutral-100 border-neutral-200'
          }`}
        >
          <button
            onClick={() => setMode('local')}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md transition-all cursor-pointer ${
              mode === 'local'
                ? isDark
                  ? 'bg-neutral-800 text-white shadow-xs font-semibold'
                  : 'bg-white text-neutral-900 shadow-xs font-semibold'
                : isDark
                ? 'text-neutral-400 hover:text-white'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5 text-emerald-500" />
            <span>Local Assistant</span>
          </button>

          <button
            onClick={() => setMode('cloud')}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md transition-all cursor-pointer ${
              mode === 'cloud'
                ? isDark
                  ? 'bg-neutral-800 text-white shadow-xs font-semibold'
                  : 'bg-white text-neutral-900 shadow-xs font-semibold'
                : isDark
                ? 'text-neutral-400 hover:text-white'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Cloud className="w-3.5 h-3.5 text-indigo-500" />
            <span>Cloud Assistant</span>
          </button>
        </div>

        {/* Engine Settings based on selected mode */}
        {mode === 'local' ? (
          <div
            className={`text-xs space-y-2 p-3 rounded-xl border ${
              isDark
                ? 'bg-neutral-900/60 border-neutral-800 text-neutral-300'
                : 'bg-neutral-50 border-neutral-200 text-neutral-700'
            }`}
          >
            <div className="flex items-center justify-between font-mono text-[11px]">
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Ollama Aktiv
              </span>
              <span className="text-neutral-400">Zero-Cloud / On-Device</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 block mb-1">
                  Endpoint
                </label>
                <input
                  type="text"
                  value={ollamaUrl}
                  onChange={(e) => setOllamaUrl(e.target.value)}
                  className={`w-full text-xs font-mono rounded-lg px-2.5 py-1.5 border transition-colors shadow-xs ${
                    isDark
                      ? 'bg-neutral-950 border-neutral-800 text-neutral-200'
                      : 'bg-white border-neutral-300 text-neutral-900'
                  }`}
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 block mb-1">
                  Model
                </label>
                <select
                  value={ollamaModel}
                  onChange={(e) => setOllamaModel(e.target.value)}
                  className={`w-full text-xs font-mono rounded-lg px-2.5 py-1.5 border transition-colors shadow-xs cursor-pointer ${
                    isDark
                      ? 'bg-neutral-950 border-neutral-800 text-neutral-200'
                      : 'bg-white border-neutral-300 text-neutral-900'
                  }`}
                >
                  <option value="llama3.2">llama3.2 (3B)</option>
                  <option value="llama3.3:70b">llama3.3 (70B)</option>
                  <option value="deepseek-r1:14b">deepseek-r1 (14B)</option>
                  <option value="qwen2.5-coder:32b">qwen2.5-coder (32B)</option>
                  <option value="mistral">mistral (7B)</option>
                </select>
              </div>
            </div>
          </div>
        ) : (
          <div
            className={`text-xs space-y-2 p-3 rounded-xl border ${
              isDark
                ? 'bg-neutral-900/60 border-neutral-800 text-neutral-300'
                : 'bg-neutral-50 border-neutral-200 text-neutral-700'
            }`}
          >
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                Cloud Engine:
              </span>
              <span className="font-mono text-neutral-500">Gemini 3.8 Flash</span>
            </div>

            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 block mb-1">
                API Nøgle (valgfri / bruger server-miljø)
              </label>
              <input
                type="password"
                value={cloudApiKey}
                onChange={(e) => setCloudApiKey(e.target.value)}
                placeholder="Indtast Google AI nøgle..."
                className={`w-full text-xs font-mono rounded-lg px-2.5 py-1.5 border transition-colors shadow-xs ${
                  isDark
                    ? 'bg-neutral-950 border-neutral-800 text-neutral-200'
                    : 'bg-white border-neutral-300 text-neutral-900'
                }`}
              />
            </div>
          </div>
        )}
      </div>

      {/* Scrollable Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* Specialized Prompt Buttons */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-2">
            Specialiserede Skrive-Prompts
          </label>
          <div className="grid grid-cols-2 gap-2.5 text-xs">
            {/* 1. Udkast Struktur */}
            <button
              onClick={() => handleAction('outline')}
              disabled={isLoading}
              className={`p-3.5 rounded-xl border text-left transition-all shadow-xs cursor-pointer group disabled:opacity-50 ${
                isDark
                  ? 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900 text-neutral-100'
                  : 'bg-white border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50/70 text-neutral-900'
              }`}
            >
              <div className="flex items-center gap-1.5 font-semibold text-xs mb-1">
                <Layers className="w-3.5 h-3.5 text-neutral-500 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors" />
                <span>Udkast Struktur</span>
              </div>
              <p className="text-[11px] text-neutral-500 leading-snug">
                Arkitektur, hardwarekrav og benchmark-tabeller
              </p>
            </button>

            {/* 2. Forbedre Sprog */}
            <button
              onClick={() => handleAction('improve')}
              disabled={isLoading}
              className={`p-3.5 rounded-xl border text-left transition-all shadow-xs cursor-pointer group disabled:opacity-50 ${
                isDark
                  ? 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900 text-neutral-100'
                  : 'bg-white border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50/70 text-neutral-900'
              }`}
            >
              <div className="flex items-center gap-1.5 font-semibold text-xs mb-1">
                <Wand2 className="w-3.5 h-3.5 text-neutral-500 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors" />
                <span>Forbedre Sprog</span>
              </div>
              <p className="text-[11px] text-neutral-500 leading-snug">
                Teknisk præcision, flow og pædagogisk tone
              </p>
            </button>

            {/* 3. Generer SEO Meta */}
            <button
              onClick={() => handleAction('seo')}
              disabled={isLoading}
              className={`p-3.5 rounded-xl border text-left transition-all shadow-xs cursor-pointer group disabled:opacity-50 ${
                isDark
                  ? 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900 text-neutral-100'
                  : 'bg-white border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50/70 text-neutral-900'
              }`}
            >
              <div className="flex items-center gap-1.5 font-semibold text-xs mb-1">
                <Search className="w-3.5 h-3.5 text-neutral-500 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors" />
                <span>Generer SEO Meta</span>
              </div>
              <p className="text-[11px] text-neutral-500 leading-snug">
                Meta title, tags og slagkraftig ingress
              </p>
            </button>

            {/* 4. Kvantiserings-beregner */}
            <button
              onClick={() => handleAction('quant_calc')}
              disabled={isLoading}
              className={`p-3.5 rounded-xl border text-left transition-all shadow-xs cursor-pointer group disabled:opacity-50 ${
                isDark
                  ? 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900 text-neutral-100'
                  : 'bg-white border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50/70 text-neutral-900'
              }`}
            >
              <div className="flex items-center gap-1.5 font-semibold text-xs mb-1">
                <Calculator className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Kvantiserings-beregner</span>
              </div>
              <p className="text-[11px] text-neutral-500 leading-snug">
                Beregn VRAM & Mac krav for {quantModelB}B {quantFormat}
              </p>
            </button>
          </div>
        </div>

        {/* Interactive Quantization Parameters Quick Adjuster */}
        <div
          className={`p-3.5 rounded-xl border space-y-3 ${
            isDark
              ? 'bg-neutral-900/60 border-neutral-800'
              : 'bg-neutral-50 border-neutral-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-neutral-900 dark:text-white">
            <span className="flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-neutral-500" />
              Kvantiserings-parametre
            </span>
            <span
              className={`font-mono text-xs font-semibold px-2 py-0.5 rounded-md ${
                isDark
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : 'bg-white text-emerald-700 border border-emerald-200 shadow-xs'
              }`}
            >
              {liveCalc.totalRequiredGB} GB RAM Påkrævet
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 block mb-1">
                Størrelse
              </span>
              <select
                value={quantModelB}
                onChange={(e) => setQuantModelB(Number(e.target.value))}
                className={`w-full text-xs font-mono rounded-lg px-2.5 py-1.5 border transition-colors shadow-xs cursor-pointer ${
                  isDark
                    ? 'bg-neutral-950 border-neutral-800 text-neutral-200'
                    : 'bg-white border-neutral-300 text-neutral-900'
                }`}
              >
                <option value={7}>7B (f.eks. Mistral)</option>
                <option value={14}>14B (f.eks. DeepSeek)</option>
                <option value={32}>32B (f.eks. Qwen)</option>
                <option value={70}>70B (f.eks. Llama 3.3)</option>
                <option value={405}>405B (Exo Cluster)</option>
              </select>
            </div>

            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 block mb-1">
                Kvantisering
              </span>
              <select
                value={quantFormat}
                onChange={(e) => setQuantFormat(e.target.value as any)}
                className={`w-full text-xs font-mono rounded-lg px-2.5 py-1.5 border transition-colors shadow-xs cursor-pointer ${
                  isDark
                    ? 'bg-neutral-950 border-neutral-800 text-neutral-200'
                    : 'bg-white border-neutral-300 text-neutral-900'
                }`}
              >
                <option value="Q4_K_M">Q4_K_M (Anbefalet)</option>
                <option value="Q5_K_M">Q5_K_M (Præcision)</option>
                <option value="Q8_0">Q8_0 (Høj kvalitet)</option>
                <option value="Q3_K_M">Q3_K_M (Kompakt)</option>
                <option value="FP16">FP16 (Fuld vægt)</option>
              </select>
            </div>

            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 block mb-1">
                Kontekst
              </span>
              <select
                value={quantContextK}
                onChange={(e) => setQuantContextK(Number(e.target.value))}
                className={`w-full text-xs font-mono rounded-lg px-2.5 py-1.5 border transition-colors shadow-xs cursor-pointer ${
                  isDark
                    ? 'bg-neutral-950 border-neutral-800 text-neutral-200'
                    : 'bg-white border-neutral-300 text-neutral-900'
                }`}
              >
                <option value={8}>8k tokens</option>
                <option value={16}>16k tokens</option>
                <option value={32}>32k tokens</option>
                <option value={64}>64k tokens</option>
                <option value={128}>128k tokens</option>
              </select>
            </div>
          </div>

          <div
            className={`p-2.5 rounded-lg border text-[11px] font-mono flex items-center justify-between ${
              isDark
                ? 'bg-neutral-950/80 border-neutral-800 text-neutral-400'
                : 'bg-white border-neutral-200 text-neutral-600 shadow-xs'
            }`}
          >
            <span>Model: {liveCalc.weightsGB} GB</span>
            <span>KV: {liveCalc.kvCacheGB} GB</span>
            <span className="font-semibold text-neutral-900 dark:text-neutral-200">
              {liveCalc.recommendedMac.split(' ')[0]}
            </span>
          </div>
        </div>

        {/* Freeform Prompt Bar */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
            Brugerdefineret Instruktion
          </label>
          <div className="relative">
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Spørg assistenten om hvad som helst vedrørende on-device AI..."
              rows={2}
              className={`w-full text-xs rounded-xl p-3 border resize-none transition-colors shadow-xs ${
                isDark
                  ? 'bg-neutral-950 border-neutral-800 text-white placeholder-neutral-500 focus:ring-1 focus:ring-neutral-700'
                  : 'bg-white border-neutral-300 text-neutral-900 placeholder-neutral-400 focus:ring-1 focus:ring-neutral-900'
              }`}
            />
            <button
              onClick={() => handleAction('custom')}
              disabled={isLoading || !customPrompt.trim()}
              className={`absolute right-2.5 bottom-3 p-1.5 rounded-lg transition-colors cursor-pointer shadow-xs disabled:opacity-30 ${
                isDark
                  ? 'bg-white text-neutral-950 hover:bg-neutral-200'
                  : 'bg-neutral-900 text-white hover:bg-neutral-800'
              }`}
              title="Kør prompt"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Loading Spinner */}
        {isLoading && (
          <div
            className={`p-6 rounded-xl border flex flex-col items-center justify-center text-center space-y-2 shadow-xs ${
              isDark
                ? 'bg-neutral-900/60 border-neutral-800'
                : 'bg-neutral-50 border-neutral-200'
            }`}
          >
            <RefreshCw className="w-6 h-6 animate-spin text-neutral-600 dark:text-neutral-400" />
            <div className="text-xs font-semibold text-neutral-900 dark:text-white">
              Genererer teknisk svar...
            </div>
            <div className="text-[11px] text-neutral-500 font-mono">
              {mode === 'local' ? `Ollama (${ollamaModel})` : 'Gemini 3.8 Flash'}
            </div>
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div className="p-3.5 rounded-xl border border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs space-y-1">
            <div className="font-semibold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              <span>Assistent Fejl</span>
            </div>
            <p className="text-[11px] leading-relaxed">{error}</p>
          </div>
        )}

        {/* Generated Response Output Box */}
        {response && !isLoading && (
          <div
            className={`rounded-xl border overflow-hidden shadow-xs ${
              isDark
                ? 'bg-neutral-900 border-neutral-800'
                : 'bg-white border-neutral-200'
            }`}
          >
            {/* Header info bar */}
            <div
              className={`p-2.5 border-b text-[11px] font-mono flex items-center justify-between ${
                isDark
                  ? 'bg-neutral-950 border-neutral-800 text-neutral-400'
                  : 'bg-neutral-50 border-neutral-200 text-neutral-600'
              }`}
            >
              <span className="truncate max-w-[200px] font-medium">{response.model}</span>
              <span>{response.executionTimeMs}ms · ~{response.tokensEstimated} tokens</span>
            </div>

            {/* Content preview */}
            <div
              className={`p-4 max-h-72 overflow-y-auto font-mono text-xs leading-relaxed whitespace-pre-wrap select-text ${
                isDark ? 'text-neutral-200 bg-neutral-950/60' : 'text-neutral-900 bg-white'
              }`}
            >
              {response.content}
            </div>

            {/* "Insert into Editor" Action Buttons */}
            <div
              className={`p-3 border-t flex flex-wrap items-center gap-2 ${
                isDark
                  ? 'bg-neutral-950 border-neutral-800'
                  : 'bg-neutral-50 border-neutral-200'
              }`}
            >
              <button
                onClick={handleAppend}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95 ${
                  isDark
                    ? 'bg-white text-neutral-950 hover:bg-neutral-200'
                    : 'bg-neutral-900 text-white hover:bg-neutral-800'
                }`}
              >
                <span>Indsæt i Editor (Tilføj)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleReplace}
                className={`py-2 px-3 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                  isDark
                    ? 'border-neutral-700 hover:bg-neutral-800 text-neutral-200'
                    : 'bg-white border-neutral-300 hover:bg-neutral-100 text-neutral-800'
                }`}
                title="Erstat hele artiklens tekst med dette svar"
              >
                Erstat
              </button>

              <button
                onClick={copyResponse}
                className={`py-2 px-2.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                  isDark
                    ? 'border-neutral-700 hover:bg-neutral-800 text-neutral-200'
                    : 'bg-white border-neutral-300 hover:bg-neutral-100 text-neutral-800'
                }`}
                title="Kopier til udklipsholder"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </aside>
  );
};
