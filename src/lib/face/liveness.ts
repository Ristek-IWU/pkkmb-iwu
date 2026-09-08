'use client';

// ─────────────────────────────────────────────────────────────────────────────
// Liveness Detection Helpers
// Mendeteksi blink (Eye Aspect Ratio) dan head turn (landmark asymmetry).
// Bukan anti-spoofing sempurna — didesain untuk MVP presentation-attack resistance.
// ─────────────────────────────────────────────────────────────────────────────

import { FACE_AUTH_CONFIG } from '@/lib/config/face-auth.config';
import type { FaceLandmarks, LivenessChallenge } from '@/types/face-auth';

// ── Eye Aspect Ratio ──────────────────────────────────────────────────────────

/**
 * Hitung Eye Aspect Ratio (EAR) untuk satu mata.
 * EAR = (||p2-p6|| + ||p3-p5||) / (2 * ||p1-p4||)
 *
 * Input: 6 titik landmark satu mata (indeks 0–5 dalam array mata).
 * EAR < BLINK_THRESHOLD → mata tertutup.
 */
function eyeAspectRatio(
  eye: Array<{ x: number; y: number }>
): number {
  if (eye.length < 6) return 1; // Fallback — anggap terbuka

  const dist = (
    a: { x: number; y: number },
    b: { x: number; y: number }
  ) => Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);

  const vertical1 = dist(eye[1], eye[5]);
  const vertical2 = dist(eye[2], eye[4]);
  const horizontal = dist(eye[0], eye[3]);

  if (horizontal === 0) return 1;
  return (vertical1 + vertical2) / (2 * horizontal);
}

/**
 * Cek apakah kedua mata sedang tertutup (blink state).
 * Rata-rata EAR kedua mata digunakan untuk mengurangi noise.
 */
export function isBlinking(landmarks: FaceLandmarks): boolean {
  const leftEAR = eyeAspectRatio(landmarks.leftEye);
  const rightEAR = eyeAspectRatio(landmarks.rightEye);
  const avgEAR = (leftEAR + rightEAR) / 2;
  return avgEAR < FACE_AUTH_CONFIG.blinkEarThreshold;
}

// ── Head Turn Detection ───────────────────────────────────────────────────────

/**
 * Deteksi head turn menggunakan asymmetry landmark hidung terhadap jaw.
 *
 * Pendekatan 2D:
 * - Jika wajah menghadap lurus: nose.x ≈ midpoint(jawLeft.x, jawRight.x)
 * - Jika menoleh kanan: nose.x lebih dekat ke jawLeft
 * - Jika menoleh kiri: nose.x lebih dekat ke jawRight
 *
 * Asymmetry = (nose.x - jawLeft.x) / (jawRight.x - jawLeft.x) - 0.5
 * Range: -0.5 (full left) to +0.5 (full right)
 */
function headAsymmetry(landmarks: FaceLandmarks): number {
  const { nose, jawLeft, jawRight } = landmarks;
  const faceWidth = jawRight.x - jawLeft.x;
  if (faceWidth <= 0) return 0;
  const normalized = (nose.x - jawLeft.x) / faceWidth;
  return normalized - 0.5; // Center = 0
}

/** Returns true jika kepala menoleh ke kanan (dari perspektif layar) */
export function isTurningRight(landmarks: FaceLandmarks): boolean {
  return headAsymmetry(landmarks) > FACE_AUTH_CONFIG.headTurnAsymmetryThreshold;
}

/** Returns true jika kepala menoleh ke kiri (dari perspektif layar) */
export function isTurningLeft(landmarks: FaceLandmarks): boolean {
  return headAsymmetry(landmarks) < -FACE_AUTH_CONFIG.headTurnAsymmetryThreshold;
}

/** Returns true jika kepala menghadap lurus ke depan */
export function isFacingForward(landmarks: FaceLandmarks): boolean {
  return Math.abs(headAsymmetry(landmarks)) < FACE_AUTH_CONFIG.headTurnAsymmetryThreshold / 2;
}

// ── Challenge Helpers ─────────────────────────────────────────────────────────

const ALL_CHALLENGES: LivenessChallenge[] = ['BLINK', 'TURN_LEFT', 'TURN_RIGHT'];

/**
 * Generate urutan challenge yang random, tidak berulang dua kali berturut-turut.
 * Challenge count diambil dari config.
 */
export function generateChallengeSequence(
  count = FACE_AUTH_CONFIG.challengeCount
): LivenessChallenge[] {
  const result: LivenessChallenge[] = [];
  let last: LivenessChallenge | null = null;

  for (let i = 0; i < count; i++) {
    const available = ALL_CHALLENGES.filter((c) => c !== last);
    const pick = available[Math.floor(Math.random() * available.length)];
    result.push(pick);
    last = pick;
  }

  return result;
}

/** Teks instruksi bahasa Indonesia per challenge */
export function challengeInstruction(challenge: LivenessChallenge): string {
  switch (challenge) {
    case 'BLINK':
      return 'Kedipkan mata kamu';
    case 'TURN_LEFT':
      return 'Hadapkan wajah sedikit ke kiri';
    case 'TURN_RIGHT':
      return 'Hadapkan wajah sedikit ke kanan';
  }
}

/** Ikon per challenge */
export function challengeIcon(challenge: LivenessChallenge): string {
  switch (challenge) {
    case 'BLINK':
      return '👁️';
    case 'TURN_LEFT':
      return '⬅️';
    case 'TURN_RIGHT':
      return '➡️';
  }
}
