# Projektbibel: local-ai.blog

## 1. Vision & Strategi
`local-ai.blog` er en personlig, privacy-fokuseret, lynhurtig blog, der dokumenterer en autodidakt AI-entusiasts rejse med on-device inferens (især på Apple-hardware). Bloggen er bygget efter "Zero-Cloud/Local-First" princippet. Sitet skal kompileres som en statisk side (Static Site Generator) for ultimativ hastighed og kan køre 100% offline.

---

## 2. System Arkitektur & Stack
- **Framework:** Vite + React (eller Astro)
- **Styling:** Tailwind CSS (skræddersyet med CSS-variabler i `tailwind.config.js`)
- **Data lagring:** Markdown-filer med YAML frontmatter.
- **Admin panel:** Lokal Single-Page App (SPA) beskyttet af en lokal password-gateway, som skriver til din lokale disk via en mikroskopisk Node.js/Vite-hjælpeservice, når du kører sitet lokalt på din Mac.
- **E-mail & Notifikationer:** Zero-Cloud setup. E-mails gemmes lokalt i en flad `subscribers.json` fil. Udsendelse sker udelukkende via SMTP (Resend) orkestreret af den lokale Node.js hjælpeservice uden brug af eksterne databaser.

---

## 3. Mappe-struktur (Directory Map)

```text
/local-ai-blog
├── /content
│   ├── /posts
│   │   ├── dybdegående-mlx-guide.da.md   # Dansk version af artikel
│   │   └── dybdegående-mlx-guide.en.md   # Engelsk version af artikel
│   └── subscribers.json                  # Lokal database over tilmeldte e-mails
├── /public
│   ├── /images
│   │   └── /posts                        # Brugerdefinerede uploads af screenshots
│   └── favicon.ico
├── /server (eller /api)
│   └── mailService.js                    # Node.js SMTP endpoint (nodemailer)
├── /src
│   ├── /components
│   │   ├── Header.jsx                    # Silent navigation & sprog/tema-toggles
│   │   ├── Hero.jsx                      # Silicon Yogi & Dunes (inkl. SVG)
│   │   ├── ArticleGrid.jsx               # Dynamisk grid med layout-switcher
│   │   ├── ArticleCard.jsx               # Elevated kort med ambient halo-glow
│   │   ├── AboutCard.jsx                 # Bag om bloggen (Signatur-sektion)
│   │   ├── Footer.jsx                    # Bundlinje med hemmelig >_ terminal-prompt
│   │   └── VectorGenerator.jsx           # Detaljeret SVG-generator baseret på tags
│   ├── /pages
│   │   ├── Home.jsx                      # Samlet landingsside
│   │   ├── ArticleDetail.jsx             # Detaljeret artikel-view (Markdown parser)
│   │   └── AdminConsole.jsx              # Password Lock-screen + Markdown Editor & Brain-dump
│   ├── /context
│   │   ├── ThemeContext.jsx              # Håndtering af Aftengry / Morgengry state
│   │   └── LocaleContext.jsx             # Håndtering af DA / EN state
│   ├── index.css                         # CSS variabler og Tailwind imports
│   └── main.jsx
├── tailwind.config.js
├── settings.json                         # Global konfiguration af forside-tekster og disclaimer
├── package.json
└── PROJECT_BIBLE.md
```

---

## 4. Designfilosofi: Zen-Tech & Less but Better
Sitet skal fremstå som et eksklusivt, digitalt arkitektur-magasin dedikeret til Apple Silicon og lokal AI-udvikling. Sitet er renset for traditionel webstøj, unødvendige grafer og tabeller. Layoutet domineres af organiske former, dyb typografisk hierarki og en udtalt brug af whitespace (luft).

### Dual-Theme Arkitektur (CSS Variables)
Sitet understøtter to dynamiske temaer, der skifter synkront via klasserne `html` (Aftengry/Dark) og `html.light` (Morgengry/Light). Sitet indlæses i Aftengry som standard.

```css
:root { /* Aftengry (Dark Theme - Default) */
  --bg-outer: #161E1D;               /* Dyb skov-skifer ydre ramme */
  --bg-inner: #091614;               /* Dyb kulsort skov inner-canvas */
  --bg-card: #0E1F1C;                /* Dæmpet skov-skifer til kort */
  --text-title: #F1F5F4;             /* Varm sølv-hvid til overskrifter */
  --text-body: #728984;              /* Dæmpet grå-grøn til brødtekst */
  --accent-glow: #10B981;            /* Smaragd-grøn til lysende noder */
  --border-subtle: rgba(255, 255, 255, 0.05); /* Ultra-fin mørk ramme */
  --shadow-card: 0 20px 40px -15px rgba(0, 0, 0, 0.5);
  --halo-opacity: 0.03;
}

html.light { /* Morgengry (Light Theme) */
  --bg-outer: #E6ECE9;               /* Dugfrisk lys morgentåge ydre ramme */
  --bg-inner: #F4F8F6;               /* Frisk, lys sagemælk inner-canvas */
  --bg-card: #FFFFFF;                /* Krystalklar hvid til kort */
  --text-title: #0E1F1C;             /* Mørk, kontrastfuld skovgrøn til titler */
  --text-body: #405853;              /* Blød mørk-sage til brødtekst */
  --accent-glow: #059669;            /* Dyb, mættet skovsmaragd til noder */
  --border-subtle: rgba(14, 31, 28, 0.08); /* Fin, lys sage-ramme */
  --shadow-card: 0 15px 35px -10px rgba(14, 31, 28, 0.05);
  --halo-opacity: 0.05;
}
```

---

## 5. Frontmatter Specifikation
Hver artikel gemmes som en `.md` fil i `/content/posts/` med følgende YAML frontmatter:

```markdown
---
title: "DeepSeek R1 på M4 Pro: 32B vs 14B Kvantisering"
slug: "deepseek-r1-m4-pro-32b-vs-14b"
date: "2025-02-24T08:00"
updated: "2025-02-25"
readingTime: "6 min"
hardware: "M4 Pro • 48GB"
tags: ["Mac Setup", "Benchmarks", "Kvantisering"]
coverImage: ""                      # Hvis tom, genererer VectorGenerator automatisk SVG
status: "published"                 # "published" eller "draft"
published: true
---
# Introduktion til Lokal Inferens
Her starter selve artiklen skrevet i rå Markdown...
```

---

## 6. Tidsindstillet Publicering (Scheduling) Logik
Artikler med en dato i fremtiden markeres i Admin Console med status "Scheduled" (gul prik).
For normale læsere filtreres fremtidige artikler fra på klientsiden med følgende logik:
```javascript
// new Date(post.date) <= new Date()
const publiceredeArtikler = posts.filter(post => !post.date || new Date(post.date) <= new Date());
```
