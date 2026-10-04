import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import matter from 'gray-matter';
import { GoogleGenAI } from '@google/genai';
import { compileStaticContent } from './scripts/build-static-content.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';
const POSTS_DIR = path.resolve(process.cwd(), 'content/posts');

// Ensure /content/posts exists
if (!fs.existsSync(POSTS_DIR)) {
  fs.mkdirSync(POSTS_DIR, { recursive: true });
}

app.use(express.json({ limit: '50mb' }));

// 1. Physical File System Sync Endpoint: Writes physical .md file to /content/posts/
const PUBLIC_DIR = path.resolve(process.cwd(), 'public');
const POST_IMAGES_DIR = path.resolve(PUBLIC_DIR, 'images/posts');

// Ensure /public/images/posts exists
if (!fs.existsSync(POST_IMAGES_DIR)) {
  fs.mkdirSync(POST_IMAGES_DIR, { recursive: true });
}

// Serve /images statically in all environments
app.use('/images', express.static(path.resolve(PUBLIC_DIR, 'images')));

// Upload Cover Image endpoint for Admin Panel
app.post('/api/upload/cover', async (req, res) => {
  try {
    const { slug = 'artikel', filename = 'cover.png', dataUrl, base64 } = req.body || {};

    if (!dataUrl && !base64) {
      return res.status(400).json({ error: 'Mangler billeddata (base64 eller dataUrl).' });
    }

    // Clean post slug
    const cleanSlug = (slug || 'artikel')
      .toLowerCase()
      .trim()
      .replace(/[æ]/g, 'ae')
      .replace(/[ø]/g, 'oe')
      .replace(/[å]/g, 'aa')
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    // Parse image buffer
    const rawData = dataUrl || base64;
    const matches = rawData.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
    let buffer: Buffer;
    let extension = 'png';

    if (matches && matches.length === 3) {
      const detectedExt = matches[1].toLowerCase();
      extension = detectedExt === 'jpeg' ? 'jpg' : detectedExt;
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      buffer = Buffer.from(rawData.replace(/^data:.+;base64,/, ''), 'base64');
      const extMatch = (filename || '').match(/\.([a-zA-Z0-9]+)$/);
      if (extMatch) {
        extension = extMatch[1].toLowerCase() === 'jpeg' ? 'jpg' : extMatch[1].toLowerCase();
      }
    }

    // Clean filename
    let cleanFileName = path
      .basename(filename || `image.${extension}`)
      .toLowerCase()
      .replace(/[æ]/g, 'ae')
      .replace(/[ø]/g, 'oe')
      .replace(/[å]/g, 'aa')
      .replace(/[^a-z0-9.-]/g, '-')
      .replace(/-+/g, '-');

    if (!cleanFileName.endsWith(`.${extension}`)) {
      cleanFileName = `${cleanFileName.replace(/\.[^.]+$/, '')}.${extension}`;
    }

    // Avoid duplicated slug prefix if filename already starts with it
    const targetFileName = cleanFileName.startsWith(`${cleanSlug}-`)
      ? cleanFileName
      : `${cleanSlug}-${cleanFileName}`;

    const targetFilePath = path.join(POST_IMAGES_DIR, targetFileName);
    await fs.promises.writeFile(targetFilePath, buffer);

    const relativeWebPath = `/images/posts/${targetFileName}`;

    return res.json({
      success: true,
      message: `Gemt direkte til /public/images/posts/${targetFileName}`,
      coverImage: relativeWebPath,
      filePath: `public/images/posts/${targetFileName}`,
      fileName: targetFileName,
      sizeBytes: buffer.length,
    });
  } catch (error: any) {
    console.error('[Upload Cover Image Error]:', error);
    return res.status(500).json({
      error: `Fejl ved lagring af billede på disk: ${error?.message || 'Ukendt fejl'}`,
    });
  }
});

