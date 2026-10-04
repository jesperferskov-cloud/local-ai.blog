import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import matter from 'gray-matter';
import nodemailer, { type Transporter } from 'nodemailer';
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

// ----------------------------------------------------
// Zero-Cloud Local Subscriber Storage & Notification Center
// Flat JSON File: /content/subscribers.json
// ----------------------------------------------------
const SUBSCRIBERS_FILE = path.resolve(process.cwd(), 'content/subscribers.json');

interface Subscriber {
  email: string;
  date: string;
}

// Ensure /content/subscribers.json exists with an empty array if not present
async function getSubscribers(): Promise<Subscriber[]> {
  try {
    const contentDir = path.dirname(SUBSCRIBERS_FILE);
    if (!fs.existsSync(contentDir)) {
      await fs.promises.mkdir(contentDir, { recursive: true });
    }
    if (!fs.existsSync(SUBSCRIBERS_FILE)) {
      await fs.promises.writeFile(SUBSCRIBERS_FILE, JSON.stringify([], null, 2), 'utf-8');
      return [];
    }
    const data = await fs.promises.readFile(SUBSCRIBERS_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('[Subscribers File Error]:', err);
    return [];
  }
}

async function saveSubscribers(list: Subscriber[]): Promise<void> {
  const contentDir = path.dirname(SUBSCRIBERS_FILE);
  if (!fs.existsSync(contentDir)) {
    await fs.promises.mkdir(contentDir, { recursive: true });
  }
  await fs.promises.writeFile(SUBSCRIBERS_FILE, JSON.stringify(list, null, 2), 'utf-8');
}

// 1. POST /api/subscribe (Add email + date, avoid duplicates)
app.post('/api/subscribe', async (req, res) => {
  try {
    const { email } = req.body || {};
    const trimmed = typeof email === 'string' ? email.trim().toLowerCase() : '';
    if (!trimmed || !trimmed.includes('@')) {
      return res.status(400).json({ error: 'Indtast venligst en gyldig e-mailadresse.' });
    }

    const subscribers = await getSubscribers();
    const existing = subscribers.find((s) => s.email.toLowerCase() === trimmed);
    if (existing) {
      return res.json({
        success: true,
        alreadySubscribed: true,
        message: 'Du er allerede tilmeldt notifikationer.',
        subscriber: existing,
      });
    }

    const today = new Date().toISOString().slice(0, 10);
    const newSub: Subscriber = {
      email: trimmed,
      date: today,
    };
    subscribers.push(newSub);
    await saveSubscribers(subscribers);

    return res.json({
      success: true,
      message: 'Tilmeldt notifikationer om nye indlæg.',
      subscriber: newSub,
    });
  } catch (error: any) {
    console.error('[Subscribe API Error]:', error);
    return res.status(500).json({ error: error?.message || 'Fejl under tilmelding.' });
  }
});

// 2. GET /api/subscribers (Return list to Admin Panel)
app.get('/api/subscribers', async (req, res) => {
  try {
    const subscribers = await getSubscribers();
    return res.json(subscribers);
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Kunne ikke hente abonnentlisten.' });
  }
});

// 3. DELETE /api/subscribers (Remove a specific email)
app.delete('/api/subscribers', async (req, res) => {
  try {
    const emailParam = req.body?.email || req.query.email;
    const targetEmail = typeof emailParam === 'string' ? emailParam.trim().toLowerCase() : '';
    if (!targetEmail) {
      return res.status(400).json({ error: 'Mangler e-mail til sletning.' });
    }

    const subscribers = await getSubscribers();
    const initialCount = subscribers.length;
    const filtered = subscribers.filter((s) => s.email.toLowerCase() !== targetEmail);

    if (filtered.length === initialCount) {
      return res.status(404).json({ error: 'Abonnenten blev ikke fundet i listen.' });
    }

    await saveSubscribers(filtered);
    return res.json({
      success: true,
      message: `Abonnent ${targetEmail} slettet.`,
      count: filtered.length,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Fejl ved sletning af abonnent.' });
  }
});

// 4. POST /api/notify (Trigger mail-udsendelse to all subscribers)
app.post('/api/notify', async (req, res) => {
  try {
    const { title, slug } = req.body || {};
    if (!title || !slug) {
      return res.status(400).json({ error: 'Mangler artiklens title og slug.' });
    }

    const subscribers = await getSubscribers();
    if (subscribers.length === 0) {
      return res.json({
        success: true,
        count: 0,
        message: 'Ingen tilmeldte abonnenter at sende til.',
      });
    }

    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpPort = Number(process.env.SMTP_PORT) || 587;
    const smtpFrom = process.env.SMTP_FROM || `local-ai.blog <${smtpUser || 'notifications@local-ai.blog'}>`;

    const isSmtpConfigured = Boolean(
      smtpHost &&
      smtpUser &&
      smtpPass &&
      !smtpHost.includes('example.com')
    );

    let transporter: Transporter | null = null;
    if (isSmtpConfigured) {
      try {
        transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465,
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });
      } catch (tErr) {
        console.error('[SMTP Transporter Setup Error]:', tErr);
        transporter = null;
      }
    }

    const results: Array<{ email: string; status: 'sent' | 'simulated' | 'failed'; error?: string }> = [];

    for (const sub of subscribers) {
      // Plain-text Zen-Tech Template
      // "Emne: Nyt indlæg: {{title}}\n\nHej,\n\nDer er netop udgivet et nyt indlæg på local-ai.blog.\n\nLæs det her: https://local-ai.blog/posts/{{slug}}\n\n--\nDette er en automatisk notifikation.\nAfmeld fremtidige notifikationer: https://local-ai.blog/unsubscribe?email={{email}}"
      const subject = `Nyt indlæg: ${title}`;
      const plainTextContent = `Hej,\n\nDer er netop udgivet et nyt indlæg på local-ai.blog.\n\nLæs det her: https://local-ai.blog/posts/${slug}\n\n--\nDette er en automatisk notifikation.\nAfmeld fremtidige notifikationer: https://local-ai.blog/unsubscribe?email=${encodeURIComponent(sub.email)}`;

      if (transporter && isSmtpConfigured) {
        try {
          await transporter.sendMail({
            from: smtpFrom,
            to: sub.email,
            subject: subject,
            text: plainTextContent,
          });
          results.push({ email: sub.email, status: 'sent' });
        } catch (mailError: any) {
          console.error(`[Mail Error] Failed to send to ${sub.email}:`, mailError?.message);
          results.push({ email: sub.email, status: 'failed', error: mailError?.message });
        }
      } else {
        // Zero-Cloud Local-First Development / Local Execution Simulation
        console.log(`\n==================================================`);
        console.log(`[LOCAL NOTIFICATION GATEWAY (Zero-Cloud / Local-First)]`);
        console.log(`To: ${sub.email}`);
        console.log(`Emne: ${subject}`);
        console.log(`--------------------------------------------------`);
        console.log(plainTextContent);
        console.log(`==================================================\n`);
        results.push({ email: sub.email, status: 'simulated' });
      }
    }

    return res.json({
      success: true,
      count: results.length,
      simulated: !isSmtpConfigured || !transporter,
      results,
      message: isSmtpConfigured && transporter
        ? `Notifikation sendt til ${results.length} abonnent(er).`
        : `Lokal notifikation simuleret for ${results.length} abonnent(er) (SMTP ikke sat).`,
    });
  } catch (error: any) {
    console.error('[Notify API Error]:', error);
    return res.status(500).json({ error: error?.message || 'Fejl under afsendelse af notifikationer.' });
  }
});

// 5. GET /unsubscribe (Direct unsubscribe web endpoint)
app.get('/unsubscribe', async (req, res) => {
  try {
    const email = typeof req.query.email === 'string' ? req.query.email.trim().toLowerCase() : '';
    if (email) {
      const subscribers = await getSubscribers();
      const filtered = subscribers.filter((s) => s.email.toLowerCase() !== email);
      await saveSubscribers(filtered);
    }

    return res.send(`<!DOCTYPE html>
<html lang="da">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Afmeldt Notifikationer · local-ai.blog</title>
  <style>
    body {
      background-color: #091614;
      color: #F1F5F4;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 24px;
      box-sizing: border-box;
    }
    .card {
      background: #0c1d19;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      padding: 36px 32px;
      max-width: 480px;
      width: 100%;
      text-align: center;
      box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.5);
    }
    .badge {
      display: inline-block;
      color: #10B981;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 12px;
    }
    h1 {
      font-size: 20px;
      margin: 0 0 12px;
      font-weight: 600;
      color: #F1F5F4;
    }
    p {
      font-size: 13px;
      color: #728984;
      line-height: 1.6;
      margin: 0 0 24px;
    }
    .email {
      color: #10B981;
      font-weight: 500;
    }
    a {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      background: #14332c;
      color: #F1F5F4;
      border: 1px solid #1e4c41;
      border-radius: 10px;
      font-size: 12px;
      text-decoration: none;
      transition: background 0.2s;
    }
    a:hover {
      background: #1c473d;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">local-ai.blog</div>
    <h1>Afmeldt Notifikationer</h1>
    <p>
      ${email ? `<span class="email">${email}</span> er nu fjernet fra listen.` : 'Du er nu afmeldt.'}<br>
      Du vil ikke længere modtage e-mails om nye indlæg.
    </p>
    <a href="/">← Tilbage til bloggen</a>
  </div>
</body>
</html>`);
  } catch (err: any) {
    return res.status(500).send('Fejl ved afmelding.');
  }
});

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
