'use client';

// ─────────────────────────────────────────────────────────────────────────────
// Model Loader
// Lazy-loads @vladmandic/face-api models dari /public/models/face/.
// Hanya berjalan di browser — tidak pernah di SSR/Node.
// ─────────────────────────────────────────────────────────────────────────────

import { FACE_AUTH_CONFIG } from '@/lib/config/face-auth.config';

type LoadingState = 'idle' | 'loading' | 'loaded' | 'error';

let state: LoadingState = 'idle';
let loadError: Error | null = null;

/** Callback listeners untuk progress UI */
const listeners: Array<(progress: number, state: LoadingState) => void> = [];

export function onModelLoadProgress(
  cb: (progress: number, state: LoadingState) => void
) {
  listeners.push(cb);
  return () => {
    const idx = listeners.indexOf(cb);
    if (idx !== -1) listeners.splice(idx, 1);
  };
}

function notify(progress: number) {
  listeners.forEach((cb) => cb(progress, state));
}

/**
 * Load semua model yang dibutuhkan.
 * Aman dipanggil berkali-kali — skip jika sudah loaded.
 * Hanya panggil dari useEffect / event handler (bukan top-level module).
 */
export async function loadFaceModels(): Promise<void> {
  if (state === 'loaded') return;
  if (state === 'loading') {
    // Tunggu sampai selesai
    return new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        if (state === 'loaded') {
          clearInterval(interval);
          resolve();
        } else if (state === 'error') {
          clearInterval(interval);
          reject(loadError);
        }
      }, 100);
    });
  }

  state = 'loading';
  notify(0);

  try {
    // Dynamic import — TIDAK pernah di top-level (SSR safe)
    const faceapi = await import('@vladmandic/face-api');

    const basePath = FACE_AUTH_CONFIG.modelBasePath;

    notify(10);
    await faceapi.nets.ssdMobilenetv1.loadFromUri(basePath);
    notify(45);

    await faceapi.nets.faceLandmark68Net.loadFromUri(basePath);
    notify(70);

    await faceapi.nets.faceRecognitionNet.loadFromUri(basePath);
    notify(100);

    state = 'loaded';
    notify(100);
  } catch (err) {
    state = 'error';
    loadError = err instanceof Error ? err : new Error(String(err));
    notify(0);
    throw loadError;
  }
}

export function areModelsLoaded(): boolean {
  return state === 'loaded';
}

export function getModelLoadError(): Error | null {
  return loadError;
}

/** Reset state — hanya untuk testing */
export function _resetModelState() {
  state = 'idle';
  loadError = null;
}