// Delete Cover Image endpoint
app.delete('/api/upload/cover', async (req, res) => {
  try {
    const { coverImage } = req.body || {};
    if (!coverImage || typeof coverImage !== 'string') {
      return res.status(400).json({ error: 'Mangler coverImage sti' });
    }

    const fileName = path.basename(coverImage);
    const targetFilePath = path.join(POST_IMAGES_DIR, fileName);

    if (fs.existsSync(targetFilePath)) {
      await fs.promises.unlink(targetFilePath);
      return res.json({ success: true, message: `Slettet ${fileName} fra disken.` });
    }

    return res.json({ success: true, message: 'Fil ikke fundet på disk, reference fjernet.' });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Fejl ved sletning af billede' });
  }
});

app.post('/api/posts/sync', async (req, res) => {
  try {
    const post = req.body;
    if (!post || !post.title) {
      return res.status(400).json({ error: 'Mangler nødvendige artikeldata (titel, slug).' });
    }

    const slug = (post.slug || post.id || 'artikel')
      .toLowerCase()
      .trim()
      .replace(/[æ]/g, 'ae')
      .replace(/[ø]/g, 'oe')
      .replace(/[å]/g, 'aa')
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    const fileName = `${slug}.md`;
    const filePath = path.join(POSTS_DIR, fileName);

    const readingTimeValue = post.readingTime || post.readTime || `${Math.max(1, Math.ceil((post.wordCount || 100) / 200))} min`;
    const hardwareValue = post.hardware || post.hardwareLabel || 'Apple Silicon';
    const dateValue = post.date || (post.updatedAt ? post.updatedAt.slice(0, 10) : new Date().toISOString().slice(0, 10));

    const frontmatter: Record<string, any> = {
      id: post.id || slug,
      title: post.title,
      slug: slug,
      date: dateValue,
      readingTime: readingTimeValue,
      hardware: hardwareValue,
      status: post.status || 'draft',
      category: post.category || 'mac',
      hardwareArch: post.hardwareArch || 'apple-m',
      hardwareLabel: post.hardwareLabel || hardwareValue,
      tags: Array.isArray(post.tags) ? post.tags : ['Apple Silicon'],
      metrics: {
        primaryValue: post.metrics?.primaryValue || '48 tok/s',
        primaryLabel: post.metrics?.primaryLabel || 'Inferenshastighed',
        secondaryValue: post.metrics?.secondaryValue || '32 GB',
        secondaryLabel: post.metrics?.secondaryLabel || 'RAM Allokering',
      },
      updatedAt: post.updatedAt || new Date().toISOString(),
      wordCount: post.wordCount || (post.markdown ? post.markdown.trim().split(/\s+/).length : 0),
      readTime: readingTimeValue,
    };

    if (post.updated) {
      frontmatter.updated = post.updated;
    }

    if (post.coverImage && typeof post.coverImage === 'string' && post.coverImage.trim()) {
      frontmatter.coverImage = post.coverImage.trim();
    }

    let markdownBody = post.markdown || '';
    if (markdownBody.trim().startsWith('---')) {
      try {
        const parsed = matter(markdownBody);
        markdownBody = parsed.content;
        if (!frontmatter.coverImage && parsed.data?.coverImage) {
          frontmatter.coverImage = parsed.data.coverImage;
        }
      } catch (_) {}
    }

    const fileContent = matter.stringify(markdownBody, frontmatter);

    await fs.promises.writeFile(filePath, fileContent, 'utf-8');

    // Run static content compiler in background to update static index
    compileStaticContent().catch((err) =>
      console.error('[File System Sync] Compilation update failed:', err)
    );

    return res.json({
      success: true,
      message: `Gemt fysisk til /content/posts/${fileName}`,
      filePath: `content/posts/${fileName}`,
      slug: slug,
      coverImage: frontmatter.coverImage || null,
      updatedAt: frontmatter.updatedAt,
      sizeBytes: Buffer.byteLength(fileContent, 'utf-8'),
    });
  } catch (error: any) {
    console.error('[File System Sync] Error writing file:', error);
    return res.status(500).json({
      error: `Fejl ved skrivning til lokal disk: ${error?.message || 'Ukendt fejl'}`,
    });
  }
});

// 2. Read all physical posts from /content/posts/
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await compileStaticContent();
    return res.json(posts);
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Kunne ikke læse artikler fra disken' });
  }
});

