'use client';

// ─────────────────────────────────────────────────────────────────────────────
// Face Similarity
// Euclidean distance antara dua 128-d embeddings.
// face_recognition_model dari @vladmandic/face-api dioptimalkan untuk
// Euclidean distance (bukan cosine).
// ─────────────────────────────────────────────────────────────────────────────

import { FACE_AUTH_CONFIG } from '@/lib/config/face-auth.config';
import type { FaceEmbedding, EmbeddingMatchResult } from '@/types/face-auth';

/**
 * Euclidean distance antara dua embedding.
 * 0.0 = identik, ~1.0+ = berbeda.
 *
 * Threshold default: 0.5 (perlu kalibrasi per deployment).
 * Referensi: face-api.js original menggunakan threshold 0.6 untuk euclidean.
 */
export function euclideanDistance(a: FaceEmbedding, b: FaceEmbedding): number {
  if (a.length !== b.length) {
    throw new Error(`Embedding length mismatch: ${a.length} vs ${b.length}`);
  }
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

/**
 * Bandingkan satu live embedding terhadap array stored embeddings.
 * Ambil nilai terbaik (distance terkecil).
 */
export function bestMatch(
  liveEmbedding: FaceEmbedding,
  storedEmbeddings: FaceEmbedding[]
): EmbeddingMatchResult {
  if (storedEmbeddings.length === 0) {
    return { matched: false, distance: Infinity, bestEmbeddingIndex: -1 };
  }

  let bestDistance = Infinity;
  let bestIndex = 0;

  for (let i = 0; i < storedEmbeddings.length; i++) {
    const dist = euclideanDistance(liveEmbedding, storedEmbeddings[i]);
    if (dist < bestDistance) {
      bestDistance = dist;
      bestIndex = i;
    }
  }

  return {
    matched: bestDistance <= FACE_AUTH_CONFIG.recognitionThreshold,
    distance: bestDistance,
    bestEmbeddingIndex: bestIndex,
  };
}

/**
 * Format distance sebagai similarity percentage (0–100%).
 * Hanya untuk development UI — jangan expose di production.
 */
export function distanceToSimilarityPercent(distance: number): number {
  return Math.max(0, Math.round((1 - distance) * 100));
}
