import { Article, ToolItem } from '../types';

export const featuredArticle: Article = {
  id: 'featured-1',
  slug: 'frigoer-kraften-i-lokal-ai-apple-enheder',
  title: {
    da: 'Frigør Kraften i Lokal AI: Din Guide til On-Device AI på Apple-Enheder',
    en: 'Unleash the Power of Local AI: Your Guide to On-Device AI on Apple Devices',
  },
  subtitle: {
    da: 'Lær hvordan du udnytter Apple Silicons samlede hukommelsesarkitektur og CoreML til at køre avancerede åbne modeller helt offline uden latenstid eller telemetri.',
    en: 'Learn how to leverage Apple Silicon\'s unified memory architecture and CoreML to run state-of-the-art open models completely offline without latency or telemetry.',
  },
  category: 'mac',
  categoryLabel: {
    da: 'Apple Silicon Arkitektur',
    en: 'Apple Silicon Architecture',
  },
  hardwareArch: 'apple-m',
  hardwareLabel: 'Apple Silicon M3 / M4',
  hardware: 'M3 Max • 128GB',
  primaryTag: 'Mac Setup',
  tags: ['Mac Setup', 'Apple Silicon', 'Unified Memory', 'MLX'],
  coverImage: '',
  readTime: {
    da: '6 min læsetid',
    en: '6 min read',
  },
  readingTime: '8 min',
  date: '2025-03-01',
  author: {
    name: 'Jesper',
    role: {
      da: 'Selvlært AI Entusiast',
      en: 'Self-taught AI Enthusiast',
    },
  },
  mockupType: 'deepseek-chart',
  metrics: {
    primaryValue: '48.2 tok/s',
    primaryLabel: {
      da: 'Gns. Inferenshastighed',
      en: 'Avg. Inference Speed',
    },
    secondaryValue: '41.8 GB / 120 GB',
    secondaryLabel: {
      da: 'RAM Allokering',
      en: 'RAM Allocation',
    },
    systemSpec: 'M3 Max · 128GB Unified Memory',
  },
  content: {
    summary: {
      da: 'Apples Unified Memory Architecture (UMA) har revolutioneret on-device AI. I stedet for separate VRAM-buffere som på traditionelle GPU’er, deler CPU og Metal GPU op til 128GB eller 192GB båndbredde med op til 800 GB/s. Dette gør det muligt at køre modeller som Llama 3.3 70B, DeepSeek V3/R1 og Qwen 2.5 helt lokalt på dit skrivebord.',
      en: 'Apple Unified Memory Architecture (UMA) has revolutionized on-device AI. Instead of disjointed VRAM pools, the CPU and Metal GPU share up to 128GB or 192GB memory at bandwidths exceeding 800 GB/s. This allows full local execution of 70B+ parameter models directly on your workstation.',
    },
    sections: [
      {
        heading: {
          da: '1. Hvorfor Unified Memory er en game-changer',
          en: '1. Why Unified Memory Changes Everything',
        },
        paragraphs: {
          da: [
            'Traditionelle PC-opsætninger kræver specialiserede GPU’er som NVIDIA RTX 4090 med 24 GB VRAM eller dyr server-hardware som H100 til store modeller. Når en 70B model i 4-bit kvantisering fylder 40+ GB, kan en forbruger-PC simpelthen ikke have den i grafikkortets hukommelse uden ekstremt langsom RAM-offloading.',
            'På en Mac med M3 Max eller M4 Max har hele maskinen adgang til den samlede hukommelse. En 128GB Mac kan afsætte 96-105 GB direkte til Metal GPU-computations via et simpelt sysctl-flag, hvilket tillader inferens af massive ræsonnerende modeller med mere end 45 tokens i sekundet.',
          ],
          en: [
            'Traditional desktop setups require dedicated GPUs like the RTX 4090 with 24 GB VRAM or expensive datacenter hardware. When a 70B model quantized to 4-bit consumes 40+ GB, a standard consumer PC fails without brutal CPU offloading.',
            'On an M3 Max or M4 Max Mac, the unified memory pool allows allocating up to 96-105 GB straight to the Metal GPU shaders via a sysctl command, running reasoning models at over 45 tokens per second.',
          ],
        },
        terminalCommand: 'sudo sysctl iogpu.wired_mem_limit=102400',
      },
      {
        heading: {
          da: '2. Den ideelle software-stak: Ollama og MLX',
          en: '2. The Optimal Software Stack: Ollama & MLX',
        },
        paragraphs: {
          da: [
            'For hverdagsbrugere er Ollama den mest intuitive platform, der tilbyder REST API, automatisk kvantiseringshåndtering og integration i CLI og GUI-værktøjer som Open-WebUI og Raycast.',
            'For maksimal udnyttelse af Apples hardware er Apples eget MLX-framework uovertruffet. MLX er bygget fra bunden til Swift og Python og udnytter Apples Neural Engine (ANE) og Metal Performance Shaders til at opnå op mod 15-20% højere token-rate sammenlignet med generisk CUDA-emulering.',
          ],
          en: [
            'For everyday workflows, Ollama offers an intuitive environment with a local REST API, automated quant downloading, and plugins for CLI, Raycast, and Open-WebUI.',
            'For absolute peak hardware saturation, Apple’s open-source MLX framework stands unmatched. Native to Swift and Python, it exploits Metal Performance Shaders and the Neural Engine for 15-20% higher throughput.',
          ],
        },
        terminalCommand: 'brew install ollama && ollama run llama3.3:70b-instruct-q4_K_M',
      },
      {
        heading: {
          da: '3. Kvantisering: Sweet spot mellem præcision og hastighed',
          en: '3. Quantization: The Sweet Spot Between Precision & Speed',
        },
        paragraphs: {
          da: [
            'For de fleste brugere er Q4_K_M eller Q5_K_M det optimale kompromis. MMLU-scores falder med under 0.8% sammenlignet med fuld FP16, mens hukommelsesfodaftrykket reduceres med over 65%.',
          ],
          en: [
            'For most developers and researchers, Q4_K_M or Q5_K_M is the optimal sweet spot. Benchmark perplexity degradation is under 0.8% compared to FP16, while memory footprint shrinks by more than 65%.',
          ],
        },
        dataPoints: [
          { label: { da: 'FP16 Model Størrelse', en: 'FP16 Model Footprint' }, value: '141.2 GB' },
          { label: { da: 'Q4_K_M Størrelse', en: 'Q4_K_M Footprint' }, value: '41.8 GB' },
          { label: { da: 'M3 Max Tok/s', en: 'M3 Max Tok/s' }, value: '48.2 tok/s' },
          { label: { da: 'Time to First Token', en: 'Time to First Token' }, value: '180 ms' },
        ],
      },
    ],
  },
};