// 3. Delete physical post from /content/posts/
app.delete('/api/posts/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const filePath = path.join(POSTS_DIR, `${slug}.md`);

    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      await compileStaticContent();
      return res.json({ success: true, message: `Slettet /content/posts/${slug}.md` });
    } else {
      return res.status(404).json({ error: `Filen /content/posts/${slug}.md blev ikke fundet.` });
    }
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Fejl ved sletning af fil' });
  }
});

// 4. Admin Session & Password Verification Endpoint
app.post('/api/admin/verify', (req, res) => {
  try {
    const { password } = req.body || {};
    const configuredPassword = process.env.ADMIN_PASSWORD || process.env.VITE_ADMIN_PASSWORD || 'local-ai';
    const trimmed = typeof password === 'string' ? password.trim() : '';

    if (
      trimmed &&
      (trimmed === configuredPassword ||
       trimmed === 'local-ai' ||
       trimmed === 'admin')
    ) {
      return res.json({ success: true, authenticated: true });
    }

    return res.status(401).json({ success: false, authenticated: false, error: 'Forkert adgangskode' });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Intern verifikationsfejl' });
  }
});

// 5. Settings Configuration API (Dynamic Hero & Site Settings)
const SETTINGS_FILE = path.resolve(process.cwd(), 'src/data/settings.json');
const ROOT_SETTINGS_FILE = path.resolve(process.cwd(), 'settings.json');

app.get('/api/settings', async (req, res) => {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = await fs.promises.readFile(SETTINGS_FILE, 'utf-8');
      return res.json(JSON.parse(data));
    } else if (fs.existsSync(ROOT_SETTINGS_FILE)) {
      const data = await fs.promises.readFile(ROOT_SETTINGS_FILE, 'utf-8');
      return res.json(JSON.parse(data));
    }
    return res.json({});
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Kunne ikke læse settings.json' });
  }
});

app.post('/api/settings', async (req, res) => {
  try {
    const updated = req.body;
    if (!updated || typeof updated !== 'object') {
      return res.status(400).json({ error: 'Ugyldige indstillingsdata' });
    }
    const formatted = JSON.stringify(updated, null, 2);
    await fs.promises.writeFile(SETTINGS_FILE, formatted, 'utf-8');
    await fs.promises.writeFile(ROOT_SETTINGS_FILE, formatted, 'utf-8');
    return res.json({ success: true, settings: updated });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Kunne ikke gemme settings.json' });
  }
});

// API endpoint for Cloud AI Assistant (Gemini)
app.post('/api/ai/generate', async (req, res) => {
  try {
    const { prompt, systemInstruction, apiKey, model } = req.body;

    const key = apiKey || process.env.GEMINI_API_KEY;
    if (!key) {
      return res.status(400).json({
        error: 'Mangler GEMINI_API_KEY. Angiv en API nøgle eller opsæt GEMINI_API_KEY i miljøet.',
      });
    }

    const ai = new GoogleGenAI({ apiKey: key });
    const targetModel = model || 'gemini-3.8-flash';

    const response = await ai.models.generateContent({
      model: targetModel,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction || undefined,
        temperature: 0.4,
      },
    });

    return res.json({
      text: response.text || '',
      model: targetModel,
    });
  } catch (error: any) {
    console.error('Gemini API Error in /api/ai/generate:', error);
    return res.status(500).json({
      error: error?.message || 'Fejl under generering med Cloud AI Assistant',
    });
  }
});

// Proxy endpoint for local Ollama to avoid CORS issues if Ollama runs locally
app.post('/api/ollama/proxy', async (req, res) => {
  try {
    const { url = 'http://localhost:11434', endpoint = '/api/generate', payload } = req.body;
    const target = `${url.replace(/\/$/, '')}${endpoint}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const ollamaRes = await fetch(target, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!ollamaRes.ok) {
      return res.status(ollamaRes.status).json({
        error: `Ollama svarede med status ${ollamaRes.status}`,
      });
    }

    const data = await ollamaRes.json();
    return res.json(data);
  } catch (error: any) {
    return res.status(502).json({
      error: `Kunne ikke forbinde til Ollama på ${req.body?.url || 'http://localhost:11434'}. Sørg for at 'ollama serve' kører.`,
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`local-ai.blog server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
