'use client';

// ─────────────────────────────────────────────────────────────────────────────
// Model Loader
// Lazy-loads @vladmandic/face-api models dari /public/models/face/.
// Menggunakan TinyFaceDetector (190KB) bukan SSD MobileNet (5.5MB)
// agar load time jauh lebih cepat.
// ─────────────────────────────────────────────────────────────────────────────

import { FACE_AUTH_CONFIG } from '@/lib/config/face-auth.config';

type LoadingState = 'idle' | 'loading' | 'loaded' | 'error';

let state: LoadingState = 'idle';
let loadError: Error | null = null;
let loadPromise: Promise<void> | null = null;

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
 * Concurrent calls berbagi promise yang sama (tidak double-load).
 */
export async function loadFaceModels(): Promise<void> {
  if (state === 'loaded') return;
  if (state === 'error') throw loadError!;

  // Jika sedang loading, return promise yang sama
  if (loadPromise) return loadPromise;

  state = 'loading';
  notify(0);

  loadPromise = (async () => {
    try {
      // Dynamic import — TIDAK pernah di top-level (SSR safe)
      const faceapi = await import('@vladmandic/face-api');
      const basePath = FACE_AUTH_CONFIG.modelBasePath;

      notify(5);

      // TinyFaceDetector: 190KB — jauh lebih cepat dari ssdMobilenetv1 (5.5MB)
      await faceapi.nets.tinyFaceDetector.loadFromUri(basePath);
      notify(35);

      // Face Landmark 68: 350KB
      await faceapi.nets.faceLandmark68Net.loadFromUri(basePath);
      notify(65);

      // Face Recognition: 6.3MB — paling besar, load terakhir
      await faceapi.nets.faceRecognitionNet.loadFromUri(basePath);
      notify(100);

      state = 'loaded';
      notify(100);
    } catch (err) {
      state = 'error';
      loadError = err instanceof Error ? err : new Error(String(err));
      loadPromise = null;
      notify(0);
      throw loadError;
    }
  })();

  return loadPromise;
}

export function areModelsLoaded(): boolean {
  return state === 'loaded';
}

export function getModelLoadError(): Error | null {
  return loadError;
}

export function getModelLoadState(): LoadingState {
  return state;
}

/** Reset state — hanya untuk testing / hot reload */
export function _resetModelState() {
  state = 'idle';
  loadError = null;
  loadPromise = null;
}
