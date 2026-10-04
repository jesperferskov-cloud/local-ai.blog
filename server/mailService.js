/**
 * Zero-Cloud Mail & Subscriber Service for local-ai.blog
 * 
 * Flat JSON Database: /content/subscribers.json
 * Local-First / Zero-Cloud architecture: Stores subscribers locally on disk,
 * and handles one-click unsubscribe flow via DELETE /api/unsubscribe.
 */

import fs from 'fs';
import path from 'path';

const SUBSCRIBERS_FILE = path.resolve(process.cwd(), 'content/subscribers.json');

/**
 * Get all current subscribers from /content/subscribers.json
 */
export async function getSubscribers() {
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
    console.error('[mailService] Error reading subscribers:', err);
    return [];
  }
}

/**
 * Overwrite /content/subscribers.json with updated list
 */
export async function saveSubscribers(list) {
  const contentDir = path.dirname(SUBSCRIBERS_FILE);
  if (!fs.existsSync(contentDir)) {
    await fs.promises.mkdir(contentDir, { recursive: true });
  }
  await fs.promises.writeFile(SUBSCRIBERS_FILE, JSON.stringify(list, null, 2), 'utf-8');
}

/**
 * Unsubscribe logic for DELETE /api/unsubscribe
 * Reads /content/subscribers.json, filters out target email, and overwrites with the updated list.
 */
export async function unsubscribeUser(email) {
  const targetEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  if (!targetEmail || !targetEmail.includes('@')) {
    throw new Error('Mangler eller ugyldig e-mailadresse.');
  }

  const subscribers = await getSubscribers();
  const initialLength = subscribers.length;
  const filtered = subscribers.filter((s) => s.email.toLowerCase() !== targetEmail);

  await saveSubscribers(filtered);

  return {
    success: true,
    email: targetEmail,
    wasFound: filtered.length < initialLength,
    remainingCount: filtered.length,
    message: 'Du er nu afmeldt. Tak for at du læste med.',
  };
}

export default {
  getSubscribers,
  saveSubscribers,
  unsubscribeUser,
};