export const articles: Article[] = [
  {
    id: 'art-1',
    slug: 'deepseek-r1-m4-pro-quantization-benchmark',
    title: {
      da: 'DeepSeek R1 på M4 Pro: 32B vs 14B Kvantisering & Tokens/sekund',
      en: 'DeepSeek R1 on M4 Pro: 32B vs 14B Quantization & Tokens/sec',
    },
    subtitle: {
      da: 'Omfattende benchmark af den kinesiske ræsonneringsmodel på M4 Pro med 48GB Unified Memory. Se hvor grænsen går for praktisk kode-assistance.',
      en: 'Comprehensive benchmark of the reasoning model on M4 Pro with 48GB Unified Memory. Exploring real-world programming throughput.',
    },
    category: 'benchmarks',
    categoryLabel: {
      da: 'Benchmarks',
      en: 'Benchmarks',
    },
    hardwareArch: 'apple-m',
    hardwareLabel: 'M4 Pro · 48GB RAM',
    hardware: 'M4 Pro • 48GB',
    primaryTag: 'Benchmarks',
    tags: ['Benchmarks', 'Mac Setup', 'DeepSeek', 'M4 Pro'],
    coverImage: '',
    readTime: {
      da: '6 min læsetid',
      en: '6 min read',
    },
    readingTime: '6 min',
    date: '2025-02-24',
    updated: '2025-03-02',
    author: {
      name: 'Frederik Lind',
      role: {
        da: 'Benchmark Ingeniør',
        en: 'Benchmark Engineer',
      },
    },
    mockupType: 'deepseek-chart',
    metrics: {
      primaryValue: '38.4 tok/s',
      primaryLabel: {
        da: '14B Q8 Hastighed',
        en: '14B Q8 Throughput',
      },
      secondaryValue: '19.2 tok/s',
      secondaryLabel: {
        da: '32B Q4 Hastighed',
        en: '32B Q4 Throughput',
      },
      systemSpec: 'M4 Pro 14-core · 48GB UMA',
    },
    content: {
      summary: {
        da: 'DeepSeek R1 har sat nye standarder for matematiske og logiske ræsonnementer. På en MacBook Pro med M4 Pro og 48 GB Unified Memory testede vi både 14B og 32B varianterne i Ollama og llama.cpp.',
        en: 'DeepSeek R1 set new standards in algorithmic reasoning. On an M4 Pro MacBook Pro with 48 GB Unified Memory, we evaluated the 14B and 32B variants across Ollama and llama.cpp.',
      },
      sections: [
        {
          heading: {
            da: 'Ydeevne og Hukommelsesforbrug',
            en: 'Throughput & Memory Metrics',
          },
          paragraphs: {
            da: [
              '14B-modellen med Q8_0 kvantisering kørte med imponerende 38.4 tokens i sekundet, hvilket gør den hurtigere end menneskelig læsehastighed og velegnet til interaktivt arbejde.',
              '32B-modellen med Q4_K_M rammer 19.2 tokens i sekundet med et hukommelsesforbrug på ca. 20.8 GB, hvilket efterlader masser af plads til Xcode, Docker og browser.',
            ],
            en: [
              'The 14B variant running Q8_0 reached 38.4 tokens per second, vastly outpacing human reading speed and providing zero-latency code completions.',
              'The 32B model at Q4_K_M achieved 19.2 tokens per second consuming roughly 20.8 GB, leaving ample headroom for IDEs and browser tabs.',
            ],
          },
          terminalCommand: 'ollama run deepseek-r1:14b-q8_0',
        },
      ],
    },
  },
  {
    id: 'art-2',
    slug: 'coreml-vision-yolov11-iphone-16-pro',
    title: {
      da: 'CoreML Vision & YOLOv11 på iPhone 16 Pro: 60 FPS Realtids-inferens',
      en: 'CoreML Vision & YOLOv11 on iPhone 16 Pro: 60 FPS Real-time Inference',
    },
    subtitle: {
      da: 'Sådan konverteres computer vision modeller til Apple Neural Engine (ANE) med under 2 Watt strømforbrug og nul ventetid.',
      en: 'How to convert state-of-the-art vision models to the Apple Neural Engine (ANE) with sub-2 Watt draw and zero latency.',
    },
    category: 'iphone',
    categoryLabel: {
      da: 'iPhone AI',
      en: 'iPhone AI',
    },
    hardwareArch: 'iphone-a',
    hardwareLabel: 'A18 Pro · 16-Core ANE',
    hardware: 'A18 Pro • 16-Core ANE',
    primaryTag: 'iPhone AI',
    tags: ['iPhone AI', 'iOS', 'CoreML', 'YOLOv11'],
    coverImage: '',
    readTime: {
      da: '5 min læsetid',
      en: '5 min read',
    },
    readingTime: '5 min',
    date: '2025-02-18',
    author: {
      name: 'Sofie Holm',
      role: {
        da: 'Mobile ML Specialist',
        en: 'Mobile ML Specialist',
      },
    },
    mockupType: 'coreml-vision',
    metrics: {
      primaryValue: '8.4 ms',
      primaryLabel: {
        da: 'ANE Latens pr. Billede',
        en: 'ANE Latency per Frame',
      },
      secondaryValue: '1.6 W',
      secondaryLabel: {
        da: 'Strømforbrug',
        en: 'Power Consumption',
      },
      systemSpec: 'iPhone 16 Pro · 35 TOPS ANE',
    },
    content: {
      summary: {
        da: 'Med A18 Pro og CoreML Tools 8.0 kan man køre avancerede objektdetektionsmodeller direkte i kamerastreamen på iOS uden at dræne batteriet eller overophede enheden.',
        en: 'With the A18 Pro and CoreML Tools 8.0, developers can execute state-of-the-art object detection straight inside the camera buffer without battery drain.',
      },
      sections: [
        {
          heading: {
            da: 'Kvantisering til MIL (Model Intermediate Language)',
            en: 'Quantization to MIL Pipeline',
          },
          paragraphs: {
            da: [
              'Ved at konvertere PyTorch-vægtene via CoreML Tools med INT8 per-channel kvantisering opnås 100% kørsel på Neural Engine i stedet for den batterikrævende GPU.',
            ],
            en: [
              'By converting PyTorch weights through CoreML Tools with INT8 per-channel quantization, execution is completely routed to the Neural Engine instead of the power-hungry GPU.',
            ],
          },
          terminalCommand: 'python -m coremltools.converters.mil.convert yolov11n.pt --target ios18',
        },
      ],
    },
  },
  {
    id: 'art-3',
    slug: 'mac-studio-cluster-thunderbolt-5',
    title: {
      da: 'Mac Studio Klynge: Distribueret LLM Kørsel over Thunderbolt 5',
      en: 'Mac Studio Cluster: Distributed LLM Execution over Thunderbolt 5',
    },
    subtitle: {
      da: 'Kobl to Mac Studios sammen via 80 Gbps Thunderbolt netværk og kør Llama 3 405B med 384GB samlet Unified Memory.',
      en: 'Link dual Mac Studios via 80 Gbps Thunderbolt mesh to run Llama 3 405B across 384GB aggregated Unified Memory.',
    },
    category: 'hybrid',
    categoryLabel: {
      da: 'Hybride Apps',
      en: 'Hybrid Apps',
    },
    hardwareArch: 'hybrid',
    hardwareLabel: '2x M2 Ultra · 384GB UMA',
    hardware: '2x M2 Ultra • 384GB UMA',
    primaryTag: 'Hybrid Apps',
    tags: ['Hybrid Apps', 'Systemdesign', 'Mac Studio', 'Thunderbolt 5'],
    coverImage: '',
    readTime: {
      da: '10 min læsetid',
      en: '10 min read',
    },
    readingTime: '10 min',
    date: '2025-01-20',
    author: {
      name: 'Jesper Ferskov',
      role: {
        da: 'Senior AI Hardware Arkitekt',
        en: 'Senior AI Hardware Architect',
      },
    },
    mockupType: 'mac-cluster',
    metrics: {
      primaryValue: '12.4 tok/s',
      primaryLabel: {
        da: '405B Model Hastighed',
        en: '405B Model Speed',
      },
      secondaryValue: '80 Gbps',
      secondaryLabel: {
        da: 'Interconnect Båndbredde',
        en: 'Interconnect Bandwidth',
      },
      systemSpec: 'Dual Thunderbolt 5 Link',
    },
    content: {
      summary: {
        da: 'Hvorfor bruge 250.000 kr. på en enkelt server, når to Mac Studios med M2 Ultra kan forbindes i en tensor-parallel eller pipeline-parallel klynge via Exo eller llama.cpp RPC?',
        en: 'Why invest in enterprise server clusters when two Mac Studios with M2 Ultra can be paired into a pipeline-parallel node cluster over high-speed Thunderbolt?',
      },
      sections: [
        {
          heading: {
            da: 'Opsætning med Exo Distributed Inference',
            en: 'Setup with Exo Distributed Inference',
          },
          paragraphs: {
            da: [
              'Exo opdager automatisk enheder på det lokale netværk og fordeler lagene i modellen proportionalt med maskinernes ledige hukommelse.',
            ],
            en: [
              'Exo automatically discovers nodes on the local high-speed interface, slicing transformer layers proportionately across available system memory.',
            ],
          },
          terminalCommand: 'pip install exo && exo run llama-3.3-70b --node-type worker',
        },
      ],
    },
  },
  {
    id: 'art-4',
    slug: 'mlx-vs-ollama-llama-cpp-sammenligning',
    title: {
      da: 'MLX vs. Ollama vs. llama.cpp: Hvilken Runtime Yder Mest på Apple Silicon?',
      en: 'MLX vs. Ollama vs. llama.cpp: Which Runtime Yields Peak Silicon Performance?',
    },
    subtitle: {
      da: 'En grundig sammenligning af Time to First Token (TTFT), vedvarende token-hastighed, hukommelses-overhead og udvikleroplevelse.',
      en: 'A rigorous benchmark comparing Time to First Token (TTFT), sustained throughput, memory overhead, and developer ergonomics.',
    },
    category: 'mac',
    categoryLabel: {
      da: 'Mac Opsætning',
      en: 'Mac Setup',
    },
    hardwareArch: 'apple-m',
    hardwareLabel: 'M3 Pro / M3 Max',
    hardware: 'M3 Pro / M3 Max • 36GB',
    primaryTag: 'Mac Setup',
    tags: ['Mac Setup', 'Benchmarks', 'MLX', 'Ollama'],
    coverImage: '',
    readTime: {
      da: '7 min læsetid',
      en: '7 min read',
    },
    readingTime: '7 min',
    date: '2025-01-15',
    author: {
      name: 'Mads Krog',
      role: {
        da: 'System Arkitekt',
        en: 'Systems Architect',
      },
    },
    mockupType: 'runtime-comparison',
    metrics: {
      primaryValue: '+22% tok/s',
      primaryLabel: {
        da: 'MLX fordel v. Lange Prompts',
        en: 'MLX Advantage on Long Prompts',
      },
      secondaryValue: '140 ms',
      secondaryLabel: {
        da: 'Ollama TTFT forsinkelse',
        en: 'Ollama TTFT Latency',
      },
      systemSpec: 'Metal Shaders vs GGUF Kernels',
    },
    content: {
      summary: {
        da: 'Mens Ollama og llama.cpp bruger GGUF-formatet og generiske Metal-kernels, compiller MLX direkte til Metal Shading Language med zero-copy memory buffers.',
        en: 'While Ollama and llama.cpp rely on GGUF containers and general Metal kernels, Apple MLX compiles straight to the Metal Shading Language with zero-copy buffers.',
      },
      sections: [
        {
          heading: {
            da: 'Konklusion: Hvad skal du vælge?',
            en: 'Verdict: Which Engine Fits Your Needs?',
          },
          paragraphs: {
            da: [
              'Vælg Ollama hvis du vil have "det virker bare" i Docker eller web-interfaces. Vælg MLX hvis du udvikler i Python/Swift og har brug for absolut maksimal hastighed under batching og finjustering.',
            ],
            en: [
              'Choose Ollama for instant turn-key operation and drop-in OpenAI API compatibility. Choose MLX if you write native Python/Swift applications and demand raw memory bandwidth saturation.',
            ],
          },
        },
      ],
    },
  },
  {
    id: 'art-5',
    slug: 'lokal-copilot-qwen-25-coder-vs-code',
    title: {
      da: 'Lokal Copilot i VS Code med Qwen 2.5 Coder 32B: 100% Privat Kodebase',
      en: 'Local Copilot in VS Code with Qwen 2.5 Coder 32B: 100% Private Codebase',
    },
    subtitle: {
      da: 'Guide til at konfigurere Continue.dev med lokal Ollama inferens, så din kildekode og hemmeligheder aldrig forlader dit lokale drev.',
      en: 'Step-by-step guide to configuring Continue.dev with local Ollama inference, keeping intellectual property strictly on device.',
    },
    category: 'mac',
    categoryLabel: {
      da: 'Mac Opsætning',
      en: 'Mac Setup',
    },
    hardwareArch: 'apple-m',
    hardwareLabel: 'Apple Silicon M2 / M3 / M4',
    hardware: 'M4 Pro • 24GB',
    primaryTag: 'Mac Setup',
    tags: ['Mac Setup', 'Developer', 'VS Code', 'Qwen 2.5'],
    coverImage: '',
    readTime: {
      da: '6 min læsetid',
      en: '6 min read',
    },
    readingTime: '6 min',
    date: '2025-03-02',
    author: {
      name: 'Frederik Lind',
      role: {
        da: 'Benchmark Ingeniør',
        en: 'Benchmark Engineer',
      },
    },
    mockupType: 'code-copilot',
    metrics: {
      primaryValue: '54.1 tok/s',
      primaryLabel: {
        da: 'Kode-fuldførelse Hastighed',
        en: 'Code Completion Speed',
      },
      secondaryValue: '0 KB',
      secondaryLabel: {
        da: 'Ekstern Datatrafik',
        en: 'Outbound Data Traffic',
      },
      systemSpec: 'Qwen 2.5 Coder 14B / 32B',
    },
    content: {
      summary: {
        da: 'Qwen 2.5 Coder matcher eller overgår Claude 3.5 Sonnet i flere kodningsbenchmarks. Med Continue.dev kan du bruge den som inline tab-autofill og chat direkte i VS Code.',
        en: 'Qwen 2.5 Coder benchmarks at parity with proprietary cloud models. With Continue.dev, you harness instant inline tab-completions and repository-wide context locally.',
      },
      sections: [
        {
          heading: {
            da: 'Konfiguration af Continue.dev config.yaml',
            en: 'Continue.dev YAML Setup',
          },
          paragraphs: {
            da: [
              'Tilføj Ollama som provider med 32B modellen til chat og 1.5B modellen til hurtig inline auto-completion under skrivning.',
            ],
            en: [
              'Configure Ollama as provider targeting the 32B parameter weights for architectural reasoning and 1.5B for lightning sub-20ms tab-completion.',
            ],
          },
          terminalCommand: 'ollama pull qwen2.5-coder:32b && ollama pull qwen2.5-coder:1.5b-base',
        },
      ],
    },
  },
  {
    id: 'art-6',
    slug: 'whisper-large-v3-turbo-ipad-pro-dansk',
    title: {
      da: 'Whisper Large-v3 Turbo på iPad Pro M4: Offline Tale-til-Tekst på Dansk',
      en: 'Whisper Large-v3 Turbo on iPad Pro M4: Offline Danish Speech-to-Text',
    },
    subtitle: {
      da: 'Transskriber interviews, møder og optagelser lokalt på farten med 12x realtidshastighed og under 2% fejlrate på dansk tale.',
      en: 'Transcribe confidential interviews and meetings on the go at 12x real-time speed with state-of-the-art Danish word error rates.',
    },
    category: 'iphone',
    categoryLabel: {
      da: 'iPhone & iPad AI',
      en: 'iPhone & iPad AI',
    },
    hardwareArch: 'npu',
    hardwareLabel: 'iPad Pro M4 · 38 TOPS NPU',
    hardware: 'iPad Pro M4 • 38 TOPS NPU',
    primaryTag: 'iOS',
    tags: ['iPhone AI', 'iOS', 'Whisper', 'Audio'],
    coverImage: '',
    readTime: {
      da: '4 min læsetid',
      en: '4 min read',
    },
    readingTime: '4 min',
    date: '2025-03-05',
    author: {
      name: 'Sofie Holm',
      role: {
        da: 'Mobile ML Specialist',
        en: 'Mobile ML Specialist',
      },
    },
    mockupType: 'whisper-audio',
    metrics: {
      primaryValue: '12.8x RT',
      primaryLabel: {
        da: 'Realtids Transskribering',
        en: 'Real-Time Factor',
      },
      secondaryValue: '1.4% WER',
      secondaryLabel: {
        da: 'Ordfremskrivningsfejl',
        en: 'Word Error Rate (Danish)',
      },
      systemSpec: 'Whisper.cpp + CoreML ANE',
    },
    content: {
      summary: {
        da: 'OpenAI’s Whisper Large-v3 Turbo er optimeret til lynhurtig inferens. Ved at kompilere whisper.cpp med CoreML-encoderen kan en times dansk lydoptagelse transskriberes på blot 4,5 minutter.',
        en: 'OpenAI’s Whisper Large-v3 Turbo cuts compute overhead significantly. Compiled with CoreML encoder graphs, a 60-minute Danish interview transcribes in just 4.5 minutes.',
      },
      sections: [
        {
          heading: {
            da: 'Kompilering med Metal & CoreML Acceleration',
            en: 'Compiling with Metal & CoreML Accelerators',
          },
          paragraphs: {
            da: [
              'Modellen benytter Neural Engine til mel-spektrogram beregninger og encoder-passet, mens decoderen afvikles på GPU.',
            ],
            en: [
              'The pipeline leverages the Neural Engine for mel-spectrogram feature extraction and the encoder pass, streaming the decoder onto Metal shaders.',
            ],
          },
          terminalCommand: 'git clone https://github.com/ggerganov/whisper.cpp && make clean && WHISPER_COREML=1 make -j',
        },
      ],
    },
  },
];

