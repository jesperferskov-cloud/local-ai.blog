export interface StoredPost {
  id: string;
  title: string;
  slug: string;
  date?: string;
  updated?: string;
  readingTime?: string;
  hardware?: string;
  status: 'draft' | 'published';
  category: 'mac' | 'iphone' | 'hybrid' | 'benchmarks';
  hardwareArch: 'apple-m' | 'iphone-a' | 'npu' | 'hybrid';
  hardwareLabel: string;
  tags: string[];
  primaryTag?: string;
  coverImage?: string;
  metrics: {
    primaryValue: string;
    primaryLabel: string;
    secondaryValue: string;
    secondaryLabel: string;
  };
  markdown: string;
  updatedAt: string;
  wordCount: number;
  readTime: string;
}

export const initialDraftContent: StoredPost = {
  id: 'draft-deepseek-llama',
  title: 'Kør DeepSeek R1 og Llama 3.3 lokalt på Apple Silicon uden internet',
  slug: 'koer-deepseek-r1-og-llama-33-lokalt-apple-silicon',
  date: '2025-03-05',
  readingTime: '4 min',
  hardware: 'M3 Max • 64GB',
  status: 'draft',
  category: 'mac',
  hardwareArch: 'apple-m',
  hardwareLabel: 'M3 Max / M4 Pro',
  tags: ['Apple Silicon', 'DeepSeek R1', 'Llama 3.3', 'Ollama', 'Metal', 'Privatliv'],
  metrics: {
    primaryValue: '48.2 tok/s',
    primaryLabel: 'Inferenshastighed',
    secondaryValue: '41.8 GB / 120 GB',
    secondaryLabel: 'RAM Allokering',
  },
  markdown: `# Kør DeepSeek R1 og Llama 3.3 lokalt på Apple Silicon uden internet

Med lanceringen af **DeepSeek R1** og **Llama 3.3 70B** er lokal AI på forbrugerhardware blevet en praktisk virkelighed for udviklere, forskere og organisationer, der kræver absolut databeskyttelse.

Traditionelle cloud-tjenester koster hundredvis af dollars om måneden og sender dine følsomme forespørgsler, kodebaser og dokumenter til eksterne datacentre. På Apple Silicon udnytter vi den delte **Unified Memory Architecture (UMA)**, hvor CPU og Metal GPU deler op mod 128 GB eller 192 GB RAM ved op til 800 GB/s.

---

## 1. Systemkrav og Hardwareallokering

For at afvikle en 70B parameter-model med 4-bit kvantisering (*Q4_K_M*) skal maskinen have:

- **Mac med Apple Silicon** (M2 Max, M3 Max eller M4 Pro/Max)
- **Minimum 48 GB Unified Memory** (for 32B modeller) eller **64-128 GB** (for 70B modeller)
- **macOS Sonoma 14.5+** eller **macOS Sequoia 15.2+**
- **100 GB ledig SSD-plads** til modelvægte og KV-cache

### Forøg Metal GPU Hukommelsesgrænsen

Som standard reserverer macOS op til 75% af den samlede RAM til grafikpipelinen. Kør følgende kommando i terminalen for at tillade op til 90% allokering:

\`\`\`bash
sudo sysctl iogpu.wired_mem_limit=102400
\`\`\`

---

## 2. Installation med Ollama

Ollama er den hurtigste måde at administrere og afvikle GGUF-kvantiserede modeller på:

\`\`\`bash
# Installer Ollama via Homebrew
brew install ollama

# Start baggrundsserveren
ollama serve

# Hent og kør DeepSeek R1 14B Q8
ollama run deepseek-r1:14b-q8_0
\`\`\`

---

## 3. Ydelsesmålinger (Benchmarks)

| Model variant | Kvantisering | VRAM Forbrug | Tokens / sek (M3 Max) | TTFT |
|---|---|---|---|---|
| DeepSeek R1 14B | Q8_0 | 16.2 GB | **38.4 tok/s** | 140 ms |
| DeepSeek R1 32B | Q4_K_M | 20.8 GB | **19.2 tok/s** | 210 ms |
| Llama 3.3 70B | Q4_K_M | 41.8 GB | **48.2 tok/s** | 182 ms |
| Qwen 2.5 Coder 32B | Q4_K_M | 21.0 GB | **22.5 tok/s** | 165 ms |

> **Konklusion**: Ved at anvende 4-bit kvantisering opnår vi 99% af FP16-ræsonnementsevnen med 65% mindre hukommelsesforbrug. Nul data forlader din computer.`,
  updatedAt: new Date().toISOString(),
  wordCount: 382,
  readTime: '4 min',
};

