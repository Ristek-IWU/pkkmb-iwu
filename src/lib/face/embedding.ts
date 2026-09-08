'use client';

// ─────────────────────────────────────────────────────────────────────────────
// Face Embedding
// Menghasilkan 128-dimensional face descriptor dari HTMLVideoElement.
// ─────────────────────────────────────────────────────────────────────────────

import { FACE_AUTH_CONFIG } from '@/lib/config/face-auth.config';
import type { FaceEmbedding } from '@/types/face-auth';

/**
 * Buat face embedding dari video element.
 * Mengembalikan null jika wajah tidak terdeteksi atau confidence rendah.
 *
 * ⚠️ Jangan log hasil embedding ke console.
 */
export async function createEmbedding(
  video: HTMLVideoElement
): Promise<FaceEmbedding | null> {
  const faceapi = await import('@vladmandic/face-api');

  const options = new faceapi.SsdMobilenetv1Options({
    minConfidence: FACE_AUTH_CONFIG.detectionMinConfidence,
  });

  const result = await faceapi
    .detectSingleFace(video, options)
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!result) return null;

  // Convert Float32Array → regular number[] untuk storage
  return Array.from(result.descriptor);
}

/**
 * Ambil embedding dengan validasi confidence minimum.
 * Untuk enrollment — lebih strict dari createEmbedding().
 */
export async function createEmbeddingForEnrollment(
  video: HTMLVideoElement
): Promise<{ embedding: FaceEmbedding; confidence: number } | null> {
  const faceapi = await import('@vladmandic/face-api');

  const options = new faceapi.SsdMobilenetv1Options({
    minConfidence: FACE_AUTH_CONFIG.enrollmentMinConfidence,
  });

  const result = await faceapi
    .detectSingleFace(video, options)
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!result) return null;

  return {
    embedding: Array.from(result.descriptor),
    confidence: result.detection.score,
  };
}