export const toolsDirectory: ToolItem[] = [
  {
    id: 'ollama',
    name: 'Ollama',
    description: {
      da: 'Den mest populære og brugervenlige platform til at køre Llama, DeepSeek og Qwen lokalt med én terminalkommando.',
      en: 'The industry-standard runtime to pull, run, and orchestrate open models with a lightweight CLI and REST API.',
    },
    category: 'runtime',
    installCommand: 'brew install ollama && ollama serve',
    systemRequirement: 'macOS 11+, Apple Silicon eller Intel',
    url: 'https://ollama.com',
    githubStars: '115k',
    license: 'MIT',
    recommendedFor: {
      da: 'Begyndere og web-udviklere',
      en: 'General developers and local web apps',
    },
  },
  {
    id: 'mlx',
    name: 'Apple MLX',
    description: {
      da: 'Apples officielle machine learning framework optimeret til Metal shaders og Unified Memory på M-chips.',
      en: 'Apple’s official deep learning framework architected natively for Metal Shaders and unified memory.',
    },
    category: 'developer',
    installCommand: 'pip install mlx mlx-lm',
    systemRequirement: 'macOS 14+ (Sonoma/Sequoia), Apple Silicon',
    url: 'https://github.com/ml-explore/mlx',
    githubStars: '22k',
    license: 'MIT',
    recommendedFor: {
      da: 'Forskere, fine-tuning og maksimal hastighed',
      en: 'Researchers, fine-tuning, peak speed',
    },
  },
  {
    id: 'lm-studio',
    name: 'LM Studio',
    description: {
      da: 'Smuk grafisk desktop app med indbygget Hugging Face model-browser, chat-interface og lokal server.',
      en: 'Polished native desktop GUI featuring an integrated Hugging Face catalog and OpenAI-compatible server.',
    },
    category: 'gui',
    installCommand: 'brew install --cask lm-studio',
    systemRequirement: 'macOS 13+, Windows, Linux',
    url: 'https://lmstudio.ai',
    githubStars: 'Proprietær (Gratis)',
    license: 'Freeware',
    recommendedFor: {
      da: 'Desktop brugere uden terminalbehov',
      en: 'Visual GUI workflows and rapid prompt experiments',
    },
  },
  {
    id: 'coreml-tools',
    name: 'CoreML Tools',
    description: {
      da: 'Apples konverteringsværktøj til at eksportere PyTorch og TensorFlow modeller til Apple Neural Engine (ANE).',
      en: 'Official Python package to convert PyTorch and ONNX models into accelerated CoreML .mlpackage graphs.',
    },
    category: 'developer',
    installCommand: 'pip install coremltools',
    systemRequirement: 'Python 3.9 - 3.12, macOS/Linux',
    url: 'https://apple.github.io/coremltools',
    githubStars: '4.8k',
    license: 'BSD-3',
    recommendedFor: {
      da: 'iOS / macOS app-udviklere',
      en: 'iOS & macOS native app developers',
    },
  },
  {
    id: 'whisper-cpp',
    name: 'whisper.cpp',
    description: {
      da: 'Højtydende C/C++ port af OpenAIs Whisper tale-til-tekst med fuld Metal og CoreML understøttelse.',
      en: 'High-performance C/C++ port of OpenAI Whisper speech-to-text with zero dependencies and CoreML acceleration.',
    },
    category: 'audio-vision',
    installCommand: 'brew install whisper-cpp',
    systemRequirement: 'macOS, iOS, Linux, Windows',
    url: 'https://github.com/ggerganov/whisper.cpp',
    githubStars: '38k',
    license: 'MIT',
    recommendedFor: {
      da: 'Lokal diktering og lydtransskribering',
      en: 'Zero-latency audio transcription and local dictation',
    },
  },
  {
    id: 'exo',
    name: 'Exo Distributed AI',
    description: {
      da: 'Forbind dine Macs, iPads og PCs til en fælles distribueret GPU-klynge for at køre enorme 405B modeller.',
      en: 'Cluster your Macs, iPhones, and workstations into a single distributed GPU cluster to run massive 405B models.',
    },
    category: 'runtime',
    installCommand: 'pip install exo && exo run llama-3.3-70b',
    systemRequirement: '2+ computere over LAN/Thunderbolt',
    url: 'https://github.com/exo-explore/exo',
    githubStars: '19k',
    license: 'GPL-3.0',
    recommendedFor: {
      da: 'Klynge-opsætninger og store modeller',
      en: 'Multi-device clusters & 70B-405B models',
    },
  },
];
