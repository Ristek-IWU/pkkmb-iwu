'use client';

// ─────────────────────────────────────────────────────────────────────────────
// Face Detector
// Deteksi wajah dari HTMLVideoElement menggunakan ssd_mobilenetv1.
// Menghasilkan FaceDetectionResult dengan validasi.
// ─────────────────────────────────────────────────────────────────────────────

import { FACE_AUTH_CONFIG } from '@/lib/config/face-auth.config';
import type { FaceDetectionResult, FaceLandmarks } from '@/types/face-auth';

/**
 * Deteksi wajah dari video element.
 * Mengembalikan result dengan validasi: jumlah wajah, ukuran, confidence.
 *
 * Hanya panggil setelah loadFaceModels() selesai.
 */
export async function detectFace(
  video: HTMLVideoElement
): Promise<FaceDetectionResult> {
  // Dynamic import — SSR safe
  const faceapi = await import('@vladmandic/face-api');

  const options = new faceapi.SsdMobilenetv1Options({
    minConfidence: FACE_AUTH_CONFIG.detectionMinConfidence,
  });

  const detections = await faceapi
    .detectAllFaces(video, options)
    .withFaceLandmarks();

  if (!detections || detections.length === 0) {
    return { detected: false, faceCount: 0 };
  }

  if (detections.length > 1) {
    return { detected: false, faceCount: detections.length };
  }

  const det = detections[0];
  const box = det.detection.box;
  const confidence = det.detection.score;

  // Validasi ukuran wajah minimum
  const videoWidth = video.videoWidth || video.width || 640;
  const faceWidthRatio = box.width / videoWidth;

  if (faceWidthRatio < FACE_AUTH_CONFIG.minFaceSizeRatio) {
    return {
      detected: false,
      faceCount: 1,
      box: { x: box.x, y: box.y, width: box.width, height: box.height },
      confidence,
    };
  }

  // Map landmarks
  const positions = det.landmarks.positions;
  const landmarks: FaceLandmarks = {
    positions: positions.map((p) => ({ x: p.x, y: p.y })),
    // Left eye: landmarks 36–41
    leftEye: positions.slice(36, 42).map((p) => ({ x: p.x, y: p.y })),
    // Right eye: landmarks 42–47
    rightEye: positions.slice(42, 48).map((p) => ({ x: p.x, y: p.y })),
    // Nose tip: landmark 30
    nose: { x: positions[30].x, y: positions[30].y },
    // Jaw left/right: 0 dan 16
    jawLeft: { x: positions[0].x, y: positions[0].y },
    jawRight: { x: positions[16].x, y: positions[16].y },
  };

  return {
    detected: true,
    faceCount: 1,
    box: { x: box.x, y: box.y, width: box.width, height: box.height },
    confidence,
    landmarks,
  };
}
