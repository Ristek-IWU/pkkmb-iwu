'use client';

// ─────────────────────────────────────────────────────────────────────────────
// FaceCamera
// Handles camera stream lifecycle: request → stream → cleanup.
// Exposes videoRef untuk komponen parent.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { Text, Center, Loader, Stack } from '@mantine/core';
import { IconCameraOff } from '@tabler/icons-react';
import type { FaceAuthState, FaceBox } from '@/types/face-auth';

export interface FaceCameraHandle {
  video: HTMLVideoElement | null;
}

interface FaceCameraProps {
  state: FaceAuthState;
  /** Bounding box overlay (opsional, untuk visualisasi deteksi) */
  faceBox?: FaceBox | null;
  size?: number;
  onStreamReady?: (video: HTMLVideoElement) => void;
  onError?: (err: FaceAuthState) => void;
}

export const FaceCamera = forwardRef<FaceCameraHandle, FaceCameraProps>(
  function FaceCamera({ state, faceBox, size = 320, onStreamReady, onError }, ref) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    useImperativeHandle(ref, () => ({
      get video() {
        return videoRef.current;
      },
    }));

    useEffect(() => {
      // Jangan buka kamera saat masih loading models
      if (state === 'loading-models') return;

      let cancelled = false;

      async function startCamera() {
        if (!navigator.mediaDevices?.getUserMedia) {
          onError?.('error');
          return;
        }

        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: 'user',
              width: { ideal: 640 },
              height: { ideal: 480 },
            },
            audio: false,
          });

          if (cancelled) {
            stream.getTracks().forEach((t) => t.stop());
            return;
          }

          streamRef.current = stream;

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
              if (!cancelled && videoRef.current) {
                videoRef.current.play();
                onStreamReady?.(videoRef.current);
              }
            };
          }
        } catch (err) {
          if (cancelled) return;
          const name = err instanceof Error ? err.name : '';
          if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
            onError?.('error');
          } else {
            onError?.('error');
          }
        }
      }

      startCamera();

      return () => {
        cancelled = true;
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
      };
    }, [state, onStreamReady, onError]); // state sebagai dependency — re-run saat model selesai

    const isLoading =
      state === 'loading-models' || state === 'requesting-camera';
    const isError = state === 'error';

    return (
      <div
        style={{
          position: 'relative',
          width: size,
          height: size,
          borderRadius: 12,
          overflow: 'hidden',
          backgroundColor: '#0A192F',
          flexShrink: 0,
        }}
      >
        {/* Video element */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: 'scaleX(-1)', // Mirror untuk selfie
            display: isError ? 'none' : 'block',
          }}
        />

        {/* Face guide oval overlay */}
        {!isError && (
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                width: size * 0.6,
                height: size * 0.72,
                borderRadius: '50%',
                border: `2px solid ${
                  state === 'face-detected' || state === 'liveness' || state === 'recognizing'
                    ? '#D4AF37'
                    : 'rgba(255,255,255,0.3)'
                }`,
                transition: 'border-color 0.3s ease',
                boxShadow:
                  state === 'face-detected' || state === 'liveness'
                    ? '0 0 0 1px rgba(212,175,55,0.3)'
                    : 'none',
              }}
            />
          </div>
        )}

        {/* Loading overlay */}
        {isLoading && (
          <Center
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(10,25,47,0.85)',
            }}
          >
            <Stack align="center" gap={8}>
              <Loader size="sm" color="yellow" />
              <Text size="xs" c="dimmed" ta="center">
                {state === 'loading-models'
                  ? 'Menyiapkan verifikasi wajah...'
                  : 'Mengaktifkan kamera...'}
              </Text>
            </Stack>
          </Center>
        )}

        {/* Error overlay */}
        {isError && (
          <Center
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: '#0A192F',
            }}
          >
            <Stack align="center" gap={8}>
              <IconCameraOff size={32} color="#64748B" />
              <Text size="xs" c="dimmed" ta="center" px={16}>
                Kamera tidak tersedia
              </Text>
            </Stack>
          </Center>
        )}

        {/* Status badge */}
        {!isLoading && !isError && (
          <div
            style={{
              position: 'absolute',
              bottom: 10,
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'rgba(10,25,47,0.75)',
              backdropFilter: 'blur(4px)',
              borderRadius: 20,
              padding: '4px 12px',
              pointerEvents: 'none',
            }}
          >
            <Text size="xs" c="white" ta="center" style={{ whiteSpace: 'nowrap' }}>
              {statusLabel(state)}
            </Text>
          </div>
        )}
      </div>
    );
  }
);

function statusLabel(state: FaceAuthState): string {
  switch (state) {
    case 'detecting':
      return 'Posisikan wajah di dalam frame';
    case 'face-detected':
      return 'Wajah terdeteksi ✓';
    case 'liveness':
      return 'Ikuti instruksi...';
    case 'recognizing':
      return 'Memverifikasi identitas...';
    case 'success':
      return 'Identitas terverifikasi ✓';
    case 'failed':
      return 'Verifikasi gagal';
    default:
      return '';
  }
}
