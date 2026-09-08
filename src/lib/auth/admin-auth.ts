'use client';

// ─────────────────────────────────────────────────────────────────────────────
// Admin Auth
// Password verification (SHA-256), session management (sessionStorage),
// attempt tracking (sessionStorage).
//
// ⚠️ CLIENT-SIDE AUTHENTICATION — MVP/INTERNAL ONLY.
//    SHA-256 di client bukan security boundary yang kuat.
//    sessionStorage bisa dimanipulasi user yang menguasai browser.
// ─────────────────────────────────────────────────────────────────────────────

import { FACE_AUTH_CONFIG } from '@/lib/config/face-auth.config';
import { findAdminByUsername } from '@/data/admin';
import type { AdminSession, AdminAccount } from '@/types/face-auth';

const SESSION_KEY = 'iwu_admin_session';
const ATTEMPT_KEY = 'iwu_login_attempts';
const LOCKOUT_KEY = 'iwu_lockout_until';

// ── Password Verification ─────────────────────────────────────────────────────

/**
 * SHA-256 hash menggunakan Web Crypto API (browser-native, no library).
 * Hanya panggil di browser.
 */
async function sha256Hex(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verifikasi password admin.
 * Returns AdminAccount jika valid, null jika tidak.
 */
export async function verifyPassword(
  username: string,
  password: string
): Promise<AdminAccount | null> {
  const admin = findAdminByUsername(username);
  if (!admin) return null;

  const inputHash = await sha256Hex(password);
  if (inputHash !== admin.passwordHash) return null;

  return admin;
}

// ── Session Management ────────────────────────────────────────────────────────

/**
 * Buat session baru setelah autentikasi berhasil.
 * Disimpan di sessionStorage (hilang saat tab/browser ditutup).
 */
export function createSession(admin: AdminAccount): AdminSession {
  const now = new Date();
  const expiresAt = new Date(
    now.getTime() + FACE_AUTH_CONFIG.sessionLifetimeMs
  );

  const session: AdminSession = {
    adminId: admin.id,
    adminName: admin.displayName,
    authenticatedAt: now.toISOString(),
    method: 'password+face',
    expiresAt: expiresAt.toISOString(),
  };

  if (typeof window !== 'undefined') {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  return session;
}

/** Ambil session aktif dari sessionStorage. Returns null jika tidak ada/expired. */
export function getSession(): AdminSession | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;

    const session: AdminSession = JSON.parse(raw);

    // Cek expired
    if (new Date(session.expiresAt) < new Date()) {
      clearSession();
      return null;
    }

    return session;
  } catch {
    clearSession();
    return null;
  }
}

/** Hapus session (logout). */
export function clearSession(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(SESSION_KEY);
  }
}

/** Cek apakah ada session valid. */
export function hasValidSession(): boolean {
  return getSession() !== null;
}

// ── Attempt Tracking ──────────────────────────────────────────────────────────

export function getAttemptCount(): number {
  if (typeof window === 'undefined') return 0;
  return parseInt(sessionStorage.getItem(ATTEMPT_KEY) ?? '0', 10);
}

export function incrementAttempt(): number {
  const count = getAttemptCount() + 1;
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(ATTEMPT_KEY, String(count));
  }
  return count;
}

export function resetAttempts(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(ATTEMPT_KEY);
    sessionStorage.removeItem(LOCKOUT_KEY);
  }
}

/** Set lockout timestamp. */
export function setLockout(): void {
  if (typeof window === 'undefined') return;
  const until = new Date(
    Date.now() + FACE_AUTH_CONFIG.lockoutDurationMs
  ).toISOString();
  sessionStorage.setItem(LOCKOUT_KEY, until);
}

/** Cek apakah sedang dalam lockout period. */
export function isLockedOut(): boolean {
  if (typeof window === 'undefined') return false;
  const until = sessionStorage.getItem(LOCKOUT_KEY);
  if (!until) return false;
  if (new Date(until) > new Date()) return true;
  // Lockout expired — clear
  sessionStorage.removeItem(LOCKOUT_KEY);
  return false;
}

/** Sisa waktu lockout dalam detik. */
export function lockoutRemainingSeconds(): number {
  if (typeof window === 'undefined') return 0;
  const until = sessionStorage.getItem(LOCKOUT_KEY);
  if (!until) return 0;
  const remaining = new Date(until).getTime() - Date.now();
  return Math.max(0, Math.ceil(remaining / 1000));
}
