'use client';

// ─────────────────────────────────────────────────────────────────────────────
// FaceEnrollment
// Ambil N sampel embedding dan simpan ke IndexedDB.
// Fix: sequential init (models → camera), progress bar nyata, retry.
// ─────────────────────────────────────────────────────────────────────────────

import {
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';
import {
  Stack,
  Text,
  Button,
  Progress,
  Alert,
  Badge,
  Group,
  Box,
} from '@mantine/core';
import {
  IconAlertCircle,
  IconCheck,
  IconCamera,
  IconRefresh,
} from '@tabler/icons-react';

import { FaceCamera } from './FaceCamera';
import { loadFaceModels, onModelLoadProgress } from '@/lib/face/model-loader';
import { detectFace } from '@/lib/face/detector';
import { createEmbeddingForEnrollment } from '@/lib/face/embedding';
import { saveFaceProfile } from '@/lib/auth/admin-storage';
import { FACE_AUTH_CONFIG } from '@/lib/config/face-auth.config';

import type { FaceAuthState, FaceEmbedding, EnrollmentState } from '@/types/face-auth';

interface FaceEnrollmentProps {
  adminId: string;
  modelVersion?: string;
  onDone: () => void;
}

export function FaceEnrollment({
  adminId,
  modelVersion = FACE_AUTH_CONFIG.modelVersion,
  onDone,
}: FaceEnrollmentProps) {
  const [enrollState, setEnrollState] = useState<EnrollmentState>('idle');
  const [cameraState, setCameraState] = useState<FaceAuthState>('loading-models');
  const [samples, setSamples] = useState<FaceEmbedding[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [modelProgress, setModelProgress] = useState(0);
  const [modelLabel, setModelLabel] = useState('Menyiapkan modul AI...');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mountedRef = useRef(true);

  const required = FACE_AUTH_CONFIG.requiredSamples;

  // ── Init: load models dulu, BARU camera ────────────────────────────────

  useEffect(() => {
    mountedRef.current = true;

    // Subscribe ke progress agar progress bar bergerak
    const unsub = onModelLoadProgress((progress) => {
      if (!mountedRef.current) return;
      setModelProgress(progress);
      if (progress < 35) setModelLabel('Memuat detektor wajah...');
      else if (progress < 65) setModelLabel('Memuat landmark model...');
      else if (progress < 100) setModelLabel('Memuat recognition model...');
      else setModelLabel('Model siap');
    });

    loadFaceModels()
      .then(() => {
        if (!mountedRef.current) return;
        // Model selesai → buka kamera (FaceCamera akan react karena state berubah)
        setCameraState('requesting-camera');
        setEnrollState('idle');
      })
      .catch(() => {
        if (!mountedRef.current) return;
        setErrorMsg('Modul AI gagal dimuat. Coba refresh halaman.');
        setEnrollState('error');
        setCameraState('error');
      });

    return () => {
      mountedRef.current = false;
      unsub();
    };
  }, []);

  // ── Camera ready callback ──────────────────────────────────────────────

  const handleStreamReady = useCallback((video: HTMLVideoElement) => {
    videoRef.current = video;
    setCameraState('detecting');
    setEnrollState('capturing');
  }, []);

  // ── Capture sampel ────────────────────────────────────────────────────

  const captureSample = useCallback(async () => {
    if (!videoRef.current || isCapturing) return;

    setIsCapturing(true);
    setErrorMsg(null);

    try {
      const detection = await detectFace(videoRef.current);

      if (detection.faceCount > 1) {
        setErrorMsg('Pastikan hanya satu orang berada di depan kamera.');
        return;
      }

      if (!detection.detected) {
        setErrorMsg(
          'Wajah belum terdeteksi. Pastikan pencahayaan cukup dan wajah terlihat jelas.'
        );
        return;
      }

      const result = await createEmbeddingForEnrollment(videoRef.current);
      if (!result) {
        setErrorMsg('Wajah tidak cukup jelas. Coba lebih dekat ke kamera.');
        return;
      }

      const newSamples = [...samples, result.embedding];
      setSamples(newSamples);

      // Flash feedback
      setCameraState('face-detected');
      setTimeout(() => {
        if (mountedRef.current) setCameraState('detecting');
      }, 500);

      if (newSamples.length >= required) {
        await saveProfile(newSamples);
      }
    } catch {
      setErrorMsg('Terjadi kesalahan saat mengambil sampel. Coba lagi.');
    } finally {
      if (mountedRef.current) setIsCapturing(false);
    }
  }, [isCapturing, samples, required]);

  const saveProfile = async (embeddings: FaceEmbedding[]) => {
    setEnrollState('saving');
    setCameraState('recognizing');
    try {
      const now = new Date().toISOString();
      await saveFaceProfile({
        adminId,
        version: 1,
        modelVersion,
        embeddings,
        createdAt: now,
        updatedAt: now,
      });
      if (mountedRef.current) {
        setEnrollState('done');
        setCameraState('success');
      }
    } catch {
      if (mountedRef.current) {
        setErrorMsg('Gagal menyimpan. Pastikan browser tidak dalam mode privat.');
        setEnrollState('error');
      }
    }
  };

  const handleReset = () => {
    setSamples([]);
    setErrorMsg(null);
    setEnrollState('capturing');
    setCameraState('detecting');
  };

  const isModelLoading = cameraState === 'loading-models';
  const isCameraWaiting = cameraState === 'requesting-camera';
  const isReady = enrollState === 'capturing' || enrollState === 'idle';
  const progressPercent = Math.round((samples.length / required) * 100);

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <Stack gap={20} align="center">

      {/* Model loading progress — tampil terpisah agar jelas */}
      {isModelLoading && (
        <Box style={{ width: '100%', maxWidth: 300 }}>
          <Text size="xs" c="dimmed" mb={6} ta="center">
            {modelLabel}
          </Text>
          <Progress
            value={modelProgress}
            color="yellow"
            size="sm"
            radius="xl"
            animated
            aria-label="Progress loading model AI"
          />
          <Text size="xs" c="dimmed" ta="center" mt={4}>
            {modelProgress}% — Pertama kali mungkin 10–30 detik
          </Text>
        </Box>
      )}

      {/* Camera */}
      <FaceCamera
        state={cameraState}
        size={300}
        onStreamReady={handleStreamReady}
        onError={() => {
          setCameraState('error');
          setErrorMsg('Akses kamera diperlukan. Izinkan kamera di browser kamu.');
        }}
      />

      {/* Sample progress — tampil setelah camera aktif */}
      {!isModelLoading && !isCameraWaiting && enrollState !== 'done' && (
        <Stack gap={6} style={{ width: '100%', maxWidth: 300 }}>
          <Group justify="space-between">
            <Text size="sm" c="dimmed">Sampel wajah</Text>
            <Badge
              color={samples.length >= required ? 'teal' : 'yellow'}
              variant="light"
            >
              {samples.length} / {required}
            </Badge>
          </Group>
          <Progress
            value={progressPercent}
            color={samples.length >= required ? 'teal' : 'yellow'}
            size="sm"
            radius="xl"
            aria-label={`Progress enrollment: ${samples.length} dari ${required}`}
          />
          <Text size="xs" c="dimmed" ta="center">
            Variasikan sudut: lurus · sedikit kiri · sedikit kanan
          </Text>
        </Stack>
      )}

      {/* Error */}
      {errorMsg && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          color="red"
          radius="md"
          style={{ width: '100%', maxWidth: 300 }}
          withCloseButton
          onClose={() => setErrorMsg(null)}
        >
          <Text size="sm">{errorMsg}</Text>
        </Alert>
      )}

      {/* Selesai */}
      {enrollState === 'done' ? (
        <Stack gap={8} align="center" style={{ width: '100%', maxWidth: 300 }}>
          <Alert
            icon={<IconCheck size={16} />}
            color="teal"
            radius="md"
            title="Enrollment berhasil"
          >
            <Text size="sm">{samples.length} sampel wajah berhasil disimpan.</Text>
          </Alert>
          <Button fullWidth color="navy.7" onClick={onDone} size="md" radius="md">
            Selesai
          </Button>
        </Stack>
      ) : (
        <Stack gap={8} style={{ width: '100%', maxWidth: 300 }}>
          <Button
            fullWidth
            size="md"
            color="yellow"
            variant="filled"
            leftSection={<IconCamera size={16} />}
            onClick={captureSample}
            loading={isCapturing}
            radius="md"
            disabled={
              isModelLoading ||
              isCameraWaiting ||
              enrollState === 'error' ||
              enrollState === 'saving'
            }
          >
            {isCapturing ? 'Mengambil...' : 'Ambil Sampel'}
          </Button>

          {enrollState === 'error' && (
            <Button
              fullWidth
              size="sm"
              variant="light"
              color="gray"
              leftSection={<IconRefresh size={14} />}
              onClick={() => window.location.reload()}
              radius="md"
            >
              Refresh Halaman
            </Button>
          )}

          {samples.length > 0 && enrollState !== 'error' && (
            <Button
              fullWidth
              size="sm"
              variant="subtle"
              color="gray"
              onClick={handleReset}
              radius="md"
            >
              Ulang dari awal
            </Button>
          )}
        </Stack>
      )}
    </Stack>
  );
}
