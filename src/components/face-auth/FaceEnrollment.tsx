'use client';

// ─────────────────────────────────────────────────────────────────────────────
// FaceEnrollment
// Ambil N sampel embedding dan simpan ke IndexedDB.
// Digunakan di /admin/setup-face.
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
} from '@mantine/core';
import {
  IconAlertCircle,
  IconCheck,
  IconCamera,
} from '@tabler/icons-react';

import { FaceCamera } from './FaceCamera';

import { loadFaceModels } from '@/lib/face/model-loader';
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

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mountedRef = useRef(true);

  const required = FACE_AUTH_CONFIG.requiredSamples;

  useEffect(() => {
    mountedRef.current = true;
    loadFaceModels()
      .then(() => {
        if (mountedRef.current) {
          setEnrollState('idle');
          setCameraState('requesting-camera');
        }
      })
      .catch(() => {
        if (mountedRef.current) {
          setErrorMsg('Modul verifikasi wajah gagal dimuat. Silakan refresh halaman.');
          setEnrollState('error');
        }
      });

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const handleStreamReady = useCallback((video: HTMLVideoElement) => {
    videoRef.current = video;
    setCameraState('detecting');
    setEnrollState('capturing');
  }, []);

  /** Tangkap satu sampel secara manual saat user klik tombol */
  const captureSample = useCallback(async () => {
    if (!videoRef.current || isCapturing) return;

    setIsCapturing(true);
    setErrorMsg(null);

    try {
      // Validasi: harus ada tepat 1 wajah
      const detection = await detectFace(videoRef.current);

      if (!detection.detected) {
        setErrorMsg('Wajah belum terdeteksi. Pastikan wajah terlihat jelas di kamera.');
        setIsCapturing(false);
        return;
      }

      if (detection.faceCount > 1) {
        setErrorMsg('Pastikan hanya satu orang berada di depan kamera.');
        setIsCapturing(false);
        return;
      }

      // Ambil embedding
      const result = await createEmbeddingForEnrollment(videoRef.current);

      if (!result) {
        setErrorMsg('Foto wajah belum cukup jelas. Coba lebih dekat ke kamera.');
        setIsCapturing(false);
        return;
      }

      const newSamples = [...samples, result.embedding];
      setSamples(newSamples);
      setCameraState('face-detected');

      // Brief flash
      setTimeout(() => {
        if (mountedRef.current) setCameraState('detecting');
      }, 400);

      // Auto-save jika sudah cukup
      if (newSamples.length >= required) {
        await saveProfile(newSamples);
      }
    } catch {
      setErrorMsg('Terjadi kesalahan. Silakan coba lagi.');
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
        setErrorMsg('Gagal menyimpan profil. Pastikan browser tidak dalam mode privat.');
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

  const progressPercent = Math.round((samples.length / required) * 100);

  return (
    <Stack gap={20} align="center">
      <FaceCamera
        state={cameraState}
        size={300}
        onStreamReady={handleStreamReady}
        onError={() => {
          setCameraState('error');
          setErrorMsg('Akses kamera diperlukan untuk enrollment wajah.');
        }}
      />

      {/* Progress */}
      {enrollState !== 'done' && (
        <Stack gap={6} style={{ width: '100%', maxWidth: 300 }}>
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              Sampel wajah
            </Text>
            <Badge color={samples.length >= required ? 'teal' : 'yellow'} variant="light">
              {samples.length} / {required}
            </Badge>
          </Group>
          <Progress
            value={progressPercent}
            color={samples.length >= required ? 'teal' : 'yellow'}
            size="sm"
            radius="xl"
            aria-label={`Progress enrollment: ${samples.length} dari ${required} sampel`}
          />
          <Text size="xs" c="dimmed" ta="center">
            Variasikan sudut wajah: lurus, sedikit kiri, sedikit kanan
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
        >
          <Text size="sm">{errorMsg}</Text>
        </Alert>
      )}

      {/* Done state */}
      {enrollState === 'done' ? (
        <Stack gap={8} align="center" style={{ width: '100%', maxWidth: 300 }}>
          <Alert
            icon={<IconCheck size={16} />}
            color="teal"
            radius="md"
            title="Enrollment berhasil"
          >
            <Text size="sm">
              {samples.length} sampel wajah berhasil disimpan.
            </Text>
          </Alert>
          <Button
            fullWidth
            color="navy.7"
            onClick={onDone}
            size="md"
          >
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
            disabled={
              enrollState === 'idle' ||
              enrollState === 'saving' ||
              enrollState === 'error' ||
              cameraState === 'loading-models' ||
              cameraState === 'requesting-camera'
            }
          >
            {isCapturing ? 'Mengambil sampel...' : 'Ambil Sampel'}
          </Button>

          {samples.length > 0 && (
            <Button
              fullWidth
              size="sm"
              variant="subtle"
              color="gray"
              onClick={handleReset}
            >
              Ulang dari awal
            </Button>
          )}
        </Stack>
      )}
    </Stack>
  );
}
