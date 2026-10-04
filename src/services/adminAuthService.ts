/**
 * Admin Authentication Service
 * Local-first authentication and session management for local-ai.blog
 */

const STORAGE_SESSION_KEY = 'admin-session';
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface AdminSession {
  authenticated: boolean;
  token: string;
  createdAt: number;
  expiresAt: number;
}

/**
 * Checks if a valid, unexpired admin session exists in localStorage
 */
export function hasValidAdminSession(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(STORAGE_SESSION_KEY);
    if (!raw) return false;

    const session: AdminSession = JSON.parse(raw);
    if (!session || !session.authenticated) {
      return false;
    }

    // Check expiry
    if (session.expiresAt && Date.now() > session.expiresAt) {
      localStorage.removeItem(STORAGE_SESSION_KEY);
      return false;
    }

    return true;
  } catch (err) {
    console.warn('Error reading admin session from localStorage:', err);
    return false;
  }
}

/**
 * Persists an authenticated admin session to localStorage
 */
export function createAdminSession(): void {
  if (typeof window === 'undefined') return;
  try {
    const session: AdminSession = {
      authenticated: true,
      token: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `auth_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      createdAt: Date.now(),
      expiresAt: Date.now() + SESSION_TTL_MS,
    };
    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(session));
  } catch (err) {
    console.error('Failed to write admin session to localStorage:', err);
  }
}

/**
 * Clears the stored admin session from localStorage
 */
export function clearAdminSession(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_SESSION_KEY);
  } catch (err) {
    console.error('Failed to clear admin session from localStorage:', err);
  }
}

/**
 * Calculates SHA-256 hash of a string using Web Crypto API
 */
export async function sha256(str: string): Promise<string> {
  if (typeof crypto === 'undefined' || !crypto.subtle) {
    return '';
  }
  const msgBuffer = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Pre-computed SHA-256 hashes of standard default keys:
 * 'local-ai' -> 0be0d86bfeee5d6c8b9dc8e75294bc1532f146be1d5fc6076b1064e622ef8ec7
 * 'admin' -> 8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918
 */
const KNOWN_VALID_HASHES = new Set([
  '0be0d86bfeee5d6c8b9dc8e75294bc1532f146be1d5fc6076b1064e622ef8ec7', // 'local-ai'
  '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', // 'admin'
]);

/**
 * Verifies password against environment variables and server endpoint
 */
export async function verifyAdminPassword(password: string): Promise<boolean> {
  const trimmed = password.trim();
  if (!trimmed) return false;

  // 1. Direct check against client environment variables
  // In Vite: process.env.ADMIN_PASSWORD is substituted by vite define or import.meta.env
  const clientEnvPassword =
    (typeof process !== 'undefined' && process.env?.ADMIN_PASSWORD) ||
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_ADMIN_PASSWORD);

  if (clientEnvPassword && trimmed === clientEnvPassword) {
    return true;
  }

  // 2. Direct check against default allowed local-first passwords
  if (trimmed === 'local-ai' || trimmed === 'admin') {
    return true;
  }

  // 3. Client-side SHA-256 hash comparison
  try {
    const inputHash = await sha256(trimmed);
    if (KNOWN_VALID_HASHES.has(inputHash)) {
      return true;
    }
  } catch (err) {
    // Ignore crypto failure and continue
  }

  // 4. Server-side verification fallback
  try {
    const response = await fetch('/api/admin/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: trimmed }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data?.authenticated || data?.success) {
        return true;
      }
    }
  } catch (err) {
    console.warn('Server password verification endpoint unreachable, falling back to local verification', err);
  }

  return false;
}