export const sampleAdminPosts: StoredPost[] = [
  initialDraftContent,
  {
    id: 'post-1',
    title: 'Frigør Kraften i Lokal AI: Din Guide til On-Device AI på Apple-Enheder',
    slug: 'frigoer-kraften-i-lokal-ai-apple-enheder',
    status: 'published',
    category: 'mac',
    hardwareArch: 'apple-m',
    hardwareLabel: 'M3 Max · 128GB',
    tags: ['Apple Silicon', 'Unified Memory', 'Llama 3', 'Ollama'],
    metrics: {
      primaryValue: '48.2 tok/s',
      primaryLabel: 'Gns. Inferenshastighed',
      secondaryValue: '41.8 GB / 120 GB',
      secondaryLabel: 'RAM Allokering',
    },
    markdown: '# Frigør Kraften i Lokal AI...',
    updatedAt: '2025-03-01T10:00:00.000Z',
    wordCount: 1450,
    readTime: '8 min',
  },
  {
    id: 'post-2',
    title: 'DeepSeek R1 på M4 Pro: 32B vs 14B Kvantisering & Tokens/sekund',
    slug: 'deepseek-r1-m4-pro-quantization-benchmark',
    status: 'published',
    category: 'benchmarks',
    hardwareArch: 'apple-m',
    hardwareLabel: 'M4 Pro · 48GB',
    tags: ['DeepSeek', 'M4 Pro', 'Kvantisering', 'Benchmarks'],
    metrics: {
      primaryValue: '38.4 tok/s',
      primaryLabel: '14B Q8 Hastighed',
      secondaryValue: '19.2 tok/s',
      secondaryLabel: '32B Q4 Hastighed',
    },
    markdown: '# DeepSeek R1 på M4 Pro...',
    updatedAt: '2025-02-24T14:30:00.000Z',
    wordCount: 980,
    readTime: '6 min',
  },
  {
    id: 'post-3',
    title: 'CoreML Vision & YOLOv11 på iPhone 16 Pro: 60 FPS Realtids-inferens',
    slug: 'coreml-vision-yolov11-iphone-16-pro',
    status: 'published',
    category: 'iphone',
    hardwareArch: 'iphone-a',
    hardwareLabel: 'A18 Pro · 16-Core ANE',
    tags: ['iPhone 16 Pro', 'CoreML', 'YOLOv11', 'Computer Vision'],
    metrics: {
      primaryValue: '8.4 ms',
      primaryLabel: 'ANE Latens pr. Billede',
      secondaryValue: '1.6 W',
      secondaryLabel: 'Strømforbrug',
    },
    markdown: '# CoreML Vision & YOLOv11...',
    updatedAt: '2025-02-18T09:15:00.000Z',
    wordCount: 840,
    readTime: '5 min',
  },
  {
    id: 'draft-2',
    title: 'Exo Distributed Cluster: Kobl M1, M2 og M3 sammen',
    slug: 'exo-distributed-cluster-mac-setup',
    status: 'draft',
    category: 'hybrid',
    hardwareArch: 'hybrid',
    hardwareLabel: 'Multi-Mac Mesh',
    tags: ['Exo', 'Klynge', 'Thunderbolt', 'Distribueret AI'],
    metrics: {
      primaryValue: '18.5 tok/s',
      primaryLabel: 'Klynge Ydelse',
      secondaryValue: '80 Gbps',
      secondaryLabel: 'Mesh Båndbredde',
    },
    markdown: '# Exo Distributed Cluster...',
    updatedAt: '2025-02-15T11:20:00.000Z',
    wordCount: 620,
    readTime: '4 min',
  },
  {
    id: 'draft-3',
    title: 'Off-line Lydtransskribering med Whisper.cpp og CoreML ANE',
    slug: 'whisper-cpp-coreml-ane-dansk',
    status: 'draft',
    category: 'iphone',
    hardwareArch: 'npu',
    hardwareLabel: 'iPad Pro M4',
    tags: ['Whisper', 'CoreML', 'ANE', 'Dansk Lyd'],
    metrics: {
      primaryValue: '12.8x RT',
      primaryLabel: 'Realtidsfaktor',
      secondaryValue: '1.4% WER',
      secondaryLabel: 'Fejlrate',
    },
    markdown: '# Off-line Lydtransskribering...',
    updatedAt: '2025-02-10T16:45:00.000Z',
    wordCount: 710,
    readTime: '4 min',
  },
];
