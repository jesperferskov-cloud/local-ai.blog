/**
 * Article Markdown Loader & Fallback Service
 * Dynamically loads [slug].en.md or [slug].md directly in Vite.
 */

// Import all markdown files eagerly as raw string contents
const markdownFiles = import.meta.glob('/content/posts/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

export interface ArticleMarkdownResult {
  slug: string;
  lang: 'da' | 'en';
  markdown: string | null;
  isFallback: boolean;
  hasEnglishVersion: boolean;
  sourceFile: string | null;
}

export interface ArticleFrontmatter {
  id?: string;
  title?: string;
  slug?: string;
  status?: string;
  category?: string;
  hardwareArch?: string;
  hardwareLabel?: string;
  hardware?: string | string[];
  date?: string;
  readingTime?: string;
  readTime?: string;
  updated?: string;
  tags?: string[];
  primaryTag?: string;
  coverImage?: string;
  wordCount?: number;
  updatedAt?: string;
  metrics?: Record<string, any>;
  [key: string]: any;
}

/**
 * Parses YAML frontmatter into a typed object and body string.
 */
export function parseFrontmatter(rawMarkdown: string): { data: ArticleFrontmatter; content: string } {
  const trimmed = rawMarkdown.trim();
  if (!trimmed.startsWith('---')) {
    return { data: {}, content: trimmed };
  }

  const match = trimmed.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    return { data: {}, content: trimmed };
  }

  const yamlContent = match[1];
  const markdownBody = match[2].trim();
  const data: ArticleFrontmatter = {};

  const lines = yamlContent.split(/\r?\n/);
  let currentKey = '';
  let inList = false;

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('#')) continue;

    // List item (e.g. - Mac Setup)
    if (trimmedLine.startsWith('- ') && inList && currentKey) {
      const item = trimmedLine.slice(2).trim().replace(/^['"]|['"]$/g, '');
      if (!Array.isArray(data[currentKey])) {
        data[currentKey] = [];
      }
      (data[currentKey] as string[]).push(item);
      continue;
    }

    const colonIdx = line.indexOf(':');
    if (colonIdx !== -1) {
      const key = line.slice(0, colonIdx).trim();
      let value = line.slice(colonIdx + 1).trim();

      if (!value) {
        currentKey = key;
        inList = true;
        data[key] = [];
      } else {
        inList = false;
        currentKey = key;
        // Strip surrounding quotes
        value = value.replace(/^['"]|['"]$/g, '');
        data[key] = value;
      }
    }
  }

  return { data, content: markdownBody };
}

/**
 * Retrieves the frontmatter metadata for a given article slug.
 */
export function getArticleFrontmatter(slug: string, lang: 'da' | 'en' = 'da'): ArticleFrontmatter | null {
  const result = loadArticleMarkdown(slug, lang);
  if (!result || !result.markdown) return null;
  const { data } = parseFrontmatter(result.markdown);
  return data;
}

/**
 * Normalizes slug and retrieves the corresponding markdown file.
 * Handles the fallback rule: if [slug].en.md is empty or missing,
 * fall back to the Danish [slug].md with isFallback: true.
 */
export function loadArticleMarkdown(slug: string, lang: 'da' | 'en'): ArticleMarkdownResult {
  const cleanSlug = slug.trim().toLowerCase();

  // Find English and Danish entries
  let enKey: string | undefined;
  let daKey: string | undefined;

  for (const key of Object.keys(markdownFiles)) {
    if (key.endsWith(`/${cleanSlug}.en.md`) || key.endsWith(`${cleanSlug}.en.md`)) {
      enKey = key;
    } else if (key.endsWith(`/${cleanSlug}.md`) || key.endsWith(`${cleanSlug}.md`)) {
      daKey = key;
    }
  }

  const enRaw = enKey ? markdownFiles[enKey] : undefined;
  const daRaw = daKey ? markdownFiles[daKey] : undefined;

  const hasEnglish = Boolean(enRaw && enRaw.trim().length > 0);

  if (lang === 'en') {
    if (hasEnglish && enRaw) {
      return {
        slug: cleanSlug,
        lang: 'en',
        markdown: enRaw.trim(),
        isFallback: false,
        hasEnglishVersion: true,
        sourceFile: enKey || null,
      };
    }

    // English version missing or empty -> fallback to Danish
    return {
      slug: cleanSlug,
      lang: 'da',
      markdown: daRaw ? daRaw.trim() : null,
      isFallback: true,
      hasEnglishVersion: false,
      sourceFile: daKey || null,
    };
  }

  // Danish requested
  return {
    slug: cleanSlug,
    lang: 'da',
    markdown: daRaw ? daRaw.trim() : null,
    isFallback: false,
    hasEnglishVersion: hasEnglish,
    sourceFile: daKey || null,
  };
}

/**
 * Strips YAML frontmatter from raw markdown string if present.
 */
export function stripFrontmatter(rawMarkdown: string): string {
  const trimmed = rawMarkdown.trim();
  if (trimmed.startsWith('---')) {
    const secondDelim = trimmed.indexOf('---', 3);
    if (secondDelim !== -1) {
      return trimmed.slice(secondDelim + 3).trim();
    }
  }
  return trimmed;
}

/**
 * Updates or injects coverImage in a markdown text's YAML frontmatter header.
 * If coverImage is null, undefined, or empty, removes the coverImage property from frontmatter.
 * If no frontmatter block exists, prepends a frontmatter header if coverImage is provided.
 */
export function updateMarkdownCoverImage(markdown: string, coverImagePath?: string | null): string {
  const trimmed = (markdown || '').trim();
  const hasFrontmatter = trimmed.startsWith('---');

  if (hasFrontmatter) {
    const secondDelim = trimmed.indexOf('---', 3);
    if (secondDelim !== -1) {
      const frontmatterContent = trimmed.slice(3, secondDelim);
      const body = trimmed.slice(secondDelim + 3).trim();

      const lines = frontmatterContent.split(/\r?\n/);
      const filtered = lines.filter((line) => !line.trim().startsWith('coverImage:'));

      if (coverImagePath && coverImagePath.trim()) {
        const cleanPath = coverImagePath.trim();
        // Insert after slug or title if present
        let insertIndex = filtered.findIndex((l) => l.trim().startsWith('slug:'));
        if (insertIndex === -1) {
          insertIndex = filtered.findIndex((l) => l.trim().startsWith('title:'));
        }
        if (insertIndex !== -1) {
          filtered.splice(insertIndex + 1, 0, `coverImage: "${cleanPath}"`);
        } else {
          filtered.push(`coverImage: "${cleanPath}"`);
        }
      }

      const newFrontmatter = filtered.join('\n').trim();
      return `---\n${newFrontmatter}\n---\n\n${body}`;
    }
  }

  if (coverImagePath && coverImagePath.trim()) {
    return `---\ncoverImage: "${coverImagePath.trim()}"\n---\n\n${trimmed}`;
  }

  return markdown;
}
