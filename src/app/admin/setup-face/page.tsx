'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Stack,
  Title,
  Text,
  Alert,
  Badge,
  Group,
  Paper,
  List,
  ThemeIcon,
} from '@mantine/core';
import {
  IconInfoCircle,
  IconCheck,
  IconShieldCheck,
} from '@tabler/icons-react';

import { FaceAuthGuard } from '@/components/face-auth/FaceAuthGuard';
import { FaceEnrollment } from '@/components/face-auth/FaceEnrollment';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { getSession } from '@/lib/auth/admin-auth';
import { hasFaceProfile } from '@/lib/auth/admin-storage';
import { FACE_AUTH_CONFIG } from '@/lib/config/face-auth.config';

export default function SetupFacePage() {
  const router = useRouter();
  const [adminId, setAdminId] = useState<string | null>(null);
  const [alreadyEnrolled, setAlreadyEnrolled] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session) return; // Guard akan handle redirect

    setAdminId(session.adminId);

    hasFaceProfile(session.adminId).then((has) => {
      setAlreadyEnrolled(has);
      setChecked(true);
    });
  }, []);

  const handleEnrollDone = () => {
    router.replace('/admin/dashboard');
  };

  if (!checked || !adminId) return null;

  return (
    <FaceAuthGuard>
      <AdminLayout activePage="setup-face">
        <Container size={560} py={24}>
          <Stack gap={24}>
            {/* Header */}
            <div>
              <Group gap={8} mb={4}>
                <IconShieldCheck size={20} color="#D4AF37" />
                <Title order={2} fw={700} c="#0A192F" size="h3">
                  Setup Verifikasi Wajah
                </Title>
              </Group>
              <Text c="dimmed" size="sm">
                Daftarkan wajah kamu untuk mengaktifkan face authentication.
              </Text>
            </div>

            {/* Warning jika sudah enrolled */}
            {alreadyEnrolled && (
              <Alert
                icon={<IconInfoCircle size={16} />}
                color="yellow"
                radius="md"
                title="Profil wajah sudah ada"
              >
                <Text size="sm">
                  Kamu sudah pernah mendaftarkan wajah. Proses ini akan
                  menimpa data wajah sebelumnya.
                </Text>
              </Alert>
            )}

            {/* Instruksi */}
            <Paper withBorder radius="md" p="md" style={{ borderColor: '#E2E8F0' }}>
              <Text size="sm" fw={500} c="#0A192F" mb={10}>
                Panduan enrollment:
              </Text>
              <List
                spacing={6}
                size="sm"
                c="dimmed"
                icon={
                  <ThemeIcon color="yellow" size={16} radius="xl" variant="light">
                    <IconCheck size={10} />
                  </ThemeIcon>
                }
              >
                <List.Item>Pastikan pencahayaan cukup dan merata</List.Item>
                <List.Item>
                  Ambil {FACE_AUTH_CONFIG.requiredSamples} sampel dengan variasi
                  sudut: lurus, sedikit ke kiri, sedikit ke kanan
                </List.Item>
                <List.Item>Wajah harus terlihat jelas, tidak buram</List.Item>
                <List.Item>Hindari menggunakan kacamata hitam</List.Item>
                <List.Item>Klik tombol &quot;Ambil Sampel&quot; untuk setiap foto</List.Item>
              </List>
            </Paper>

            {/* Privacy notice */}
            <Alert
              icon={<IconInfoCircle size={16} />}
              color="gray"
              variant="light"
              radius="md"
            >
              <Text size="xs" c="dimmed">
                Sistem menyimpan representasi numerik wajah (embedding) untuk
                proses verifikasi lokal. Foto kamera tidak disimpan dan tidak
                diunggah ke server.
              </Text>
            </Alert>

            {/* Enrollment component */}
            <Paper withBorder radius="md" p="lg" style={{ borderColor: '#E2E8F0' }}>
              <Stack align="center" gap={16}>
                <Badge color="yellow" variant="light" size="sm">
                  Model: {FACE_AUTH_CONFIG.modelVersion}
                </Badge>
                <FaceEnrollment
                  adminId={adminId}
                  modelVersion={FACE_AUTH_CONFIG.modelVersion}
                  onDone={handleEnrollDone}
                />
              </Stack>
            </Paper>
          </Stack>
        </Container>
      </AdminLayout>
    </FaceAuthGuard>
  );
}
