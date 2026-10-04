export type Language = 'da' | 'en';

export type HardwareCategory = 'all' | 'mac' | 'iphone' | 'hybrid' | 'benchmarks';

export type HardwareArch = 'all' | 'apple-m' | 'iphone-a' | 'npu' | 'hybrid';

export interface Article {
  id: string;
  slug: string;
  title: Record<Language, string>;
  subtitle: Record<Language, string>;
  category: HardwareCategory;
  categoryLabel: Record<Language, string>;
  hardwareArch: HardwareArch;
  hardwareLabel: string;
  hardware?: string | string[];
  readTime: Record<Language, string>;
  readingTime?: string;
  date: string;
  updated?: string;
  author: {
    name: string;
    role: Record<Language, string>;
  };
  mockupType: 'deepseek-chart' | 'coreml-vision' | 'mac-cluster' | 'runtime-comparison' | 'code-copilot' | 'whisper-audio';
  coverImage?: string;
  tags?: string[];
  primaryTag?: string;
  metrics: {
    primaryValue: string;
    primaryLabel: Record<Language, string>;
    secondaryValue: string;
    secondaryLabel: Record<Language, string>;
    systemSpec: string;
  };
  content: {
    summary: Record<Language, string>;
    sections: Array<{
      heading: Record<Language, string>;
      paragraphs: Record<Language, string[]>;
      terminalCommand?: string;
      codeSnippet?: string;
      dataPoints?: Array<{ label: Record<Language, string>; value: string }>;
    }>;
  };
}

export interface ToolItem {
  id: string;
  name: string;
  description: Record<Language, string>;
  category: 'runtime' | 'gui' | 'developer' | 'audio-vision';
  installCommand?: string;
  systemRequirement: string;
  url: string;
  githubStars?: string;
  license: string;
  recommendedFor: Record<Language, string>;
}
