/**
 * Production Publish & Deployment Script for local-ai.blog
 * Usage: npm run publish
 *
 * 1. Validates and compiles all markdown in /content/posts/
 * 2. Compiles the static production bundle (Vite build)
 * 3. Commits changed posts to Git and pushes to remote / triggers deployment
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { compileStaticContent } from './build-static-content.ts';

async function publish() {
  console.log('\n=======================================================');
  console.log('  local-ai.blog — Production Publish & Deploy Pipeline ');
  console.log('=======================================================\n');

  const startTime = Date.now();

  // Step 1: Content compilation
  console.log('[Step 1/3] Compiling local physical markdown posts...');
  const posts = await compileStaticContent();
  console.log(`  ✓ Successfully parsed ${posts.length} posts from /content/posts/`);

  // Step 2: Build static site with Vite
  console.log('\n[Step 2/3] Building static production assets (Vite build)...');
  try {
    execSync('npx vite build', { stdio: 'inherit' });
    console.log('  ✓ Production bundle built successfully into /dist/');
  } catch (buildError) {
    console.error('  ✕ Vite build failed. Halting deployment.');
    process.exit(1);
  }

  // Calculate dist size
  const distDir = path.resolve(process.cwd(), 'dist');
  let distFilesCount = 0;
  let totalBytes = 0;
  if (fs.existsSync(distDir)) {
    const readRecursive = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          readRecursive(full);
        } else {
          distFilesCount++;
          totalBytes += fs.statSync(full).size;
        }
      }
    };
    readRecursive(distDir);
  }
  const sizeMb = (totalBytes / (1024 * 1024)).toFixed(2);
  console.log(`  ✓ Dist summary: ${distFilesCount} files, ${sizeMb} MB total`);

  // Step 3: Git Version Control & Deployment Trigger
  console.log('\n[Step 3/3] Version control and deployment sync...');
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);

  let gitStatus = '';
  try {
    gitStatus = execSync('git status --porcelain', { encoding: 'utf-8' });
  } catch (e) {
    console.log('  ℹ Git is not initialized in this environment.');
  }

  if (gitStatus.trim().length > 0) {
    try {
      console.log('  → Staging changed content and generated assets...');
      execSync('git add content/posts/ src/data/ dist/', { stdio: 'inherit' });
      
      const commitMsg = `publish: sync ${posts.length} posts and build site [${timestamp}]`;
      execSync(`git commit -m "${commitMsg}"`, { stdio: 'inherit' });
      console.log(`  ✓ Git commit created: "${commitMsg}"`);

      try {
        console.log('  → Pushing to remote branch...');
        execSync('git push', { stdio: 'inherit' });
        console.log('  ✓ Successfully pushed to remote repository.');
      } catch (pushErr: any) {
        console.log('  ℹ Push to remote skipped (no upstream configured or working in preview branch).');
      }
    } catch (gitErr: any) {
      console.log(`  ℹ Git commit info: ${gitErr.message || 'No commit required'}`);
    }
  } else {
    console.log('  ✓ Working tree is clean. No uncommitted content changes.');
  }

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log('\n=======================================================');
  console.log('  Deploy Summary & Instant Cloud Host Commands');
  console.log('=======================================================');
  console.log(`  • Execution time: ${durationSec}s`);
  console.log(`  • Posts published: ${posts.filter((p) => p.status === 'published').length} live, ${posts.filter((p) => p.status === 'draft').length} drafts`);
  console.log(`  • Local directory: /content/posts/*.md`);
  console.log(`  • Deploy targets:`);
  console.log(`     - Vercel:       npx vercel --prod`);
  console.log(`     - Netlify:      npx netlify deploy --prod --dir=dist`);
  console.log(`     - GitHub Pages: npx gh-pages -d dist`);
  console.log('=======================================================\n');
}

publish().catch((err) => {
  console.error('\n✕ Publish command failed:', err);
  process.exit(1);
});
