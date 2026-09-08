'use client';

// ─────────────────────────────────────────────────────────────────────────────
// Face Embedding
// 128-dimensional face descriptor. Pakai TinyFaceDetector untuk detection
// lalu faceRecognitionNet untuk descriptor.
// ─────────────────────────────────────────────────────────────────────────────

import { FACE_AUTH_CONFIG } from '@/lib/config/face-auth.config';
import type { FaceEmbedding } from '@/types/face-auth';

export async function createEmbedding(
  video: HTMLVideoElement
): Promise<FaceEmbedding | null> {
  const faceapi = await import('@vladmandic/face-api');

  const options = new faceapi.TinyFaceDetectorOptions({
    inputSize: FACE_AUTH_CONFIG.tinyDetectorInputSize,
    scoreThreshold: FACE_AUTH_CONFIG.detectionMinConfidence,
  });

  const result = await faceapi
    .detectSingleFace(video, options)
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!result) return null;
  return Array.from(result.descriptor);
}

export async function createEmbeddingForEnrollment(
  video: HTMLVideoElement
): Promise<{ embedding: FaceEmbedding; confidence: number } | null> {
  const faceapi = await import('@vladmandic/face-api');

  const options = new faceapi.TinyFaceDetectorOptions({
    inputSize: FACE_AUTH_CONFIG.tinyDetectorInputSize,
    scoreThreshold: FACE_AUTH_CONFIG.enrollmentMinConfidence,
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
