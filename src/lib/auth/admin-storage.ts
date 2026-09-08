'use client';

// ─────────────────────────────────────────────────────────────────────────────
// Admin Storage — IndexedDB Abstraction (via idb)
// Single source of truth untuk semua akses IndexedDB face profile.
//
// ⚠️ IndexedDB bukan trusted security boundary.
//    Data bisa diinspeksi oleh user yang menguasai browser.
//    Untuk MVP internal, ini acceptable.
// ─────────────────────────────────────────────────────────────────────────────

import type { FaceProfile } from '@/types/face-auth';

const DB_NAME = 'iwu-admin';
const DB_VERSION = 1;
const STORE_FACE = 'face-profiles';

/** Lazy-open database. Hanya panggil di browser (dalam useEffect/handler). */
async function openDB() {
  const { openDB: idbOpen } = await import('idb');

  return idbOpen(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_FACE)) {
        db.createObjectStore(STORE_FACE, { keyPath: 'adminId' });
      }
    },
  });
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function saveFaceProfile(profile: FaceProfile): Promise<void> {
  const db = await openDB();
  await db.put(STORE_FACE, profile);
}

export async function getFaceProfile(
  adminId: string
): Promise<FaceProfile | undefined> {
  const db = await openDB();
  return db.get(STORE_FACE, adminId);
}

export async function hasFaceProfile(adminId: string): Promise<boolean> {
  const profile = await getFaceProfile(adminId);
  return profile !== undefined && profile.embeddings.length > 0;
}

export async function deleteFaceProfile(adminId: string): Promise<void> {
  const db = await openDB();
  await db.delete(STORE_FACE, adminId);
}

/** Cek apakah IndexedDB tersedia di browser ini (false di mode private tertentu). */
export async function isStorageAvailable(): Promise<boolean> {
  try {
    const db = await openDB();
    db.close();
    return true;
  } catch {
    return false;
  }
}
