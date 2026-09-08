'use client';

// ─────────────────────────────────────────────────────────────────────────────
// FaceVerification
// Orkestrasi penuh: load models → camera → detect → liveness → embed → match.
// Dipanggil dari /admin/login setelah password verified.
// ─────────────────────────────────────────────────────────────────────────────

import {
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';
import { Stack, Text, Alert, Button, Progress, Box } from '@mantine/core';
import { IconAlertCircle, IconRefresh } from '@tabler/icons-react';

import { FaceCamera } from './FaceCamera';
import { LivenessChallenge } from './LivenessChallenge';

import { loadFaceModels, onModelLoadProgress } from '@/lib/face/model-loader';
import { detectFace } from '@/lib/face/detector';
import { createEmbedding } from '@/lib/face/embedding';
import { bestMatch } from '@/lib/face/similarity';
import {
  isBlinking,
  isTurningLeft,
  isTurningRight,
  generateChallengeSequence,
} from '@/lib/face/liveness';
import { getFaceProfile } from '@/lib/auth/admin-storage';
import { FACE_AUTH_CONFIG } from '@/lib/config/face-auth.config';

import type {
  FaceAuthState,
  FaceAuthError,
  LivenessChallenge as LivenessChallengeType,
  FaceLandmarks,
} from '@/types/face-auth';

interface FaceVerificationProps {
  adminId: string;
  onSuccess: () => void;
  onFailure: (error: FaceAuthError) => void;
}

export function FaceVerification({
  adminId,
  onSuccess,
  onFailure,
}: FaceVerificationProps) {
  const [authState, setAuthState] = useState<FaceAuthState>('loading-models');
  const [error, setError] = useState<FaceAuthError | null>(null);
  const [modelProgress, setModelProgress] = useState(0);

  // Liveness state
  const [challenges, setChallenges] = useState<LivenessChallengeType[]>([]);
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [passedCount, setPassedCount] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const inferenceRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const elapsedRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const blinkFramesRef = useRef(0);
  const challengeStartRef = useRef(Date.now());
  const mountedRef = useRef(true);

  const stopInference = useCallback(() => {
    if (inferenceRef.current) clearInterval(inferenceRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (elapsedRef.current) clearInterval(elapsedRef.current);
    inferenceRef.current = null;
    timeoutRef.current = null;
    elapsedRef.current = null;
  }, []);

  const fail = useCallback(
    (err: FaceAuthError) => {
      stopInference();
      setError(err);
      setAuthState('failed');
      onFailure(err);
    },
    [stopInference, onFailure]
  );

  // ── Liveness inference loop ───────────────────────────────────────────────

  const startLivenessLoop = useCallback(
    (seq: LivenessChallengeType[], startIdx: number) => {
      setChallengeIndex(startIdx);
      setElapsedMs(0);
      challengeStartRef.current = Date.now();
      blinkFramesRef.current = 0;

      let localIdx = startIdx;
      let localPassed = startIdx;

      const checkChallenge = (landmarks: FaceLandmarks, challenge: LivenessChallengeType): boolean => {
        switch (challenge) {
          case 'BLINK': {
            if (isBlinking(landmarks)) {
              blinkFramesRef.current += 1;
            } else {
              if (blinkFramesRef.current >= FACE_AUTH_CONFIG.blinkFramesRequired) {
                blinkFramesRef.current = 0;
                return true;
              }
              blinkFramesRef.current = 0;
            }
            return false;
          }
          case 'TURN_LEFT':
            return isTurningLeft(landmarks);
          case 'TURN_RIGHT':
            return isTurningRight(landmarks);
        }
      };

      // Elapsed timer
      elapsedRef.current = setInterval(() => {
        if (!mountedRef.current) return;
        setElapsedMs(Date.now() - challengeStartRef.current);
      }, 100);

      // Per-challenge timeout
      const armTimeout = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          if (!mountedRef.current) return;
          fail({
            code: 'liveness-timeout',
            message: 'Verifikasi kehadiran gagal. Silakan coba lagi.',
          });
        }, FACE_AUTH_CONFIG.livenessTimeoutMs);
      };

      armTimeout();

      inferenceRef.current = setInterval(async () => {
        if (!mountedRef.current || !videoRef.current) return;

        const detection = await detectFace(videoRef.current).catch(() => null);
        if (!detection?.detected || !detection.landmarks) return;

        const passed = checkChallenge(detection.landmarks, seq[localIdx]);
        if (!passed) return;

        // Challenge passed
        localPassed = localIdx + 1;
        setPassedCount(localPassed);

        if (localPassed >= seq.length) {
          // All challenges done → extract embedding
          stopInference();
          if (!mountedRef.current) return;
          setAuthState('recognizing');
          await runRecognition();
          return;
        }

        // Next challenge
        localIdx = localPassed;
        setChallengeIndex(localIdx);
        setElapsedMs(0);
        challengeStartRef.current = Date.now();
        blinkFramesRef.current = 0;
        armTimeout();
      }, FACE_AUTH_CONFIG.inferenceIntervalMs);
    },
    [fail, stopInference]
  );

  // ── Recognition ───────────────────────────────────────────────────────────

  const runRecognition = useCallback(async () => {
    if (!videoRef.current) {
      fail({ code: 'recognition-failed', message: 'Wajah tidak cocok dengan akun ini.' });
      return;
    }

    try {
      const profile = await getFaceProfile(adminId);
      if (!profile || profile.embeddings.length === 0) {
        fail({ code: 'no-face-profile', message: 'Face authentication belum diaktifkan.' });
        return;
      }

      const liveEmbedding = await createEmbedding(videoRef.current);
      if (!liveEmbedding) {
        fail({ code: 'recognition-failed', message: 'Wajah tidak cocok dengan akun ini.' });
        return;
      }

      const result = bestMatch(liveEmbedding, profile.embeddings);

      if (!result.matched) {
        fail({ code: 'recognition-failed', message: 'Wajah tidak cocok dengan akun ini.' });
        return;
      }

      if (mountedRef.current) {
        setAuthState('success');
        onSuccess();
      }
    } catch {
      fail({ code: 'recognition-failed', message: 'Wajah tidak cocok dengan akun ini.' });
    }
  }, [adminId, fail, onSuccess]);

  // ── Face detection phase ──────────────────────────────────────────────────

  const startDetectionLoop = useCallback(() => {
    setAuthState('detecting');

    inferenceRef.current = setInterval(async () => {
      if (!mountedRef.current || !videoRef.current) return;

      const detection = await detectFace(videoRef.current).catch(() => null);
      if (!detection) return;

      if (detection.faceCount > 1) return; // Biarkan loop jalan
      if (!detection.detected) return;

      // Wajah terdeteksi — mulai liveness
      stopInference();
      if (!mountedRef.current) return;

      setAuthState('face-detected');
      await new Promise((r) => setTimeout(r, 600)); // Brief pause untuk UX
      if (!mountedRef.current) return;

      setAuthState('liveness');
      const seq = generateChallengeSequence();
      setChallenges(seq);
      startLivenessLoop(seq, 0);
    }, FACE_AUTH_CONFIG.inferenceIntervalMs);
  }, [stopInference, startLivenessLoop]);

  // ── Init ──────────────────────────────────────────────────────────────────

  const init = useCallback(async () => {
    try {
      await loadFaceModels();
      if (!mountedRef.current) return;
      setAuthState('requesting-camera');
    } catch {
      fail({ code: 'model-load-failed', message: 'Modul verifikasi wajah gagal dimuat. Silakan refresh halaman.' });
    }
  }, [fail]);

  useEffect(() => {
    mountedRef.current = true;
    init();
    return () => {
      mountedRef.current = false;
      stopInference();
    };
  }, [init, stopInference]);

  const handleStreamReady = useCallback(
    (video: HTMLVideoElement) => {
      videoRef.current = video;
      startDetectionLoop();
    },
    [startDetectionLoop]
  );

  const handleRetry = () => {
    setError(null);
    setPassedCount(0);
    setChallengeIndex(0);
    setChallenges([]);
    setElapsedMs(0);
    setAuthState('loading-models');
    init();
  };

  return (
    <Stack gap={16} align="center">
      <FaceCamera
        state={authState}
        size={300}
        onStreamReady={handleStreamReady}
        onError={() =>
          fail({
            code: 'camera-denied',
            message: 'Akses kamera diperlukan untuk verifikasi wajah.',
          })
        }
      />

      {/* Liveness challenge UI */}
      {authState === 'liveness' && challenges.length > 0 && (
        <div style={{ width: '100%', maxWidth: 300 }}>
          <LivenessChallenge
            challenges={challenges}
            currentIndex={challengeIndex}
            passedCount={passedCount}
            timeoutMs={FACE_AUTH_CONFIG.livenessTimeoutMs}
            elapsedMs={elapsedMs}
          />
        </div>
      )}

      {/* Error */}
      {error && authState === 'failed' && (
        <Stack gap={8} style={{ width: '100%', maxWidth: 300 }}>
          <Alert
            icon={<IconAlertCircle size={16} />}
            color="red"
            radius="md"
            title="Verifikasi gagal"
          >
            <Text size="sm">{error.message}</Text>
          </Alert>
          <Button
            variant="light"
            color="gray"
            size="sm"
            leftSection={<IconRefresh size={14} />}
            onClick={handleRetry}
            fullWidth
          >
            Coba Lagi
          </Button>
        </Stack>
      )}
    </Stack>
  );
}
