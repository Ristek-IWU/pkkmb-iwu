'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Paper,
  Stack,
  Title,
  Text,
  TextInput,
  PasswordInput,
  Button,
  Alert,
  Group,
  Divider,
  Badge,
} from '@mantine/core';
import {
  IconAlertCircle,
  IconShieldCheck,
  IconLock,
} from '@tabler/icons-react';

import { FaceVerification } from '@/components/face-auth/FaceVerification';
import {
  verifyPassword,
  createSession,
  incrementAttempt,
  resetAttempts,
  getAttemptCount,
  isLockedOut,
  setLockout,
  lockoutRemainingSeconds,
} from '@/lib/auth/admin-auth';
import { hasFaceProfile } from '@/lib/auth/admin-storage';
import { FACE_AUTH_CONFIG } from '@/lib/config/face-auth.config';
import type { AdminAccount, FaceAuthError } from '@/types/face-auth';

type LoginStep = 'credentials' | 'face' | 'success';

export default function AdminLoginPage() {
  const router = useRouter();

  const [step, setStep] = useState<LoginStep>('credentials');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [verifiedAdmin, setVerifiedAdmin] = useState<AdminAccount | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Step 1: Password verification ────────────────────────────────────────

  const handleCredentialSubmit = useCallback(async () => {
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Username dan password wajib diisi.');
      return;
    }

    if (isLockedOut()) {
      const secs = lockoutRemainingSeconds();
      setErrorMsg(
        `Terlalu banyak percobaan gagal. Coba lagi dalam ${secs} detik.`
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const admin = await verifyPassword(username.trim(), password);

      if (!admin) {
        const count = incrementAttempt();
        if (count >= FACE_AUTH_CONFIG.maxLoginAttempts) {
          setLockout();
          setErrorMsg(
            `Login gagal ${count}x. Akun terkunci sementara. Coba lagi dalam beberapa menit.`
          );
        } else {
          setErrorMsg(
            `Username atau password salah. (${count}/${FACE_AUTH_CONFIG.maxLoginAttempts} percobaan)`
          );
        }
        return;
      }

      // Cek apakah face profile sudah ada
      const hasProfile = await hasFaceProfile(admin.id);
      if (!hasProfile) {
        // Password benar tapi belum enrollment — buat session terbatas, redirect setup
        createSession(admin);
        router.replace('/admin/setup-face');
        return;
      }

      setVerifiedAdmin(admin);
      setStep('face');
    } catch {
      setErrorMsg('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  }, [username, password, router]);

  // ── Step 2: Face verification result ─────────────────────────────────────

  const handleFaceSuccess = useCallback(() => {
    if (!verifiedAdmin) return;
    resetAttempts();
    createSession(verifiedAdmin);
    setStep('success');
    setTimeout(() => router.replace('/admin/dashboard'), 800);
  }, [verifiedAdmin, router]);

  const handleFaceFailure = useCallback((err: FaceAuthError) => {
    if (
      err.code === 'recognition-failed' ||
      err.code === 'liveness-failed' ||
      err.code === 'liveness-timeout'
    ) {
      const count = incrementAttempt();
      if (count >= FACE_AUTH_CONFIG.maxLoginAttempts) {
        setLockout();
        setStep('credentials');
        setErrorMsg('Terlalu banyak percobaan gagal. Akun terkunci sementara.');
      }
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#F8FAFC',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
      }}
    >
      <Container size={480} w="100%">
        {/* Header */}
        <Stack align="center" gap={6} mb={32}>
          <Group gap={8}>
            <IconShieldCheck size={24} color="#D4AF37" />
            <Text fw={700} size="lg" c="#0A192F">
              IWU Admin
            </Text>
          </Group>
          <Text size="sm" c="dimmed">
            Verifikasi identitas untuk masuk ke panel admin
          </Text>
          <Badge color="yellow" variant="light" size="sm">
            PKKMB 2026
          </Badge>
        </Stack>

        <Paper
          withBorder
          radius="md"
          p="xl"
          style={{ borderColor: '#E2E8F0' }}
        >
          {/* Step indicator */}
          <Group gap={8} mb={24}>
            <StepDot
              num={1}
              label="Kredensial"
              active={step === 'credentials'}
              done={step === 'face' || step === 'success'}
            />
            <div
              style={{
                flex: 1,
                height: 1,
                backgroundColor:
                  step === 'face' || step === 'success'
                    ? '#D4AF37'
                    : '#E2E8F0',
                transition: 'background-color 0.3s',
              }}
            />
            <StepDot
              num={2}
              label="Wajah"
              active={step === 'face'}
              done={step === 'success'}
            />
          </Group>

          {/* ── Step 1: Credentials ── */}
          {step === 'credentials' && (
            <Stack gap={16}>
              <div>
                <Title order={3} fw={600} c="#0A192F" mb={4}>
                  Masuk ke Panel Admin
                </Title>
                <Text size="sm" c="dimmed">
                  Masukkan username dan password kamu
                </Text>
              </div>

              {errorMsg && (
                <Alert
                  icon={<IconAlertCircle size={16} />}
                  color="red"
                  radius="md"
                >
                  <Text size="sm">{errorMsg}</Text>
                </Alert>
              )}

              <TextInput
                label="Username"
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCredentialSubmit()}
                autoComplete="username"
                size="md"
                radius="md"
              />

              <PasswordInput
                label="Password"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCredentialSubmit()}
                autoComplete="current-password"
                leftSection={<IconLock size={16} />}
                size="md"
                radius="md"
              />

              <Button
                fullWidth
                size="md"
                color="navy.7"
                loading={isSubmitting}
                onClick={handleCredentialSubmit}
                mt={4}
                radius="md"
              >
                Lanjutkan
              </Button>

              <Divider />

              <Text size="xs" c="dimmed" ta="center">
                Foto kamu diproses langsung di perangkat dan tidak diunggah ke
                server.
              </Text>
            </Stack>
          )}

          {/* ── Step 2: Face verification ── */}
          {step === 'face' && verifiedAdmin && (
            <Stack gap={16}>
              <div>
                <Title order={3} fw={600} c="#0A192F" mb={4}>
                  Verifikasi Wajah
                </Title>
                <Text size="sm" c="dimmed">
                  Halo, <strong>{verifiedAdmin.displayName}</strong>. Ikuti
                  instruksi di layar untuk memverifikasi identitas.
                </Text>
              </div>

              <FaceVerification
                adminId={verifiedAdmin.id}
                onSuccess={handleFaceSuccess}
                onFailure={handleFaceFailure}
              />

              <Button
                variant="subtle"
                color="gray"
                size="sm"
                onClick={() => {
                  setStep('credentials');
                  setVerifiedAdmin(null);
                  setErrorMsg(null);
                }}
              >
                ← Kembali
              </Button>
            </Stack>
          )}

          {/* ── Step 3: Success ── */}
          {step === 'success' && (
            <Stack align="center" gap={12} py={16}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(16,185,129,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IconShieldCheck size={28} color="#10B981" />
              </div>
              <Text fw={600} c="#0A192F">
                Identitas terverifikasi
              </Text>
              <Text size="sm" c="dimmed">
                Mengalihkan ke dashboard...
              </Text>
            </Stack>
          )}
        </Paper>
      </Container>
    </div>
  );
}

function StepDot({
  num,
  label,
  active,
  done,
}: {
  num: number;
  label: string;
  active: boolean;
  done: boolean;
}) {
  return (
    <Stack align="center" gap={4} style={{ flexShrink: 0 }}>
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          backgroundColor: done
            ? '#D4AF37'
            : active
            ? '#0A192F'
            : '#E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background-color 0.3s',
        }}
        aria-label={`Step ${num}: ${label}${done ? ' selesai' : active ? ' aktif' : ''}`}
      >
        <Text
          size="xs"
          fw={700}
          c={done || active ? 'white' : 'dimmed'}
        >
          {num}
        </Text>
      </div>
      <Text size="xs" c={active ? '#0A192F' : 'dimmed'} fw={active ? 500 : 400}>
        {label}
      </Text>
    </Stack>
  );
}
