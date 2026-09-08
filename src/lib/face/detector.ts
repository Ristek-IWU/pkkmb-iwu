'use client';

// ─────────────────────────────────────────────────────────────────────────────
// Face Detector
// Menggunakan TinyFaceDetector (190KB, cepat) untuk detection realtime.
// ─────────────────────────────────────────────────────────────────────────────

import { FACE_AUTH_CONFIG } from '@/lib/config/face-auth.config';
import type { FaceDetectionResult, FaceLandmarks } from '@/types/face-auth';

export async function detectFace(
  video: HTMLVideoElement
): Promise<FaceDetectionResult> {
  const faceapi = await import('@vladmandic/face-api');

  const options = new faceapi.TinyFaceDetectorOptions({
    inputSize: FACE_AUTH_CONFIG.tinyDetectorInputSize,
    scoreThreshold: FACE_AUTH_CONFIG.detectionMinConfidence,
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

  // Validasi ukuran minimum
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

  const positions = det.landmarks.positions;
  const landmarks: FaceLandmarks = {
    positions: positions.map((p) => ({ x: p.x, y: p.y })),
    leftEye:   positions.slice(36, 42).map((p) => ({ x: p.x, y: p.y })),
    rightEye:  positions.slice(42, 48).map((p) => ({ x: p.x, y: p.y })),
    nose:      { x: positions[30].x, y: positions[30].y },
    jawLeft:   { x: positions[0].x,  y: positions[0].y },
    jawRight:  { x: positions[16].x, y: positions[16].y },
  };

  return {
    detected: true,
    faceCount: 1,
    box: { x: box.x, y: box.y, width: box.width, height: box.height },
    confidence,
    landmarks,
  };
}
